<script lang="ts">
  import { onMount } from 'svelte';
  import markdownIt from 'markdown-it';
  import { readQuestions, writeQuestions } from '$lib/db';
  import { notificationState } from '$lib/notificationState.svelte';

  const md = markdownIt({ html: true, linkify: true, typographer: true });

  let originalContent = $state('');
  let content = $state('');
  let isLoading = $state(true);
  let isSaving = $state(false);
  let viewMode: 'split' | 'edit' | 'preview' = $state('split');

  let isDirty = $derived(content !== originalContent);
  let renderedPreview = $derived(md.render(content || '*(No content yet)*'));

  let stats = $derived(() => {
    const text = content.trim();
    if (!text) return { lines: 0, words: 0, chars: 0 };
    const lines = text.split('\n').length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    return { lines, words, chars };
  });

  async function loadData() {
    isLoading = true;
    const res = await readQuestions();
    if (res.isOk()) {
      originalContent = res.value;
      content = res.value;
    } else {
      console.error(res.error);
      notificationState.error(res.error.message, { title: 'Failed to load questions' });
    }
    isLoading = false;
  }

  async function handleSave() {
    if (isSaving || !isDirty) return;
    isSaving = true;

    const res = await writeQuestions(content);
    if (res.isOk()) {
      originalContent = content;
      notificationState.success('Questions saved and git status updated!', { title: 'Questions Saved' });
    } else {
      console.error(res.error);
      notificationState.error(res.error.message, { title: 'Failed to save questions' });
    }

    isSaving = false;
  }

  function handleDiscard() {
    if (!isDirty) return;
    if (confirm('Discard all unsaved changes to questions?')) {
      content = originalContent;
      notificationState.info('Unsaved changes discarded', { title: 'Changes Reverted' });
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  }

  onMount(() => {
    loadData();
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
  <title>Manage Questions | Admin</title>
</svelte:head>

<div class="h-full flex flex-col space-y-4 max-w-7xl mx-auto">
  <!-- Header Bar -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <div class="flex items-center gap-3">
        <h1 class="text-3xl font-bold text-white tracking-tight">Questions</h1>
        {#if isDirty}
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Unsaved Changes
          </span>
        {:else}
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Saved
          </span>
        {/if}
      </div>
      <p class="text-[oklch(0.7107_0.0351_256.79)] text-sm mt-1">
        Edit open problems and puzzles in free-form Markdown. Prerendered directly into the live site.
      </p>
    </div>

    <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
      <!-- View mode switch -->
      <div class="flex bg-[oklch(0.2103_0.0059_285.89)] rounded-lg p-1 border border-[oklch(0.2739_0.0055_286.03)] text-xs font-medium">
        <button
          type="button"
          class="px-2.5 py-1 rounded transition-colors {viewMode === 'edit' ? 'bg-blue-500/20 text-blue-400 font-semibold' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white'}"
          onclick={() => viewMode = 'edit'}
        >
          Editor
        </button>
        <button
          type="button"
          class="px-2.5 py-1 rounded transition-colors {viewMode === 'split' ? 'bg-blue-500/20 text-blue-400 font-semibold' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white'}"
          onclick={() => viewMode = 'split'}
        >
          Split
        </button>
        <button
          type="button"
          class="px-2.5 py-1 rounded transition-colors {viewMode === 'preview' ? 'bg-blue-500/20 text-blue-400 font-semibold' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white'}"
          onclick={() => viewMode = 'preview'}
        >
          Preview
        </button>
      </div>

      <button
        type="button"
        onclick={handleDiscard}
        disabled={!isDirty || isSaving}
        class="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Discard
      </button>

      <button
        type="button"
        onclick={handleSave}
        disabled={!isDirty || isSaving}
        class="btn-primary flex items-center px-4 py-1.5 text-xs shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {#if isSaving}
          <svg class="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saving...
        {:else}
          <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
          </svg>
          Save Changes
        {/if}
      </button>
    </div>
  </div>

  {#if isLoading}
    <div class="flex-1 flex items-center justify-center p-12 text-[oklch(0.7107_0.0351_256.79)]">
      <svg class="animate-spin h-6 w-6 mr-3 text-cyan-400" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading questions...
    </div>
  {:else}
    <!-- Split / Full Editor Layout -->
    <div class="flex-1 grid gap-4 overflow-hidden min-h-[500px]"
      class:grid-cols-1={viewMode !== 'split'}
      class:grid-cols-1-md-grid-cols-2={viewMode === 'split'}
      style={viewMode === 'split' ? 'grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));' : ''}
    >
      <!-- Editor Column -->
      {#if viewMode !== 'preview'}
        <div class="flex flex-col bg-[oklch(0.2103_0.0059_285.89)] rounded-xl border border-[oklch(0.2739_0.0055_286.03)] overflow-hidden shadow-sm">
          <div class="px-4 py-2.5 bg-[oklch(0.1803_0.0059_285.89)] border-b border-[oklch(0.2739_0.0055_286.03)] flex justify-between items-center text-xs text-[oklch(0.7107_0.0351_256.79)]">
            <span class="font-medium text-white flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              src/data/questions.md
            </span>
            <span>Shortcut: <kbd class="px-1.5 py-0.5 bg-black/40 rounded border border-white/10 font-mono text-[10px]">Ctrl+S</kbd></span>
          </div>

          <div class="flex-1 p-3 flex flex-col">
            <textarea
              bind:value={content}
              placeholder="Write questions and open problems here using standard Markdown... Separate items with blank lines."
              class="w-full flex-1 bg-black/30 text-white font-mono text-sm leading-relaxed p-4 rounded-lg border border-[oklch(0.2739_0.0055_286.03)] focus:outline-none focus:border-cyan-500/50 resize-none"
            ></textarea>
          </div>

          <div class="px-4 py-2 bg-[oklch(0.1803_0.0059_285.89)] border-t border-[oklch(0.2739_0.0055_286.03)] flex justify-between items-center text-[11px] text-[oklch(0.7107_0.0351_256.79)] font-mono">
            <div>
              <span>Markdown supported: <code>*italic*</code>, <code>**bold**</code>, <code>- list</code>, <code>[link](url)</code></span>
            </div>
            <div>
              {stats().lines} lines · {stats().words} words · {stats().chars} chars
            </div>
          </div>
        </div>
      {/if}

      <!-- Live Preview Column -->
      {#if viewMode !== 'edit'}
        <div class="flex flex-col bg-black rounded-xl border border-[oklch(0.2739_0.0055_286.03)] overflow-hidden shadow-sm">
          <div class="px-4 py-2.5 bg-[oklch(0.14_0_0)] border-b border-[oklch(0.25_0_0)] flex justify-between items-center text-xs text-[oklch(0.7107_0.0351_256.79)]">
            <span class="font-medium text-white flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              Live Preview (Matches Site Theme)
            </span>
            <span class="text-[10px] text-zinc-500 font-mono">/questions</span>
          </div>

          <div class="flex-1 p-6 md:p-8 overflow-y-auto bg-black text-white preview-pane">
            <h1 class="preview-title">questions։։</h1>
            <div class="preview-body">
              {@html renderedPreview}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .preview-pane {
    font-family: "Datatype", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  .preview-title {
    font-weight: 500;
    font-size: 3.5rem;
    line-height: 1;
    margin: 0 0 2rem 0;
    letter-spacing: -0.02em;
    color: oklch(1 0 0);
  }

  .preview-body :global(p) {
    font-size: 1.05rem;
    line-height: 1.6;
    margin: 0 0 1.75rem 0;
    font-weight: 400;
    white-space: pre-line;
    color: oklch(1 0 0);
  }

  .preview-body :global(ul),
  .preview-body :global(ol) {
    padding-left: 1.5rem;
    margin: 0 0 1.75rem 0;
  }

  .preview-body :global(ul) {
    list-style-type: disc;
  }

  .preview-body :global(ol) {
    list-style-type: decimal;
  }

  .preview-body :global(li) {
    font-size: 1.05rem;
    line-height: 1.6;
    margin-bottom: 1rem;
    font-weight: 400;
  }

  .preview-body :global(a) {
    color: oklch(0.429 0.2973 264.05) !important;
    text-decoration: underline !important;
  }

  .preview-body :global(blockquote) {
    border-left: 2px solid oklch(0.4 0 0);
    padding-left: 1rem;
    margin: 1.5rem 0;
    opacity: 0.85;
  }

  .preview-body :global(code) {
    background-color: oklch(0.18 0 0);
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }
</style>
