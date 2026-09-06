<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import markdownIt from 'markdown-it';
  import { readData, writeData, type NowEntry } from '$lib/db';
  import { notificationState } from '$lib/notificationState.svelte';

  let { data } = $props<{ data: { entries: NowEntry[] } }>();

  const md = markdownIt({ html: true, linkify: true, typographer: true });

  let searchQuery = $state('');
  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let isSaving = $state(false);

  // Form state
  let currentEntry = $state<NowEntry>({
    id: '',
    date: '',
    title: '',
    content: '',
    updatedAt: ''
  });

  let originalDate = $state('');
  let editorViewMode: 'split' | 'edit' | 'preview' = $state('split');

  let entries = $derived(
    [...data.entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );

  let filteredEntries = $derived(
    entries.filter((e) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        e.date.toLowerCase().includes(q) ||
        (e.title && e.title.toLowerCase().includes(q)) ||
        e.content.toLowerCase().includes(q)
      );
    })
  );

  let previewHtml = $derived(
    md.render(currentEntry.content || '*(No content written yet)*')
  );

  let formStats = $derived(() => {
    const text = currentEntry.content.trim();
    if (!text) return { lines: 0, words: 0, chars: 0 };
    const lines = text.split('\n').length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    return { lines, words, chars };
  });

  function getTodayString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function openAddModal() {
    isEditing = false;
    originalDate = '';
    const today = getTodayString();
    currentEntry = {
      id: today,
      date: today,
      title: '',
      content: '### What I\'m Learning\n- \n\n### What I\'m Building\n- \n\n### What I\'m Reading\n- \n',
      updatedAt: new Date().toISOString()
    };
    isModalOpen = true;
  }

  function openEditModal(entry: NowEntry) {
    isEditing = true;
    originalDate = entry.date;
    currentEntry = {
      id: entry.id || entry.date,
      date: entry.date,
      title: entry.title || '',
      content: entry.content || '',
      updatedAt: entry.updatedAt || ''
    };
    isModalOpen = true;
  }

  function closeModal() {
    if (isSaving) return;
    isModalOpen = false;
  }

  async function handleSave() {
    if (isSaving) return;

    const dateTrimmed = currentEntry.date.trim();
    if (!dateTrimmed) {
      notificationState.error('Date is required (YYYY-MM-DD).', { title: 'Validation Error' });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateTrimmed)) {
      notificationState.error('Date must be in format YYYY-MM-DD.', { title: 'Validation Error' });
      return;
    }

    if (!currentEntry.content.trim()) {
      notificationState.error('Content cannot be empty.', { title: 'Validation Error' });
      return;
    }

    isSaving = true;

    const currentListRes = await readData<NowEntry>('now');
    const list: NowEntry[] = currentListRes.unwrapOr([]);

    // Check for duplicate date when adding or changing date
    if (!isEditing || dateTrimmed !== originalDate) {
      if (list.some((e) => e.date === dateTrimmed)) {
        isSaving = false;
        notificationState.error(`An entry for ${dateTrimmed} already exists.`, { title: 'Duplicate Date' });
        return;
      }
    }

    const updatedEntry: NowEntry = {
      id: dateTrimmed,
      date: dateTrimmed,
      title: currentEntry.title?.trim() || undefined,
      content: currentEntry.content,
      updatedAt: new Date().toISOString()
    };

    if (isEditing) {
      const idx = list.findIndex((e) => e.date === originalDate || e.id === originalDate);
      if (idx !== -1) {
        list[idx] = updatedEntry;
      } else {
        list.push(updatedEntry);
      }
    } else {
      list.push(updatedEntry);
    }

    // Sort descending
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const saveRes = await writeData('now', list);
    if (saveRes.isOk()) {
      notificationState.success(`Saved day log for ${dateTrimmed}!`, { title: 'Entry Saved' });
      isModalOpen = false;
      await invalidateAll();
    } else {
      notificationState.error(saveRes.error.message, { title: 'Save Failed' });
    }

    isSaving = false;
  }

  async function handleDelete(entryDate: string) {
    if (!confirm(`Are you sure you want to delete the day entry for ${entryDate}?`)) {
      return;
    }

    const currentListRes = await readData<NowEntry>('now');
    const list: NowEntry[] = currentListRes.unwrapOr([]).filter((e: NowEntry) => e.date !== entryDate && e.id !== entryDate);

    const saveRes = await writeData('now', list);
    if (saveRes.isOk()) {
      notificationState.success(`Deleted day entry for ${entryDate}`, { title: 'Entry Deleted' });
      await invalidateAll();
    } else {
      notificationState.error(saveRes.error.message, { title: 'Delete Failed' });
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (isModalOpen && (e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    if (isModalOpen && e.key === 'Escape') {
      closeModal();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
  <title>Manage Now Entries | Admin</title>
</svelte:head>

<div class="space-y-6 max-w-7xl mx-auto">
  <!-- Top Header -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 class="text-3xl font-bold text-white tracking-tight">Now Entries</h1>
      <p class="text-[oklch(0.7107_0.0351_256.79)] mt-1 text-sm">
        Manage your daily log snapshots and the /now page timeline.
      </p>
    </div>

    <button
      type="button"
      onclick={openAddModal}
      class="btn-primary flex items-center shadow-lg cursor-pointer"
    >
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Add Day Entry
    </button>
  </div>

  <!-- Search and filter -->
  <div class="flex items-center gap-3">
    <div class="relative flex-1 max-w-md">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Filter by date, title, or content..."
        class="input-field pl-9 text-sm"
      />
      <svg class="w-4 h-4 absolute left-3 top-3 text-[oklch(0.7107_0.0351_256.79)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <span class="text-xs text-[oklch(0.7107_0.0351_256.79)]">
      {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
    </span>
  </div>

  <!-- List of Entries -->
  {#if filteredEntries.length === 0}
    <div class="card p-12 text-center text-[oklch(0.7107_0.0351_256.79)]">
      {#if searchQuery}
        No entries match your search "{searchQuery}".
      {:else}
        No day entries found. Click "Add Day Entry" to create your first one!
      {/if}
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4">
      {#each filteredEntries as item (item.id || item.date)}
        <div class="card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-[oklch(0.4717_0.0392_257.29)] transition-colors">
          <div class="flex-1 space-y-1">
            <div class="flex items-center gap-3">
              <span class="px-2.5 py-0.5 rounded font-mono text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                {item.date}
              </span>
              {#if item.title}
                <h3 class="text-lg font-semibold text-white">{item.title}</h3>
              {/if}
            </div>

            <p class="text-sm text-[oklch(0.7107_0.0351_256.79)] line-clamp-2 mt-1">
              {item.content.replace(/#+/g, '').replace(/[-*]/g, '').trim()}
            </p>

            <div class="flex items-center gap-4 text-xs text-[oklch(0.55_0.02_256.79)] pt-1">
              <span>{item.content.split(/\s+/).filter(Boolean).length} words</span>
              {#if item.updatedAt}
                <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
              {/if}
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onclick={() => openEditModal(item)}
              class="text-blue-400 hover:text-blue-300 text-sm px-3 py-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 font-medium transition-colors cursor-pointer"
            >
              Edit
            </button>
            <button
              type="button"
              onclick={() => handleDelete(item.date)}
              class="text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 font-medium transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Modal: Add / Edit Day Entry -->
{#if isModalOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50" onclick={closeModal}>
    <div
      class="bg-[oklch(0.23_0.015_260)] border border-[oklch(0.35_0.03_257)] rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-[oklch(0.35_0.03_257)] flex justify-between items-center bg-[oklch(0.19_0.015_260)]">
        <div>
          <h2 class="text-xl font-semibold text-white">
            {isEditing ? `Edit Day Entry (${originalDate})` : 'Add New Day Entry'}
          </h2>
          <p class="text-xs text-[oklch(0.7107_0.0351_256.79)] mt-0.5">
            Individual day page will be published at /now/{currentEntry.date}
          </p>
        </div>

        <button
          type="button"
          aria-label="Close modal"
          onclick={closeModal}
          class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 rounded transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- Date and Title fields -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="entry-date" class="block text-xs font-semibold uppercase tracking-wider text-[oklch(0.7107_0.0351_256.79)] mb-1">
              Date (YYYY-MM-DD) *
            </label>
            <input
              id="entry-date"
              type="date"
              bind:value={currentEntry.date}
              required
              class="input-field text-sm font-mono"
            />
          </div>

          <div class="md:col-span-2">
            <label for="entry-title" class="block text-xs font-semibold uppercase tracking-wider text-[oklch(0.7107_0.0351_256.79)] mb-1">
              Headline / Title (Optional)
            </label>
            <input
              id="entry-title"
              type="text"
              bind:value={currentEntry.title}
              placeholder="e.g. Systems Programming & Late-Summer Reading"
              class="input-field text-sm"
            />
          </div>
        </div>

        <!-- Editor Toolbar & View Switcher -->
        <div class="flex justify-between items-center pt-2">
          <label for="entry-content" class="text-xs font-semibold uppercase tracking-wider text-[oklch(0.7107_0.0351_256.79)]">
            Content (Markdown) *
          </label>

          <div class="flex bg-[oklch(0.18_0.015_260)] rounded-lg p-0.5 border border-[oklch(0.32_0.02_260)] text-xs">
            <button
              type="button"
              class="px-2.5 py-1 rounded transition-colors {editorViewMode === 'edit' ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white'}"
              onclick={() => editorViewMode = 'edit'}
            >
              Editor
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded transition-colors {editorViewMode === 'split' ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white'}"
              onclick={() => editorViewMode = 'split'}
            >
              Split
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded transition-colors {editorViewMode === 'preview' ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white'}"
              onclick={() => editorViewMode = 'preview'}
            >
              Preview
            </button>
          </div>
        </div>

        <!-- Editor / Preview Grid -->
        <div
          class="grid gap-4 min-h-[380px] max-h-[500px]"
          class:grid-cols-1={editorViewMode !== 'split'}
          class:md:grid-cols-2={editorViewMode === 'split'}
        >
          {#if editorViewMode !== 'preview'}
            <div class="flex flex-col bg-black/40 rounded-lg border border-[oklch(0.32_0.02_260)] overflow-hidden">
              <textarea
                id="entry-content"
                bind:value={currentEntry.content}
                placeholder="Write your day update using standard Markdown... (headings, lists, links)"
                class="w-full flex-1 bg-transparent text-white font-mono text-sm leading-relaxed p-4 focus:outline-none resize-none min-h-[340px]"
              ></textarea>
              <div class="px-3 py-1.5 bg-[oklch(0.18_0.015_260)] border-t border-[oklch(0.32_0.02_260)] text-[11px] text-[oklch(0.7107_0.0351_256.79)] font-mono flex justify-between">
                <span>Ctrl+S to save</span>
                <span>{formStats().lines} lines · {formStats().words} words</span>
              </div>
            </div>
          {/if}

          {#if editorViewMode !== 'edit'}
            <div class="flex flex-col bg-black/70 rounded-lg border border-[oklch(0.32_0.02_260)] overflow-y-auto p-5 text-white">
              <div class="border-b border-white/10 pb-3 mb-3">
                <span class="text-xs font-mono text-teal-400 font-semibold">{currentEntry.date || 'YYYY-MM-DD'}</span>
                {#if currentEntry.title}
                  <h3 class="text-xl font-serif text-white mt-1">{currentEntry.title}</h3>
                {/if}
              </div>
              <div class="now-modal-preview">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html previewHtml}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-[oklch(0.35_0.03_257)] flex justify-between items-center bg-[oklch(0.19_0.015_260)]">
        <button
          type="button"
          onclick={closeModal}
          class="btn-secondary text-sm px-4 py-2"
        >
          Cancel
        </button>

        <button
          type="button"
          onclick={handleSave}
          disabled={isSaving}
          class="btn-primary text-sm px-5 py-2 flex items-center shadow-lg disabled:opacity-50 cursor-pointer"
        >
          {#if isSaving}
            <svg class="animate-spin -ml-0.5 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          {:else}
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {isEditing ? 'Update Day Entry' : 'Publish Day Entry'}
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .now-modal-preview :global(h2),
  .now-modal-preview :global(h3) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: oklch(0.75 0.04 250);
    margin: 1rem 0 0.4rem 0;
    font-weight: 600;
  }

  .now-modal-preview :global(p) {
    font-size: 0.92rem;
    line-height: 1.6;
    margin: 0 0 0.6rem 0;
    color: oklch(0.95 0 0);
  }

  .now-modal-preview :global(ul) {
    list-style-type: disc;
    padding-left: 1.25rem;
    margin: 0 0 0.75rem 0;
  }

  .now-modal-preview :global(li) {
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 0.25rem;
  }

  .now-modal-preview :global(a) {
    color: oklch(0.65 0.22 250);
    text-decoration: underline;
  }
</style>
