<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gitState } from '$lib/gitState.svelte';

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

<!-- Sidebar Footer Git Sync Widget -->
<div class="p-4 border-t border-[oklch(0.2739_0.0055_286.03)] bg-[oklch(0.1803_0.0059_285.89)] flex flex-col gap-3">
  <!-- Status Header -->
  <div class="flex items-center justify-between text-xs">
    <div class="flex items-center gap-2 text-[oklch(0.7107_0.0351_256.79)]">
      <!-- Git Branch Icon -->
      <svg class="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
      <span class="font-mono font-medium text-white truncate max-w-[120px]">
        {gitState.status?.branch || 'main'}
      </span>
    </div>
    
    <button
      type="button"
      aria-label="Refresh Git status"
      class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white transition-colors p-1 rounded hover:bg-[oklch(0.2739_0.0055_286.03)]"
      disabled={gitState.isLoading || gitState.isPublishing}
      onclick={() => gitState.refresh()}
    >
      <svg class="w-3.5 h-3.5 {gitState.isLoading ? 'animate-spin text-blue-400' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  </div>

  <!-- Messages / Feedback -->
  {#if gitState.successMessage}
    <div class="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
      <span class="truncate">{gitState.successMessage}</span>
      <button aria-label="Dismiss message" class="ml-1 text-emerald-400 hover:text-emerald-200" onclick={() => gitState.successMessage = null}>×</button>
    </div>
  {/if}

  {#if gitState.error}
    <div class="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
      <span class="truncate" title={gitState.error}>{gitState.error}</span>
      <button aria-label="Dismiss error" class="ml-1 text-rose-400 hover:text-rose-200" onclick={() => gitState.clearError()}>×</button>
    </div>
  {/if}

  <!-- Current Git State -->
  {#if gitState.hasContentChanges}
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <button
          type="button"
          class="flex items-center gap-1.5 text-xs text-amber-400 hover:underline cursor-pointer text-left"
          onclick={handleOpenReview}
        >
          <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>{gitState.contentChangeCount} {gitState.contentChangeCount === 1 ? 'content change' : 'content changes'}</span>
        </button>

        <button
          type="button"
          aria-label="Review changes"
          class="text-xs text-[oklch(0.7107_0.0351_256.79)] hover:text-white underline"
          onclick={handleOpenReview}
        >
          Review
        </button>
      </div>

      {#if gitState.otherChangesCount > 0}
        <p class="text-[11px] text-[oklch(0.55_0.03_256.79)]" title="Uncommitted code files in your editor will NOT be included in this commit.">
          🛡️ {gitState.otherChangesCount} code files ignored
        </p>
      {/if}

      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={gitState.isPublishing}
        onclick={handleQuickPublish}
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
          <span>Publish Changes</span>
        {/if}
      </button>
    </div>
  {:else if gitState.hasUnpushedCommits}
    <div class="space-y-2">
      <div class="flex items-center gap-1.5 text-xs text-cyan-400">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <span>{gitState.aheadCount} {gitState.aheadCount === 1 ? 'commit' : 'commits'} ahead</span>
      </div>

      {#if gitState.otherChangesCount > 0}
        <p class="text-[11px] text-[oklch(0.55_0.03_256.79)]">
          🛡️ {gitState.otherChangesCount} code files ignored
        </p>
      {/if}

      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={gitState.isPublishing}
        onclick={handlePushOnly}
      >
        {#if gitState.isPublishing}
          <svg class="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Pushing...</span>
        {:else}
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Push to GitHub</span>
        {/if}
      </button>
    </div>
  {:else}
    <div class="flex items-center justify-between text-xs py-1">
      <div class="flex items-center gap-1.5 text-emerald-400 font-medium">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>Up to date</span>
      </div>
      {#if gitState.otherChangesCount > 0}
        <span class="text-[11px] text-[oklch(0.55_0.03_256.79)]" title="Uncommitted code files in your editor are safely excluded.">
          ({gitState.otherChangesCount} code files)
        </span>
      {/if}
    </div>
  {/if}
</div>

<!-- Review & Publish Modal -->
{#if gitState.isModalOpen}
  <div 
    class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="review-modal-title"
  >
    <div class="card w-full max-w-lg p-6 space-y-5 bg-[oklch(0.2103_0.0059_285.89)] border border-[oklch(0.2739_0.0055_286.03)] rounded-xl shadow-2xl">
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
          class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1"
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
        <div id="review-files-list" class="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-lg bg-[oklch(0.1603_0.0059_285.89)] border border-[oklch(0.2739_0.0055_286.03)] text-xs font-mono">
          {#if gitState.status?.content_changes}
            {#each gitState.status.content_changes as change (change.path)}
              {@const badge = getStatusLabel(change.status)}
              <div class="flex items-center justify-between p-1.5 rounded hover:bg-[oklch(0.2103_0.0059_285.89)] transition-colors">
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
        <div class="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
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
          class="w-full px-3 py-2 text-xs rounded-lg bg-[oklch(0.1603_0.0059_285.89)] border border-[oklch(0.2739_0.0055_286.03)] text-white focus:outline-none focus:border-blue-500 transition-colors"
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
          class="px-3 py-1.5 text-xs text-[oklch(0.7107_0.0351_256.79)] hover:text-white cursor-pointer rounded hover:bg-[oklch(0.2739_0.0055_286.03)] transition-colors"
          disabled={gitState.isPublishing}
          onclick={() => gitState.isModalOpen = false}
        >
          Cancel
        </button>

        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          disabled={gitState.isPublishing}
          onclick={handleModalCommit}
        >
          Commit Only
        </button>

        <button
          type="button"
          class="px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
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
