<script lang="ts">
  import { onMount } from 'svelte';
  import type { MediaViewMode } from '../lib/mediaLibrary';

  let {
    viewMode = $bindable<MediaViewMode>('gallery'),
    storageKey = ''
  } = $props<{
    viewMode?: MediaViewMode;
    /** localStorage key used to remember the chosen view; empty disables persistence. */
    storageKey?: string;
  }>();

  // Restore only after mount so prerendered static HTML stays deterministic.
  onMount(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'gallery' || saved === 'table') viewMode = saved;
    } catch {
      // localStorage unavailable; keep the caller's default view
    }
  });

  function setViewMode(mode: MediaViewMode) {
    viewMode = mode;
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, mode);
    } catch {
      // ignore persistence failures
    }
  }
</script>

<div class="ml-view-toggle" role="group" aria-label="View mode">
  <button
    type="button"
    class="ml-view-btn"
    class:ml-view-btn--active={viewMode === 'gallery'}
    aria-pressed={viewMode === 'gallery'}
    title="Gallery view"
    onclick={() => setViewMode('gallery')}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
    <span>Gallery</span>
  </button>
  <button
    type="button"
    class="ml-view-btn"
    class:ml-view-btn--active={viewMode === 'table'}
    aria-pressed={viewMode === 'table'}
    title="Table view"
    onclick={() => setViewMode('table')}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
    <span>Table</span>
  </button>
</div>

<style>
  .ml-view-toggle {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 3px;
    border-radius: 8px;
    background: oklch(1 0 0 / 0.05);
    border: 1px solid oklch(1 0 0 / 0.1);
  }

  .ml-view-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: oklch(0.6363 0.0133 286.02);
    font-family: "Inter", system-ui, sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 150ms ease, color 150ms ease;
  }

  .ml-view-btn:hover {
    color: oklch(0.9707 0.0027 286.35);
  }

  .ml-view-btn--active {
    background: oklch(1 0 0 / 0.1);
    color: oklch(0.9707 0.0027 286.35);
  }

  .ml-view-btn svg {
    width: 15px;
    height: 15px;
  }

  @media (max-width: 640px) {
    .ml-view-btn span {
      display: none;
    }

    .ml-view-btn {
      padding: 7px 9px;
    }
  }
</style>
