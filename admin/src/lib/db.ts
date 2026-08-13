import { invoke } from '@tauri-apps/api/core';
import { ResultAsync, ok, err } from 'neverthrow';

export async function getRepoRoot(): Promise<string> {
  return await invoke<string>('get_repo_root');
}

export function readData<T>(filename: string): ResultAsync<T[], Error> {
  return ResultAsync.fromPromise(getRepoRoot(), (e) => new Error(String(e)))
    .andThen((root) => {
      const filePath = `${root}/src/data/${filename}`;
      return ResultAsync.fromPromise(
        invoke<string>('read_file', { path: filePath }),
        (e) => new Error(String(e))
      );
    })
    .orElse((error) => {
      return ok('[]');
    })
    .andThen((content) => {
      try {
        return ok(JSON.parse(content) as T[]);
      } catch (e) {
        return err(e instanceof Error ? e : new Error(String(e)));
      }
    });
}

export function writeData<T>(filename: string, data: T[]): ResultAsync<void, Error> {
  return ResultAsync.fromPromise(getRepoRoot(), (e) => new Error(String(e)))
    .andThen((root) => {
      const filePath = `${root}/src/data/${filename}`;
      return ResultAsync.fromPromise(
        invoke<void>('write_file', { path: filePath, content: JSON.stringify(data, null, 2) }),
        (e) => new Error(String(e))
      );
    });
}
