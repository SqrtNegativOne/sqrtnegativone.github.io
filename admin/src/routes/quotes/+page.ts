import { invoke } from '@tauri-apps/api/core';
import { getRepoRoot } from '$lib/db';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  try {
    const root = await getRepoRoot();
    const content = await invoke<string>('read_file', { path: `${root}/static/quotes/quotes.json` });
    return { quotes: JSON.parse(content) };
  } catch (e) {
    console.error('Error reading quotes.json:', e);
    return { quotes: [] };
  }
};
