import { invoke } from '@tauri-apps/api/core';
import { Result, ResultAsync } from 'neverthrow';

export const safeJsonParse = Result.fromThrowable(JSON.parse, (e) => e instanceof Error ? e : new Error(String(e)));

export const safeUrlParse = Result.fromThrowable((url: string) => new URL(url), () => new Error("The URL provided is not valid."));

export const safeInvoke = <T>(cmd: string, args?: any) => 
  ResultAsync.fromPromise(invoke<T>(cmd, args), (e) => new Error(`Tauri invoke error: ${String(e)}`));
