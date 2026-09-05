import { invoke } from '@tauri-apps/api/core';
import { ResultAsync, ok, okAsync } from 'neverthrow';
import { safeInvoke, safeJsonParse } from '$lib/utils';
import { gitState } from '$lib/gitState.svelte';

let cachedRepoRoot: string | null = null;

export async function getRepoRoot(): Promise<string> {
  if (cachedRepoRoot) return cachedRepoRoot;
  cachedRepoRoot = await invoke<string>('get_repo_root');
  return cachedRepoRoot;
}

export function safeGetRepoRoot(): ResultAsync<string, Error> {
  if (cachedRepoRoot) return okAsync(cachedRepoRoot);
  return safeInvoke<string>('get_repo_root').map((root) => {
    cachedRepoRoot = root;
    return root;
  });
}

export const COLLECTIONS = {
  projects: 'src/data/projects.json',
  skills: 'src/data/skills.json',
  socials: 'src/data/socials.json',
  quotes: 'static/quotes/quotes.json',
  media: 'static/media/media.json',
  mediaPrivate: 'static/media/media-private.json',
  mediaProperties: 'static/media/media-properties.json',
} as const;

export type CollectionName = keyof typeof COLLECTIONS;

export function resolveDataPath(collectionOrPath: CollectionName | (string & {})): string {
  if (collectionOrPath in COLLECTIONS) {
    return COLLECTIONS[collectionOrPath as CollectionName];
  }
  if (collectionOrPath.startsWith('../../static/')) {
    return collectionOrPath.replace('../../', '');
  }
  if (collectionOrPath.startsWith('static/') || collectionOrPath.startsWith('src/')) {
    return collectionOrPath;
  }
  const cleanFilename = collectionOrPath.endsWith('.json') ? collectionOrPath : `${collectionOrPath}.json`;
  return `src/data/${cleanFilename}`;
}

export function readData<T>(collectionOrPath: CollectionName | (string & {})): ResultAsync<T[], Error> {
  return safeGetRepoRoot()
    .andThen((root) => {
      const relPath = resolveDataPath(collectionOrPath);
      const filePath = `${root}/${relPath}`;
      return safeInvoke<string>('read_file', { path: filePath });
    })
    .orElse(() => {
      return ok('[]');
    })
    .andThen((content) => {
      return safeJsonParse(content).map((parsed) => parsed as T[]);
    });
}

export function writeData<T>(collectionOrPath: CollectionName | (string & {}), data: T[]): ResultAsync<void, Error> {
  return safeGetRepoRoot()
    .andThen((root) => {
      const relPath = resolveDataPath(collectionOrPath);
      const filePath = `${root}/${relPath}`;
      return safeInvoke<void>('write_file', { path: filePath, content: JSON.stringify(data, null, 2) });
    })
    .map(() => {
      gitState.refresh();
    });
}

