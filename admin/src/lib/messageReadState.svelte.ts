import { d1Query } from '$lib/d1';

/** Local watermark: the highest message id the user has already looked at. */
const STORAGE_KEY = 'admin.messages.lastReadId';

/** Background checks are cheap to skip; don't hammer Wrangler on every focus. */
const RECHECK_INTERVAL_MS = 60_000;

function readWatermark(): number {
  if (typeof localStorage === 'undefined') return 0;
  const parsed = Number(localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

function writeWatermark(id: number) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, String(id));
}

/**
 * Tracks how many contact messages the user hasn't read yet.
 *
 * D1 has no per-message "read" flag, and the messages are only ever consumed
 * from this desktop app, so the watermark is kept in `localStorage` instead of
 * adding a column to the production table.
 */
export class MessageReadState {
  /** Highest message id that has been marked as read. */
  lastReadId = $state(0);
  /** Count of remote messages newer than `lastReadId`. */
  unreadCount = $state(0);
  /** True while a background D1 count query is in flight. */
  checking = $state(false);

  private lastCheckedAt = 0;
  private inflight: Promise<void> | null = null;
  private hydrated = false;
  /** Bumped by `markRead` so stale in-flight counts can't resurrect a badge. */
  private version = 0;

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    if (this.hydrated) return;
    this.hydrated = true;
    this.lastReadId = readWatermark();
  }

  /**
   * Re-count unread messages. Silently ignores backend failures so a missing
   * Wrangler install never spams toasts on startup; `force` skips the throttle.
   */
  refresh(force = false): Promise<void> {
    this.hydrate();
    if (typeof window === 'undefined') return Promise.resolve();
    if (this.inflight) return this.inflight;
    if (!force && Date.now() - this.lastCheckedAt < RECHECK_INTERVAL_MS) return Promise.resolve();

    this.lastCheckedAt = Date.now();
    this.checking = true;
    const version = this.version;

    this.inflight = (async () => {
      try {
        const result = await d1Query<{ unread: number }>(
          `SELECT COUNT(*) AS unread FROM messages WHERE id > ${this.lastReadId}`,
          { silent: true }
        );
        if (result.isOk() && version === this.version) {
          const row = result.value[0];
          this.unreadCount = Math.max(0, Number(row?.unread) || 0);
        }
      } finally {
        this.checking = false;
        this.inflight = null;
      }
    })();

    return this.inflight;
  }

  /** Mark everything up to `id` as read (called once the messages page shows them). */
  markRead(id: number) {
    this.hydrate();
    this.version += 1;
    if (Number.isFinite(id) && id > this.lastReadId) {
      this.lastReadId = Math.floor(id);
      writeWatermark(this.lastReadId);
    }
    this.unreadCount = 0;
    this.lastCheckedAt = Date.now();
  }
}

export const messageReadState = new MessageReadState();
