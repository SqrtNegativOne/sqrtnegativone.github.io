import fs from 'fs/promises';
import path from 'path';
import { ResultAsync, ok, err } from 'neverthrow';

// Resolve paths relative to the current working directory (which is admin-app usually)
const DATA_DIR = path.resolve(process.cwd(), '../src/data');

export function readData<T>(filename: string): ResultAsync<T[], Error> {
  const filePath = path.join(DATA_DIR, filename);
  return ResultAsync.fromPromise(fs.readFile(filePath, 'utf-8'), (e) => e as NodeJS.ErrnoException)
    .orElse((error) => {
      if (error.code === 'ENOENT') {
        return ok('[]');
      }
      console.error(`Error reading ${filename}:`, error);
      return err(error);
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
  const filePath = path.join(DATA_DIR, filename);
  return ResultAsync.fromPromise(
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8'),
    (e) => {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error(`Error writing ${filename}:`, error);
      return error;
    }
  );
}
