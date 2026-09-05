import { getGitStatus, publishContent, commitContentChanges, pushCommits, type GitStatusInfo } from './git';
import { notificationState } from './notificationState.svelte';

export class GitState {
  status = $state<GitStatusInfo | null>(null);
  isLoading = $state(false);
  isPublishing = $state(false);
  error = $state<string | null>(null);
  successMessage = $state<string | null>(null);
  isModalOpen = $state(false);
  customMessage = $state('');

  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private initialized = false;

  get hasContentChanges(): boolean {
    return Boolean(this.status && this.status.content_changes.length > 0);
  }

  get hasUnpushedCommits(): boolean {
    return Boolean(this.status && this.status.ahead_count > 0);
  }

  get contentChangeCount(): number {
    return this.status ? this.status.content_changes.length : 0;
  }

  get aheadCount(): number {
    return this.status ? this.status.ahead_count : 0;
  }

  get otherChangesCount(): number {
    return this.status ? this.status.other_changes_count : 0;
  }

  get defaultMessage(): string {
    if (!this.status || this.status.content_changes.length === 0) {
      return 'content: update site content';
    }
    const typeList: string[] = [];
    const addType = (t: string) => {
      if (!typeList.includes(t)) typeList.push(t);
    };

    for (const change of this.status.content_changes) {
      const f = change.path;
      if (f.startsWith('src/data/projects') || f.startsWith('static/projects')) {
        addType('projects');
      } else if (f.startsWith('static/quotes')) {
        addType('quotes');
      } else if (f.startsWith('static/media')) {
        addType('media');
      } else if (f.startsWith('blog/') || f.startsWith('static/blog-images')) {
        addType('blog');
      } else if (f.startsWith('src/data/skills')) {
        addType('skills');
      } else if (f.startsWith('src/data/socials')) {
        addType('socials');
      } else {
        addType('content');
      }
    }
    if (typeList.length === 1) {
      return `content(${typeList[0]}): update ${typeList[0]}`;
    }
    return `content: update ${typeList.join(', ')}`;
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;
    this.refresh();

    window.addEventListener('focus', () => this.refresh());

    this.pollInterval = setInterval(() => {
      // Background poll only if window is focused and not actively publishing
      if (document.hasFocus() && !this.isPublishing) {
        this.refresh(true);
      }
    }, 8000);
  }

  destroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.initialized = false;
  }

  refresh(silent = false): Promise<void> {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    return new Promise<void>((resolve) => {
      this.refreshTimer = setTimeout(async () => {
        this.refreshTimer = null;
        await this.runRefresh(silent);
        resolve();
      }, 250);
    });
  }

  private async runRefresh(silent = false) {
    if (!silent) this.isLoading = true;
    const res = await getGitStatus();
    if (!silent) this.isLoading = false;

    if (res.isOk()) {
      this.status = res.value;
    } else {
      console.warn('Git status error:', res.error);
    }
  }

  async publish(message?: string) {
    this.isPublishing = true;
    this.error = null;
    this.successMessage = null;

    const res = await publishContent(message);
    this.isPublishing = false;

    if (res.isOk()) {
      this.successMessage = 'Changes published and pushed to GitHub!';
      notificationState.success('Changes published and pushed to GitHub!', { title: 'Publish Successful' });
      this.isModalOpen = false;
      this.customMessage = '';
      await this.refresh();
      setTimeout(() => {
        if (this.successMessage) this.successMessage = null;
      }, 5000);
    } else {
      this.error = res.error.message;
      notificationState.error(res.error.message, { title: 'Publish Failed' });
    }
  }

  async commitOnly(message?: string) {
    this.isPublishing = true;
    this.error = null;
    this.successMessage = null;

    const res = await commitContentChanges(message);
    this.isPublishing = false;

    if (res.isOk()) {
      this.successMessage = `Committed: "${res.value}"`;
      notificationState.success(`Committed: "${res.value}"`, { title: 'Commit Successful' });
      this.isModalOpen = false;
      this.customMessage = '';
      await this.refresh();
      setTimeout(() => {
        if (this.successMessage) this.successMessage = null;
      }, 4000);
    } else {
      this.error = res.error.message;
      notificationState.error(res.error.message, { title: 'Commit Failed' });
    }
  }

  async pushOnly() {
    this.isPublishing = true;
    this.error = null;
    this.successMessage = null;

    const res = await pushCommits();
    this.isPublishing = false;

    if (res.isOk()) {
      this.successMessage = 'Pushed commits to remote!';
      notificationState.success('Pushed commits to remote!', { title: 'Push Successful' });
      await this.refresh();
      setTimeout(() => {
        if (this.successMessage) this.successMessage = null;
      }, 5000);
    } else {
      this.error = res.error.message;
      notificationState.error(res.error.message, { title: 'Push Failed' });
    }
  }

  clearError() {
    this.error = null;
  }
}

export const gitState = new GitState();
