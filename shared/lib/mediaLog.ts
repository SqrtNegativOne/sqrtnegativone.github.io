import type { MediaLogEvent, MediaLogKind, MediaProgressUnit } from '../types';

export const LOG_KIND_LABEL: Record<MediaLogKind, string> = {
  start: 'Started',
  checkpoint: 'Checkpoint',
  finish: 'Finished',
  drop: 'Dropped',
  shelve: 'Shelved',
  resume: 'Resumed'
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

/**
 * Everything after the verb: `Episode 4 of 8`, `12h / 20h`, `Round 2`.
 *
 * A `finish` may carry the same optional snapshot as a checkpoint, so a session
 * that also ended the work can be one entry instead of two.
 */
export function eventDetail(event: MediaLogEvent): string {
  const parts: string[] = [];
  if (event.value !== undefined && event.value !== null) parts.push(formatCheckpoint(event));
  if ((event.round ?? 1) > 1) parts.push(`Round ${event.round}`);
  return parts.join(' · ');
}

/** `Finished · Episode 12 of 12`, `Checkpoint · Page 40`, `Started`. */
export function eventLabel(event: MediaLogEvent): string {
  const detail = eventDetail(event);
  return detail ? `${LOG_KIND_LABEL[event.kind]} · ${detail}` : LOG_KIND_LABEL[event.kind];
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

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

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

/** Sunday-first, matching the calendar grid. */
export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function monthLabel(year: number, month: number): string {
  const normalised = ((month % 12) + 12) % 12;
  return `${MONTH_NAMES[normalised]} ${year}`;
}

/** `YYYY-MM-DD` of a stamp, without going through `Date`. */
export function dayKeyOf(at: string | null | undefined): string {
  return (at ?? '').slice(0, 10);
}

/** `Tuesday, 20 October 2026`. */
export function formatDayLong(key: string): string {
  const date = parseLogDate(key);
  if (!date) return key;
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/** Everything logged against one item on one day. */
export interface CalendarMediaEntry {
  mediaId: string;
  /** Oldest first. */
  events: MediaLogEvent[];
  /** The last thing that happened to it that day. */
  latest: MediaLogEvent;
}

export interface CalendarDay {
  /** `YYYY-MM-DD`; also the stable key. */
  key: string;
  /** Day of the month, 1–31. */
  day: number;
  /** False for the leading/trailing days borrowed from the neighbouring months. */
  inMonth: boolean;
  isToday: boolean;
  media: CalendarMediaEntry[];
}

export interface CalendarMonth {
  year: number;
  /** Zero-based, like `Date#getMonth`. */
  month: number;
  label: string;
  weeks: CalendarDay[][];
}

/**
 * Groups events by calendar day, then by media, so a cell renders one poster per
 * title no matter how many checkpoints were logged that day.
 */
export function groupEventsByDay(events: MediaLogEvent[]): Map<string, CalendarMediaEntry[]> {
  const perDay = new Map<string, Map<string, MediaLogEvent[]>>();

  for (const event of sortEventsOldestFirst(events)) {
    const key = dayKeyOf(event.at);
    let perMedia = perDay.get(key);
    if (!perMedia) {
      perMedia = new Map();
      perDay.set(key, perMedia);
    }
    const list = perMedia.get(event.media_id);
    if (list) list.push(event);
    else perMedia.set(event.media_id, [event]);
  }

  const grouped = new Map<string, CalendarMediaEntry[]>();
  for (const [key, perMedia] of perDay) {
    const entries = [...perMedia].map(([mediaId, list]) => ({
      mediaId,
      events: list,
      latest: list[list.length - 1]
    }));
    // Chronological within the day: the cell reads left to right in the order
    // things were logged.
    entries.sort(
      (a, b) => logTimestamp(a.events[0].at) - logTimestamp(b.events[0].at) ||
        a.mediaId.localeCompare(b.mediaId)
    );
    grouped.set(key, entries);
  }

  return grouped;
}

/**
 * Builds a Sunday-first month grid. `todayKey` is passed in rather than read
 * from the clock so a prerendered page and its hydrated copy agree.
 */
export function buildCalendarMonth(
  year: number,
  month: number,
  events: MediaLogEvent[],
  todayKey = ''
): CalendarMonth {
  const byDay = groupEventsByDay(events);
  const firstOfMonth = new Date(year, month, 1);
  const offset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekCount = Math.ceil((offset + daysInMonth) / 7);

  const weeks: CalendarDay[][] = [];
  for (let w = 0; w < weekCount; w++) {
    const week: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(year, month, 1 - offset + w * 7 + d);
      const key = todayStamp(date);
      week.push({
        key,
        day: date.getDate(),
        inMonth: date.getMonth() === month && date.getFullYear() === year,
        isToday: key === todayKey,
        media: byDay.get(key) ?? []
      });
    }
    weeks.push(week);
  }

  return { year, month, label: monthLabel(year, month), weeks };
}

/** Steps `delta` months from a `(year, month)` pair, normalising the year. */
export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}
