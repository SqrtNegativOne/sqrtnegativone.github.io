import { error } from '@sveltejs/kit';
import { getAllNowEntries, type NowEntry } from '$lib/now';

export const prerender = true;

export function entries() {
  const all = getAllNowEntries();
  return all.map((e) => ({ date: e.date }));
}

export function load({ params }) {
  const all = getAllNowEntries();
  const index = all.findIndex((e) => e.date === params.date || e.id === params.date);

  if (index === -1) {
    error(404, `No now log found for date ${params.date}`);
  }

  const entry: NowEntry = all[index];
  const prevEntry = index + 1 < all.length ? all[index + 1] : null;
  const nextEntry = index - 1 >= 0 ? all[index - 1] : null;

  return {
    entry,
    prevEntry,
    nextEntry
  };
}
