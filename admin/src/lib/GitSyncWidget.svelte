<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gitState } from '$lib/gitState.svelte';

  interface Props {
    isMobile?: boolean;
  }

  let { isMobile = false }: Props = $props();

  onMount(() => {
    gitState.init();
  });

  onDestroy(() => {
    gitState.destroy();
  });

  function getStatusLabel(status: string): { label: string; class: string } {
    const s = status.trim();
    if (s.includes('M')) return { label: 'MODIFIED', class: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };
    if (s.includes('A') || s.includes('?')) return { label: 'ADDED', class: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
    if (s.includes('D')) return { label: 'DELETED', class: 'text-rose-400 bg-rose-400/10 border-rose-400/20' };
    return { label: 'CHANGED', class: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
  }

  function handleQuickPublish() {
    gitState.publish();
  }

  function handleOpenReview() {
    gitState.customMessage = gitState.defaultMessage;
    gitState.isModalOpen = true;
  }

  function handleModalPublish() {
    gitState.publish(gitState.customMessage);
  }

  function handleModalCommit() {
    gitState.commitOnly(gitState.customMessage);
  }

  function handlePushOnly() {
    gitState.pushOnly();
  }
</script>

<!-- Sidebar Git Status Bar (fixed height, seamless transition, never shifts layout) -->
<div class="h-16 px-3 border-t border-[oklch(0.2739_0.0055_286.03)] bg-[oklch(0.2103_0.0059_285.89)] flex items-center shrink-0">
  <div class="flex items-center justify-between w-full min-w-0">
    <!-- Clickable status / review trigger -->
    <button
      type="button"
      onclick={handleOpenReview}
      class="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group/btn"
      title="{gitState.status?.branch || 'main'}: {gitState.hasContentChanges ? `${gitState.contentChangeCount} changes` : gitState.hasUnpushedCommits ? `${gitState.aheadCount} ahead` : 'Up to date'}"
    >
      <div class="relative shrink-0 w-8 h-8 rounded flex items-center justify-center text-blue-400 bg-white/5 hover:bg-white/10 transition-colors">
        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        {#if gitState.hasContentChanges}
          <span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse ring-2 ring-[oklch(0.2103_0.0059_285.89)]"></span>
        {:else if gitState.hasUnpushedCommits}
          <span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[oklch(0.2103_0.0059_285.89)]"></span>
        {:else}
          <span class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-[oklch(0.2103_0.0059_285.89)]"></span>
        {/if}
      </div>

      <!-- Text: hidden when collapsed, smoothly visible on hover/mobile -->
      <div class="min-w-0 whitespace-nowrap {isMobile ? 'block' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:delay-75'}">
        <div class="text-xs font-mono font-medium text-white truncate max-w-[100px]">
          {gitState.status?.branch || 'main'}
        </div>
        <div class="text-[11px] truncate max-w-[100px] {gitState.hasContentChanges ? 'text-amber-400' : gitState.hasUnpushedCommits ? 'text-cyan-400' : 'text-emerald-400'}">
          {gitState.hasContentChanges
            ? `${gitState.contentChangeCount} changes`
            : gitState.hasUnpushedCommits
            ? `${gitState.aheadCount} ahead`
            : 'Up to date'}
        </div>
      </div>
    </button>

    <!-- Right: Action button (Publish / Push / Refresh) -->
    <div class="shrink-0 {isMobile ? 'flex' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:delay-75'} items-center gap-1">
      {#if gitState.hasContentChanges}
        <button
          type="button"
          disabled={gitState.isPublishing}
          onclick={handleQuickPublish}
          class="px-2 py-1 rounded text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white cursor-pointer disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1"
          title="Quick publish content changes"
        >
          {#if gitState.isPublishing}
            <svg class="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          {:else}
            Publish
          {/if}
        </button>
      {:else if gitState.hasUnpushedCommits}
        <button
          type="button"
          disabled={gitState.isPublishing}
          onclick={handlePushOnly}
          class="px-2 py-1 rounded text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
          title="Push commits to GitHub"
        >
          Push
        </button>
      {:else}
        <button
          type="button"
          aria-label="Refresh Git status"
          class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white transition-colors p-1.5 rounded hover:bg-white/5 cursor-pointer"
          disabled={gitState.isLoading || gitState.isPublishing}
          onclick={() => gitState.refresh()}
        >
          <svg class="w-3.5 h-3.5 {gitState.isLoading ? 'animate-spin text-blue-400' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      {/if}
    </div>
  </div>
</div>

<!-- Review & Publish Modal -->
{#if gitState.isModalOpen}
  <div 
    class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="review-modal-title"
  >
    <div class="card w-full max-w-lg p-6 space-y-5 bg-[oklch(0.2103_0.0059_285.89)] border border-[oklch(0.2739_0.0055_286.03)] rounded shadow-2xl">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-[oklch(0.2739_0.0055_286.03)] pb-4">
        <div>
          <h2 id="review-modal-title" class="text-lg font-bold text-white flex items-center gap-2">
            <span>Publish Content Changes</span>
            <span class="text-xs font-mono font-normal px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {gitState.status?.branch || 'main'}
            </span>
          </h2>
          <p class="text-xs text-[oklch(0.7107_0.0351_256.79)] mt-0.5">
            Stage content changes, commit, and push to trigger GitHub Pages deployment.
          </p>
        </div>
        <button
          type="button"
          aria-label="Close modal"
          class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 cursor-pointer"
          onclick={() => gitState.isModalOpen = false}
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- File List -->
      <div class="space-y-2">
        <label for="review-files-list" class="block text-xs font-medium text-[oklch(0.7107_0.0351_256.79)] uppercase tracking-wider">
          Files to be committed ({gitState.contentChangeCount})
        </label>
        <div id="review-files-list" class="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded bg-[oklch(0.1408_0.0044_285.82)] border border-[oklch(0.2739_0.0055_286.03)] text-xs font-mono">
          {#if gitState.status?.content_changes}
            {#each gitState.status.content_changes as change (change.path)}
              {@const badge = getStatusLabel(change.status)}
              <div class="flex items-center justify-between p-1.5 rounded hover:bg-white/5 transition-colors">
                <span class="text-[oklch(0.85_0.01_285.89)] truncate max-w-[340px]" title={change.path}>
                  {change.path}
                </span>
                <span class="text-[10px] px-1.5 py-0.5 rounded border font-sans font-semibold {badge.class}">
                  {badge.label}
                </span>
              </div>
            {/each}
          {/if}
        </div>
      </div>

      <!-- Safe Guard Info -->
      {#if gitState.otherChangesCount > 0}
        <div class="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
          <svg class="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span class="font-semibold text-white">Safe staging active:</span>
            {gitState.otherChangesCount} non-content code {gitState.otherChangesCount === 1 ? 'file' : 'files'} in your editor are ignored and will remain untouched.
          </div>
        </div>
      {/if}

      <!-- Commit Message Input -->
      <div class="space-y-1.5">
        <label for="commit-message-input" class="block text-xs font-medium text-[oklch(0.7107_0.0351_256.79)]">
          Commit Message
        </label>
        <input
          id="commit-message-input"
          type="text"
          bind:value={gitState.customMessage}
          placeholder={gitState.defaultMessage}
          class="w-full px-3 py-2 text-xs rounded bg-[oklch(0.1408_0.0044_285.82)] border border-[oklch(0.2739_0.0055_286.03)] text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <!-- Error inside modal -->
      {#if gitState.error}
        <div class="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {gitState.error}
        </div>
      {/if}

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-2 pt-2 border-t border-[oklch(0.2739_0.0055_286.03)]">
        <button
          type="button"
          class="px-3 py-1.5 text-xs text-[oklch(0.7107_0.0351_256.79)] hover:text-white cursor-pointer rounded hover:bg-white/5 transition-colors"
          disabled={gitState.isPublishing}
          onclick={() => gitState.isModalOpen = false}
        >
          Cancel
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded transition-colors cursor-pointer disabled:opacity-50"
          disabled={gitState.isPublishing}
          onclick={handleModalCommit}
        >
          Commit Only
        </button>

        <button
          type="button"
          class="px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          disabled={gitState.isPublishing}
          onclick={handleModalPublish}
        >
          {#if gitState.isPublishing}
            <svg class="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Publishing...</span>
          {:else}
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Publish & Deploy</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
