import { readData, writeData, readTextFile, writeTextFile, MEDIA_LOG_MASTER } from '$lib/db';
import { safeJsonParse } from '$lib/utils';
import { notificationState } from '$lib/notificationState.svelte';
import type {
  MediaItem,
  MediaLogEvent,
  MediaLogKind,
  MediaProgressUnit,
  MediaVisibility
} from '../../../../shared/types';
import {
  eventsForMedia,
  localLogStamp,
  newLogEventId,
  publicEvents,
  sortEventsNewestFirst,
  statusForEvent,
  validStatusesForKind
} from '../../../../shared/lib/mediaLog';

export interface NewLogEvent {
  media_id: string;
  kind: MediaLogKind;
  at?: string;
  round?: number;
  unit?: MediaProgressUnit | null;
  value?: number;
  total?: number;
  note?: string;
  visibility?: MediaVisibility;
  /** Move the library item's status to match the event. Defaults to true. */
  updateStatus?: boolean;
  /** Explicit status to set on the media item (e.g. 'finished' vs 'rewishlist'). */
  targetStatus?: string;
}

/** The consumption kinds can all carry a round and an optional snapshot. */
const PROGRESS_KINDS = new Set<MediaLogKind>(['start', 'checkpoint', 'finish']);

function buildEvent(id: string, input: NewLogEvent): MediaLogEvent {
  const event: MediaLogEvent = {
    id,
    media_id: input.media_id,
    kind: input.kind,
    at: input.at?.trim() || localLogStamp(),
    visibility: input.visibility ?? 'private'
  };

  if (input.round && input.round > 1) event.round = input.round;
  // `finish` and `start` accept the same snapshot as a checkpoint, so a session
  // that also began or ended the work does not need a second entry.
  if (PROGRESS_KINDS.has(input.kind)) {
    if (input.unit) event.unit = input.unit;
    if (typeof input.value === 'number' && Number.isFinite(input.value)) event.value = input.value;
    if (typeof input.total === 'number' && Number.isFinite(input.total)) event.total = input.total;
  }
  if (input.note?.trim()) event.note = input.note.trim();

  return event;
}

/**
 * The media log's two-file contract:
 *
 * - `admin/data/media-log.json` — master, every event, gitignored.
 * - `site/src/data/media-log.json` — projection, public events only, committed.
 *
 * Every write updates both so the site never possesses a private event.
 */
class MediaLogState {
  events = $state<MediaLogEvent[]>([]);
  loaded = $state(false);
  loading = $state(false);
  error = $state('');

  get publicEvents(): MediaLogEvent[] {
    return publicEvents(this.events);
  }

  groupFor(mediaId: string) {
    return eventsForMedia(this.events, mediaId);
  }

  async load(force = false): Promise<void> {
    if (this.loaded && !force) return;
    this.loading = true;
    this.error = '';

    const text = await readTextFile(MEDIA_LOG_MASTER, { silent: true });
    if (text.isErr()) {
      // A missing master is a normal first run, not an error.
      this.events = [];
      this.loaded = true;
      this.loading = false;
      return;
    }

    const parsed = safeJsonParse(text.value).unwrapOr([]);
    this.events = Array.isArray(parsed) ? (parsed as MediaLogEvent[]) : [];
    this.loaded = true;
    this.loading = false;
  }

  private async persist(next: MediaLogEvent[]): Promise<boolean> {
    const master = await writeTextFile(
      MEDIA_LOG_MASTER,
      JSON.stringify(sortEventsNewestFirst(next), null, 2) + '\n'
    );
    if (master.isErr()) {
      this.error = master.error.message;
      notificationState.error(this.error, { title: 'Media Log' });
      return false;
    }

    // The master is the source of truth; reflect it in memory before the
    // projection so a projection failure cannot hide a saved event.
    this.events = next;
    this.loaded = true;

    const projection = await writeData('mediaLog', publicEvents(next));
    if (projection.isErr()) {
      this.error = projection.error.message;
      notificationState.error(this.error, { title: 'Media Log' });
      return false;
    }

    return true;
  }

  async addEvent(input: NewLogEvent): Promise<boolean> {
    await this.load();

    const event = buildEvent(newLogEventId(), input);
    if (!(await this.persist([...this.events, event]))) return false;

    if (input.updateStatus !== false) await this.nudgeStatus(event, input.targetStatus);
    notificationState.success('Logged.', { title: 'Media Log' });
    return true;
  }

  /** Rewrites one entry in place; the id and position in the file are kept. */
  async updateEvent(id: string, input: NewLogEvent): Promise<boolean> {
    await this.load();

    const index = this.events.findIndex((event) => event.id === id);
    if (index === -1) return false;

    const event = buildEvent(id, input);
    const next = [...this.events];
    next[index] = event;
    if (!(await this.persist(next))) return false;

    if (input.updateStatus !== false) await this.nudgeStatus(event, input.targetStatus);
    notificationState.success('Entry updated.', { title: 'Media Log' });
    return true;
  }

  async setVisibility(id: string, visibility: MediaVisibility): Promise<boolean> {
    await this.load();
    const next = this.events.map((event) => (event.id === id ? { ...event, visibility } : event));
    return this.persist(next);
  }

  async removeEvent(id: string): Promise<boolean> {
    await this.load();
    return this.persist(this.events.filter((event) => event.id !== id));
  }

  async removeForMedia(mediaId: string): Promise<void> {
    await this.load();
    const next = this.events.filter((event) => event.media_id !== mediaId);
    if (next.length !== this.events.length) await this.persist(next);
  }

  /** Keeps the shelf status roughly in sync with what was just logged. */
  private async nudgeStatus(event: MediaLogEvent, targetStatus?: string): Promise<void> {
    const valid = validStatusesForKind(event.kind);
    let status = targetStatus;
    if (!status || !valid.includes(status)) {
      status = statusForEvent(event.kind) ?? undefined;
    }
    if (!status) return;

    const items = (await readData<MediaItem>('media')).unwrapOr([]);
    const index = items.findIndex((item) => item.id === event.media_id);
    if (index === -1 || items[index].status === status) return;

    items[index] = { ...items[index], status };
    const saved = await writeData('media', items);
    if (saved.isErr()) {
      notificationState.error(saved.error.message, { title: 'Status Sync Failed' });
    }
  }
}

export const mediaLogState = new MediaLogState();
