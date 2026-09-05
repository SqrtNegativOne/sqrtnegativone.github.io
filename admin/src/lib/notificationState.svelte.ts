import { SvelteMap } from 'svelte/reactivity';

export type NotificationType = 'error' | 'success' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  details?: string;
  timeout: number;
  createdAt: number;
}

export class NotificationState {
  notifications = $state<AppNotification[]>([]);
  private timers = new SvelteMap<string, ReturnType<typeof setTimeout>>();
  private initialized = false;

  constructor() {}

  initGlobalHandlers() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    window.addEventListener('error', (event: ErrorEvent) => {
      const msg = event.message || 'An unexpected runtime error occurred';
      const details = event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`;
      this.error(msg, {
        title: 'Application Error',
        details,
      });
    });

    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      let msg = 'Unhandled asynchronous error';
      let details: string | undefined;

      if (reason instanceof Error) {
        msg = reason.message || msg;
        details = reason.stack;
      } else if (typeof reason === 'string') {
        msg = reason;
      } else if (reason) {
        msg = String(reason);
      }

      this.error(msg, {
        title: 'Asynchronous Error',
        details,
      });
    });
  }

  notify(options: {
    type: NotificationType;
    message: string;
    title?: string;
    details?: string;
    timeout?: number;
  }): string {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const defaultTimeout = options.type === 'error' ? 7000 : options.type === 'warning' ? 5000 : 4000;
    const timeout = options.timeout ?? defaultTimeout;

    const notification: AppNotification = {
      id,
      type: options.type,
      title: options.title,
      message: options.message,
      details: options.details,
      timeout,
      createdAt: Date.now(),
    };

    // Keep max 6 notifications at a time to prevent flooding
    if (this.notifications.length >= 6) {
      const oldest = this.notifications[0];
      this.dismiss(oldest.id);
    }

    this.notifications.push(notification);

    if (timeout > 0) {
      const timer = setTimeout(() => {
        this.dismiss(id);
      }, timeout);
      this.timers.set(id, timer);
    }

    return id;
  }

  error(
    message: string,
    options?: { title?: string; details?: string; timeout?: number }
  ): string {
    return this.notify({
      type: 'error',
      message,
      title: options?.title ?? 'Error',
      details: options?.details,
      timeout: options?.timeout ?? 8000,
    });
  }

  success(
    message: string,
    options?: { title?: string; timeout?: number }
  ): string {
    return this.notify({
      type: 'success',
      message,
      title: options?.title,
      timeout: options?.timeout ?? 3500,
    });
  }

  warning(
    message: string,
    options?: { title?: string; details?: string; timeout?: number }
  ): string {
    return this.notify({
      type: 'warning',
      message,
      title: options?.title ?? 'Warning',
      details: options?.details,
      timeout: options?.timeout ?? 5000,
    });
  }

  info(
    message: string,
    options?: { title?: string; timeout?: number }
  ): string {
    return this.notify({
      type: 'info',
      message,
      title: options?.title,
      timeout: options?.timeout ?? 4000,
    });
  }

  dismiss(id: string) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  clear() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.notifications = [];
  }
}

export const notificationState = new NotificationState();
