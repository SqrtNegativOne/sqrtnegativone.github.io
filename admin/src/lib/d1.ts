import { errAsync, type ResultAsync } from 'neverthrow';
import { safeInvoke } from '$lib/utils';

export interface D1Message {
  id: number;
  body: string;
  created_at: string;
  country: string | null;
  user_agent: string | null;
  ip_hash: string | null;
}

/**
 * Execute a single SQL statement against the remote D1 `sqrt-fyi-messages`
 * database. Backed by the `d1_query` Tauri command, which reuses the
 * developer's existing Wrangler login.
 */
export function d1Query<T = Record<string, unknown>>(sql: string): ResultAsync<T[], Error> {
  return safeInvoke<T[]>('d1_query', { sql }, { title: 'D1 request failed' });
}

/** Fetch the most recent contact messages, newest first. */
export function listMessages(limit = 200): ResultAsync<D1Message[], Error> {
  const safeLimit = Math.min(Math.max(Math.floor(limit) || 0, 1), 1000);
  return d1Query<D1Message>(
    `SELECT id, body, created_at, country, user_agent, ip_hash FROM messages ORDER BY id DESC LIMIT ${safeLimit}`
  );
}

/** Delete a single message by its numeric id. */
export function deleteMessage(id: number): ResultAsync<Record<string, unknown>[], Error> {
  if (!Number.isInteger(id) || id < 1) {
    return errAsync(new Error(`Invalid message id: ${id}`));
  }
  return d1Query(`DELETE FROM messages WHERE id = ${id}`);
}
