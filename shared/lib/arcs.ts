import rawArcs from '../data/now.json' with { type: 'json' };

/** Which audience an arc is written for. An arc can belong to both. */
export type ArcAudience = 'professional' | 'personal';

/**
 * A span of the author's life that the /now page presents as a bookmark tab.
 * Dates are date-only strings (`YYYY-MM-DD`) so they compare lexicographically.
 */
export interface Arc {
  id: string;
  title: string;
  startDate: string;
  /** Omit for an open-ended arc that is ongoing until further notice. */
  endDate?: string;
  audience: ArcAudience[];
  /** Markdown. */
  description: string;
  updatedAt?: string;
}

/** The shape both /now pages hand to the shared `NowBook` component. */
export interface NowBookItem {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  /** Pre-rendered Markdown. */
  html: string;
}

const arcs = rawArcs as Arc[];

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDateOnly(value: string): Date | null {
  const match = DATE_ONLY.exec(value?.trim() ?? '');
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  // Reject impossible dates such as 2026-02-31 (Date rolls them forward).
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

/** Midnight UTC for the calendar day the given instant falls on locally. */
function todayAsUtcMidnight(now: Date): Date {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function getAllArcs(): Arc[] {
  return arcs.slice();
}

export function hasAudience(arc: Arc, audience: ArcAudience): boolean {
  return Array.isArray(arc.audience) && arc.audience.includes(audience);
}

export function isValidArcDate(value: string): boolean {
  return parseDateOnly(value) !== null;
}

/**
 * Inclusive of both the start and end date. A missing end date means the arc is
 * open-ended and stays ongoing indefinitely once it has started.
 */
export function isArcOngoing(arc: Arc, now: Date = new Date()): boolean {
  const start = parseDateOnly(arc.startDate);
  if (!start) return false;

  const endValue = arc.endDate?.trim();
  const end = endValue ? parseDateOnly(endValue) : null;
  if (endValue && !end) return false;

  const today = todayAsUtcMidnight(now).getTime();
  return start.getTime() <= today && (!end || today <= end.getTime());
}

/**
 * Ongoing arcs for one site, newest start date first.
 *
 * `/site` asks for `personal`, `/cv` asks for `professional`, and arcs tagged
 * with both audiences appear on both.
 */
export function getOngoingArcs(audience: ArcAudience, now: Date = new Date()): Arc[] {
  return getAllArcs()
    .filter((arc) => hasAudience(arc, audience) && isArcOngoing(arc, now))
    .sort((a, b) => b.startDate.localeCompare(a.startDate) || a.title.localeCompare(b.title));
}

export function formatArcDate(value: string | undefined): string {
  if (!value) return '';
  const date = parseDateOnly(value);
  if (!date) return value;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

export function formatArcRange(startDate: string, endDate?: string): string {
  const start = formatArcDate(startDate);
  if (!endDate) return `${start} – present`;

  const end = formatArcDate(endDate);
  return start === end ? start : `${start} – ${end}`;
}
