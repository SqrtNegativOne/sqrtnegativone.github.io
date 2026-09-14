import { getAllNowEntries } from '$lib/now';

export const prerender = true;

export function load() {
  const entries = getAllNowEntries();
  return {
    entries,
    latest: entries[0] || null
  };
}
