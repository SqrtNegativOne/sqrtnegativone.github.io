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

<div class="flex flex-col h-[calc(100vh-7rem)] space-y-4">
  <!-- Minimal Top Action Bar (No PageHeader, no search bar) -->
  <div class="flex items-center justify-between shrink-0">
    <div class="flex items-center gap-3">
      {#if isDirty}
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          Unsaved Changes
        </span>
      {:else}
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Saved
        </span>
      {/if}
    </div>

    <div class="flex items-center gap-3">
      <!-- View mode switch -->
      <div class="flex bg-[oklch(0.2103_0.0059_285.89)] rounded p-0.5 border border-[oklch(0.2739_0.0055_286.03)] text-xs font-medium">
        <button
          type="button"
          class="px-3 py-1 rounded transition-colors {viewMode === 'edit' ? 'bg-blue-500/20 text-blue-400 font-semibold' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white'} cursor-pointer"
          onclick={() => viewMode = 'edit'}
        >
          Editor
        </button>
        <button
          type="button"
          class="px-3 py-1 rounded transition-colors {viewMode === 'split' ? 'bg-blue-500/20 text-blue-400 font-semibold' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white'} cursor-pointer"
          onclick={() => viewMode = 'split'}
        >
          Split
        </button>
        <button
          type="button"
          class="px-3 py-1 rounded transition-colors {viewMode === 'preview' ? 'bg-blue-500/20 text-blue-400 font-semibold' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white'} cursor-pointer"
          onclick={() => viewMode = 'preview'}
        >
          Preview
        </button>
      </div>

      {#if isDirty}
        <button
          type="button"
          onclick={handleDiscard}
          disabled={isSaving}
          class="btn-secondary px-3 py-1.5 text-xs cursor-pointer"
        >
          Discard
        </button>
      {/if}

      <button
        type="button"
        onclick={handleSave}
        disabled={!isDirty || isSaving}
        class="btn-primary flex items-center px-4 py-1.5 text-xs shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
    <div class="flex-1 flex items-center justify-center p-12 text-[oklch(0.60_0.02_256.79)]">
      <svg class="animate-spin h-6 w-6 mr-3 text-cyan-400" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading questions...
    </div>
  {:else}
    <!-- Expansive Split / Full Editor Layout -->
    <div class="flex-1 grid gap-4 overflow-hidden"
      style={viewMode === 'split' ? 'grid-template-columns: 1fr 1fr;' : ''}
    >
      <!-- Editor Column (Expansive, clutter-free) -->
      {#if viewMode !== 'preview'}
        <div class="flex flex-col bg-[oklch(0.2103_0.0059_285.89)] rounded border border-[oklch(0.2739_0.0055_286.03)] overflow-hidden shadow-sm h-full">
          <textarea
            bind:value={content}
            placeholder="Write questions and open problems here using standard Markdown... Separate items with blank lines."
            class="w-full h-full bg-black/30 text-white font-mono text-sm leading-relaxed p-6 focus:outline-none resize-none"
          ></textarea>
        </div>
      {/if}

      <!-- Live Preview Column (Expansive, clutter-free) -->
      {#if viewMode !== 'edit'}
        <div class="flex flex-col bg-black rounded border border-[oklch(0.2739_0.0055_286.03)] overflow-hidden shadow-sm h-full">
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
