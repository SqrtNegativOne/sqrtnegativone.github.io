import type {
  MediaItem,
  MediaLogEvent,
  MediaLogKind,
  MediaProgressUnit
} from '../types';

export const LOG_KIND_LABEL: Record<MediaLogKind, string> = {
  add: 'Added',
  start: 'Started',
  checkpoint: 'Checkpoint',
  finish: 'Finished',
  drop: 'Dropped',
  shelve: 'Shelved',
  resume: 'Resumed',
  note: 'Note'
};

export const PROGRESS_UNIT_LABEL: Record<MediaProgressUnit, string> = {
  episode: 'Episode',
  season: 'Season',
  page: 'Page',
  chapter: 'Chapter',
  hour: 'Hour',
  percent: 'Percent'
};

/** Sensible default checkpoint unit for each media type. */
const DEFAULT_UNIT: Record<string, MediaProgressUnit> = {
  book: 'page',
  show: 'episode',
  game: 'hour',
  movie: 'percent'
};

export function defaultUnitForType(type: string | undefined | null): MediaProgressUnit | null {
  return (type && DEFAULT_UNIT[type]) || null;
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/;

/**
 * Parses a log stamp as *local wall time* without `Date`'s ISO/Z handling, so a
 * `2026-10-20T21:14` entry is never shifted by the viewer's timezone.
 */
export function parseLogDate(at: string | null | undefined): Date | null {
  const match = DATE_RE.exec(at ?? '');
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4] ?? 0),
    Number(match[5] ?? 0)
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

export function logTimestamp(at: string | null | undefined): number {
  return parseLogDate(at)?.getTime() ?? 0;
}

/** `YYYY-MM-DDTHH:mm` in local time; used when creating an event. */
export function localLogStamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** `YYYY-MM-DD` in local time. */
export function todayStamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function newLogEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `evt_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
  return `evt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function sortEventsOldestFirst(events: MediaLogEvent[]): MediaLogEvent[] {
  return [...events].sort(
    (a, b) => logTimestamp(a.at) - logTimestamp(b.at) || a.id.localeCompare(b.id)
  );
}

export function sortEventsNewestFirst(events: MediaLogEvent[]): MediaLogEvent[] {
  return [...events].sort(
    (a, b) => logTimestamp(b.at) - logTimestamp(a.at) || a.id.localeCompare(b.id)
  );
}

export function publicEvents(events: MediaLogEvent[]): MediaLogEvent[] {
  return events.filter((event) => event.visibility === 'public');
}

export function eventsForMedia(events: MediaLogEvent[], mediaId: string): MediaLogEvent[] {
  return sortEventsNewestFirst(events.filter((event) => event.media_id === mediaId));
}

/** `20 Oct 2026`, optionally `, 21:14` when the stamp has a time. */
export function formatLogDate(at: string | null | undefined, withTime = false): string {
  const date = parseLogDate(at);
  if (!date) return at ?? '';
  const body = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  if (!withTime || !/T\d{2}:\d{2}/.test(at ?? '')) return body;
  return `${body}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** `Episode 4 of 8`, `Page 120`, `12h / 20h`, `42%`, or `In progress`. */
export function formatCheckpoint(event: MediaLogEvent): string {
  if (event.value === undefined || event.value === null) return 'In progress';
  const value = event.value;
  const total = event.total ? ` of ${event.total}` : '';
  switch (event.unit) {
    case 'episode':
      return `Episode ${value}${total}`;
    case 'season':
      return `Season ${value}${total}`;
    case 'page':
      return `Page ${value}${total}`;
    case 'chapter':
      return `Chapter ${value}${total}`;
    case 'hour':
      return event.total ? `${value}h / ${event.total}h` : `${value}h`;
    case 'percent':
      return `${value}%`;
    default:
      return String(value);
  }
}

/** The verb phrase for an event kind; `checkpoint` supplies its own detail. */
export function eventVerb(kind: MediaLogKind): string {
  return LOG_KIND_LABEL[kind];
}

export function eventHeadline(event: MediaLogEvent, title: string): string {
  if (event.kind === 'checkpoint') return formatCheckpoint(event);
  return `${LOG_KIND_LABEL[event.kind]} ${title}`;
}

export function isRepeatRound(event: MediaLogEvent): boolean {
  return (event.round ?? 1) > 1;
}

/** The status an event should nudge the library item toward, if any. */
export function statusForEvent(kind: MediaLogKind): string | null {
  switch (kind) {
    case 'start':
    case 'checkpoint':
    case 'resume':
      return 'consuming';
    case 'finish':
      return 'finished';
    case 'drop':
      return 'dropped';
    case 'shelve':
      return 'shelved';
    default:
      return null;
  }
}

export interface MediaHistory {
  /** Earliest `start` event. */
  startedAt: string | null;
  /** Latest `finish` event. */
  finishedAt: string | null;
  /** Most recent checkpoint. */
  lastCheckpoint: MediaLogEvent | null;
  /** Every finish, oldest first; length is the number of completed passes. */
  finishes: MediaLogEvent[];
  /** Highest round seen on any consume event. */
  round: number;
  /** A start/resume/checkpoint newer than the last finish/drop/shelve. */
  isActive: boolean;
}

export function deriveMediaHistory(events: MediaLogEvent[]): MediaHistory {
  const sorted = sortEventsOldestFirst(events);
  const starts = sorted.filter((event) => event.kind === 'start');
  const finishes = sorted.filter((event) => event.kind === 'finish');
  const checkpoints = sorted.filter((event) => event.kind === 'checkpoint');
  const round = sorted.reduce((max, event) => Math.max(max, event.round ?? 1), 1);

  const lastBoundary = [...sorted]
    .reverse()
    .find((event) => ['start', 'checkpoint', 'finish', 'drop', 'shelve', 'resume'].includes(event.kind));

  return {
    startedAt: starts[0]?.at ?? null,
    finishedAt: finishes[finishes.length - 1]?.at ?? null,
    lastCheckpoint: checkpoints[checkpoints.length - 1] ?? null,
    finishes,
    round,
    isActive: Boolean(
      lastBoundary && ['start', 'checkpoint', 'resume'].includes(lastBoundary.kind)
    )
  };
}

export interface LogMonthGroup {
  /** `YYYY-MM`; also the stable key. */
  key: string;
  label: string;
  events: MediaLogEvent[];
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

/** Groups newest-first events into calendar months, newest month first. */
export function groupEventsByMonth(events: MediaLogEvent[]): LogMonthGroup[] {
  const groups = new Map<string, LogMonthGroup>();

  for (const event of sortEventsNewestFirst(events)) {
    const key = event.at.slice(0, 7);
    let group = groups.get(key);
    if (!group) {
      const [year, month] = key.split('-').map(Number);
      group = {
        key,
        label: `${MONTH_NAMES[(month || 1) - 1]} ${year}`,
        events: []
      };
      groups.set(key, group);
    }
    group.events.push(event);
  }

  return [...groups.values()];
}

/** Joins events to their library items and drops orphaned ones. */
export function attachMedia<T extends MediaLogEvent>(
  events: T[],
  media: MediaItem[]
): { event: T; item: MediaItem }[] {
  const byId = new Map(media.map((item) => [item.id, item]));
  return events.flatMap((event) => {
    const item = byId.get(event.media_id);
    return item ? [{ event, item }] : [];
  });
}
