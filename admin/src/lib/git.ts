import { safeInvoke } from '$lib/utils';
import type { ResultAsync } from 'neverthrow';

export interface GitFileChange {
  path: string;
  status: string;
}

export interface GitStatusInfo {
  branch: string;
  content_changes: GitFileChange[];
  other_changes_count: number;
  ahead_count: number;
}

export function getGitStatus(): ResultAsync<GitStatusInfo, Error> {
  return safeInvoke<GitStatusInfo>('git_get_status');
}

export function commitContentChanges(message?: string): ResultAsync<string, Error> {
  return safeInvoke<string>('git_commit_content', { message: message?.trim() || null });
}

export function pushCommits(): ResultAsync<string, Error> {
  return safeInvoke<string>('git_push');
}

export function publishContent(message?: string): ResultAsync<string, Error> {
  return safeInvoke<string>('git_publish', { message: message?.trim() || null });
}
