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

export function readData<T>(filename: string): ResultAsync<T[], Error> {
  return safeGetRepoRoot()
    .andThen((root) => {
      const filePath = `${root}/src/data/${filename}`;
      return safeInvoke<string>('read_file', { path: filePath });
    })
    .orElse(() => {
      return ok('[]');
    })
    .andThen((content) => {
      return safeJsonParse(content).map((parsed) => parsed as T[]);
    });
}

export function writeData<T>(filename: string, data: T[]): ResultAsync<void, Error> {
  return safeGetRepoRoot()
    .andThen((root) => {
      const filePath = `${root}/src/data/${filename}`;
      return safeInvoke<void>('write_file', { path: filePath, content: JSON.stringify(data, null, 2) });
    })
    .map(() => {
      gitState.refresh();
    });
}

