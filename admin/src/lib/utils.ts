import { invoke } from '@tauri-apps/api/core';
import { Result, ResultAsync } from 'neverthrow';
import { notificationState } from '$lib/notificationState.svelte';

export const safeJsonParse = Result.fromThrowable(JSON.parse, (e) => e instanceof Error ? e : new Error(String(e)));

export const safeUrlParse = Result.fromThrowable((url: string) => new URL(url), () => new Error("The URL provided is not valid."));

export interface SafeInvokeOptions {
  silent?: boolean;
  title?: string;
}

export const safeInvoke = <T>(
  cmd: string, 
  args?: Record<string, unknown>, 
  options?: SafeInvokeOptions
) => 
  ResultAsync.fromPromise(
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

export function notifyOnError<T, E extends { message?: string }>(result: Result<T, E>, title?: string): Result<T, E> {
  if (result.isErr()) {
    notificationState.error(result.error.message || String(result.error), { title });
  }
  return result;
}

