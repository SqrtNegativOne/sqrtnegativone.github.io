import { invoke } from '@tauri-apps/api/core';
import { ResultAsync, ok } from 'neverthrow';
import { safeInvoke, safeJsonParse } from '$lib/utils';

export async function getRepoRoot(): Promise<string> {
  return await invoke<string>('get_repo_root');
}

export function readData<T>(filename: string): ResultAsync<T[], Error> {
  return safeInvoke<string>('get_repo_root')
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
  return safeInvoke<string>('get_repo_root')
    .andThen((root) => {
      const filePath = `${root}/src/data/${filename}`;
      return safeInvoke<void>('write_file', { path: filePath, content: JSON.stringify(data, null, 2) });
    });
}
