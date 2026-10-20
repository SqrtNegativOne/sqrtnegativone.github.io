import { invoke } from '@tauri-apps/api/core';
import { Result, ResultAsync, errAsync } from 'neverthrow';
import { notificationState } from '$lib/notificationState.svelte';

const TAURI_UNAVAILABLE_MESSAGE =
  'Backend unavailable: this page is not running inside the Tauri app. Launch it with admin.bat.';

/** True when the SvelteKit page is loaded in the Tauri webview, not a browser tab. */
export function isTauri(): boolean {
  if (typeof window === 'undefined') return false;
  const internals = (window as Window & { __TAURI_INTERNALS__?: { invoke?: unknown } })
    .__TAURI_INTERNALS__;
  return typeof internals?.invoke === 'function';
}

export const safeJsonParse = Result.fromThrowable(JSON.parse, (e) => e instanceof Error ? e : new Error(String(e)));

/** Turn an arbitrary display string into a stable, URL/file-safe slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Slugify `base` and append `-2`, `-3`, ... until it is not already taken. */
export function uniqueSlug(base: string, taken: Iterable<string>, fallback = 'item'): string {
  const seed = slugify(base) || fallback;
  const used = new Set(taken);
  if (!used.has(seed)) return seed;
  let n = 2;
  while (used.has(`${seed}-${n}`)) n++;
  return `${seed}-${n}`;
}

export const safeUrlParse = Result.fromThrowable((url: string) => new URL(url), () => new Error("The URL provided is not valid."));

export interface SafeInvokeOptions {
  silent?: boolean;
  title?: string;
}

export const safeInvoke = <T>(
  cmd: string, 
  args?: Record<string, unknown>, 
  options?: SafeInvokeOptions
) => {
  if (!isTauri()) {
    // Browsers don't get Tauri's IPC bridge; fail without spamming a toast.
    // The layout shows a persistent browser-preview banner instead.
    return errAsync<T, Error>(new Error(TAURI_UNAVAILABLE_MESSAGE));
  }

  return ResultAsync.fromPromise(
    invoke<T>(cmd, args), 
    (e) => {
      const message = String(e);
      const err = new Error(message.startsWith('Tauri invoke error') ? message : `Tauri invoke error (${cmd}): ${message}`);
      if (!options?.silent) {
        notificationState.error(err.message, { title: options?.title ?? 'Backend Error' });
      }
      return err;
    }
  );
};

export function notifyOnError<T, E extends { message?: string }>(result: Result<T, E>, title?: string): Result<T, E> {
  if (result.isErr()) {
    notificationState.error(result.error.message || String(result.error), { title });
  }
  return result;
}

