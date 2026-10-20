import mediaProperties from '../../site/static/media/media-properties.json';
import type { MediaItem } from '../types';

export type MediaViewMode = 'gallery' | 'table';

export interface MediaSortRule {
  property: string;
  direction: 'asc' | 'desc';
}

export interface MediaGroup {
  /** The raw `type` value (also used as the group's stable key). */
  key: string;
  label: string;
  items: MediaItem[];
}

// The order of `types` in media-properties.json is also the group order.
const TYPE_ORDER = new Map(mediaProperties.types.map((type, index) => [type.value, index]));
const TYPE_LABEL = new Map(mediaProperties.types.map((type) => [type.value, type.label]));

/**
 * Splits a library into Notion-style groups keyed by the item's `type`.
 *
 * Item order inside a group is preserved, so whatever filters/sorts produced
 * the list still determines how the cards/rows appear. Groups follow the
 * canonical type order from `media-properties.json`; unknown types fall to the
 * end, alphabetically, so a new type is never silently dropped.
 */
export function groupMediaByType(items: MediaItem[]): MediaGroup[] {
  const groups = new Map<string, MediaGroup>();

  for (const item of items) {
    const key = item.type || 'unknown';
    let group = groups.get(key);
    if (!group) {
      group = { key, label: TYPE_LABEL.get(key) ?? key, items: [] };
      groups.set(key, group);
    }
    group.items.push(item);
  }

  return [...groups.values()].sort((a, b) => {
    const orderA = TYPE_ORDER.get(a.key);
    const orderB = TYPE_ORDER.get(b.key);
    if (orderA !== undefined && orderB !== undefined) return orderA - orderB;
    if (orderA !== undefined) return -1;
    if (orderB !== undefined) return 1;
    return a.label.localeCompare(b.label);
  });
}

/** Cycles/creates a sort rule when a table column header is clicked. */
export function toggleSort(sorts: MediaSortRule[], column: string): MediaSortRule[] {
  const existing = sorts.find((sort) => sort.property === column);
  if (existing) {
    return sorts.map((sort) =>
      sort.property === column
        ? { ...sort, direction: sort.direction === 'desc' ? ('asc' as const) : ('desc' as const) }
        : sort
    );
  }
  return [
    ...sorts,
    { property: column, direction: column === 'title' || column === 'status' ? 'asc' : 'desc' }
  ];
}
