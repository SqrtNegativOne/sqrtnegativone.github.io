<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import markdownIt from 'markdown-it';
  import { readData, writeData, type ArcAudience, type NowArc } from '$lib/db';
  import { notificationState } from '$lib/notificationState.svelte';
  import { uniqueSlug } from '$lib/utils';
  import SearchBar from '$lib/SearchBar.svelte';
  import EmptyState from '$lib/EmptyState.svelte';
  import Modal from '$lib/Modal.svelte';
  import { filterAndSortItems, type FilterRule, type SortRule, type FilterProperty } from '$lib/searchUtils';

  let { data } = $props<{ data: { arcs: NowArc[] } }>();

  const md = markdownIt({ html: true, linkify: true, typographer: true });

  const AUDIENCES: { value: ArcAudience; label: string; host: string }[] = [
    { value: 'professional', label: 'Professional', host: 'cv.sqrt.fyi' },
    { value: 'personal', label: 'Personal', host: 'sqrt.fyi' }
  ];
  const AUDIENCE_ORDER = AUDIENCES.map((item) => item.value);

  let searchQuery = $state('');
  let filters = $state<FilterRule[]>([]);
  let sorts = $state<SortRule[]>([]);

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let isSaving = $state(false);
  let editorViewMode: 'split' | 'edit' | 'preview' = $state('split');
  let titleInput: HTMLInputElement | undefined = $state();

  let currentArc = $state<NowArc>(blankArc());
  let originalArc = $state<NowArc>(blankArc());
  let originalId = $state('');

  let isDirty = $derived(JSON.stringify(currentArc) !== JSON.stringify(originalArc));

  $effect(() => {
    if (isModalOpen) titleInput?.focus();
  });

  const filterProperties: FilterProperty[] = [
    { value: 'title', label: 'Title', type: 'text' },
    {
      value: 'audience',
      label: 'Audience',
      type: 'select',
      options: [
        { value: 'professional', label: 'Professional' },
        { value: 'personal', label: 'Personal' }
      ]
    },
    { value: 'startDate', label: 'Start date', type: 'text' },
    { value: 'endDate', label: 'End date', type: 'text' }
  ];

  let arcs = $derived(
    [...data.arcs].sort(
      (a, b) => b.startDate.localeCompare(a.startDate) || a.title.localeCompare(b.title)
    )
  );

  let filteredArcs = $derived(
    filterAndSortItems<NowArc>({
      items: arcs,
      searchQuery,
      searchFields: ['title', 'description', 'audience', 'startDate', 'endDate'],
      filters,
      sorts
    })
  );

  let previewHtml = $derived(
    md.render(currentArc.description.trim() || '*(No description written yet)*')
  );

  let previewRange = $derived(formatRange(currentArc.startDate, currentArc.endDate));

  let formStats = $derived.by(() => {
    const text = currentArc.description.trim();
    if (!text) return { lines: 0, words: 0, chars: 0 };
    return {
      lines: text.split('\n').length,
      words: text.split(/\s+/).filter(Boolean).length,
      chars: text.length
    };
  });

  type ArcStatus = 'ongoing' | 'upcoming' | 'past' | 'invalid';

  function blankArc(): NowArc {
    return {
      id: '',
      title: '',
      startDate: getTodayString(),
      endDate: '',
      audience: ['personal'],
      description: '',
      updatedAt: ''
    };
  }

  function cloneArc(arc: NowArc): NowArc {
    return {
      ...arc,
      audience: Array.isArray(arc.audience) ? [...arc.audience] : []
    };
  }

  function getTodayString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function isValidDateString(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }

  function formatDate(value: string | undefined): string {
    if (!value) return '—';
    if (!isValidDateString(value)) return value;

    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  }

  function formatRange(startDate: string, endDate?: string): string {
    const start = startDate ? formatDate(startDate) : 'No start';
    return `${start} – ${endDate ? formatDate(endDate) : 'present'}`;
  }

  function arcStatus(arc: NowArc): ArcStatus {
    if (!isValidDateString(arc.startDate)) return 'invalid';

    const endDate = arc.endDate?.trim();
    if (endDate && !isValidDateString(endDate)) return 'invalid';
    if (endDate && endDate < arc.startDate) return 'invalid';

    const today = getTodayString();
    if (arc.startDate > today) return 'upcoming';
    if (endDate && endDate < today) return 'past';
    return 'ongoing';
  }

  function statusLabel(status: ArcStatus): string {
    switch (status) {
      case 'ongoing':
        return 'Ongoing';
      case 'upcoming':
        return 'Upcoming';
      case 'past':
        return 'Past';
      default:
        return 'Invalid dates';
    }
  }

  function statusClass(status: ArcStatus): string {
    switch (status) {
      case 'ongoing':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'upcoming':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'past':
        return 'bg-white/5 text-[oklch(0.7107_0.0351_256.79)] border-white/10';
      default:
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
  }

  function audienceClass(audience: ArcAudience): string {
    return audience === 'professional'
      ? 'bg-sky-500/10 text-sky-300 border-sky-500/20'
      : 'bg-pink-500/10 text-pink-300 border-pink-500/20';
  }

  function toggleAudience(audience: ArcAudience) {
    const next = currentArc.audience.includes(audience)
      ? currentArc.audience.filter((item) => item !== audience)
      : [...currentArc.audience, audience];

    currentArc.audience = next.sort(
      (a, b) => AUDIENCE_ORDER.indexOf(a) - AUDIENCE_ORDER.indexOf(b)
    );
  }

  function plainText(markdown: string): string {
    return markdown
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/[#>*_`~|[\]-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function openAddModal(initialTitle: string | Event = '') {
    const title = typeof initialTitle === 'string' ? initialTitle : '';
    isEditing = false;
    originalId = '';
    currentArc = { ...blankArc(), title };
    originalArc = cloneArc(currentArc);
    isModalOpen = true;
  }

  function openEditModal(arc: NowArc) {
    isEditing = true;
    originalId = arc.id;
    currentArc = cloneArc({
      ...arc,
      description: arc.description ?? '',
      startDate: arc.startDate ?? '',
      endDate: arc.endDate ?? ''
    });
    originalArc = cloneArc(currentArc);
    isModalOpen = true;
  }

  function closeModal() {
    if (isSaving) return;
    isModalOpen = false;
  }

  async function handleSave() {
    if (isSaving) return;

    const title = currentArc.title.trim();
    if (!title) {
      notificationState.error('Title is required.', { title: 'Validation Error' });
      return;
    }

    if (!isValidDateString(currentArc.startDate)) {
      notificationState.error('Start date must be a valid date (YYYY-MM-DD).', {
        title: 'Validation Error'
      });
      return;
    }

    const endDate = currentArc.endDate?.trim() ?? '';

    if (endDate && !isValidDateString(endDate)) {
      notificationState.error('End date must be a valid date (YYYY-MM-DD), or left blank.', {
        title: 'Validation Error'
      });
      return;
    }

    if (endDate && endDate < currentArc.startDate) {
      notificationState.error('End date cannot be before the start date.', {
        title: 'Validation Error'
      });
      return;
    }

    if (currentArc.audience.length === 0) {
      notificationState.error('Pick at least one audience (professional or personal).', {
        title: 'Validation Error'
      });
      return;
    }

    if (!currentArc.description.trim()) {
      notificationState.error('Description cannot be empty.', { title: 'Validation Error' });
      return;
    }

    isSaving = true;

    const currentListRes = await readData<NowArc>('now');
    const list: NowArc[] = currentListRes.unwrapOr([]);

    const id = isEditing
      ? currentArc.id
      : uniqueSlug(
          title,
          list.map((arc) => arc.id),
          'arc'
        );

    const updatedArc: NowArc = {
      id,
      title,
      startDate: currentArc.startDate,
      endDate: endDate || undefined,
      audience: [...currentArc.audience],
      description: currentArc.description,
      updatedAt: new Date().toISOString()
    };

    const existingIndex = list.findIndex((arc) => arc.id === (isEditing ? originalId : id));
    if (existingIndex !== -1) {
      list[existingIndex] = updatedArc;
    } else {
      list.push(updatedArc);
    }

    list.sort(
      (a, b) => b.startDate.localeCompare(a.startDate) || a.title.localeCompare(b.title)
    );

    const saveRes = await writeData('now', list);
    if (saveRes.isOk()) {
      notificationState.success(`Saved arc "${title}".`, { title: 'Arc Saved' });
      isModalOpen = false;
      await invalidateAll();
    } else {
      notificationState.error(saveRes.error.message, { title: 'Save Failed' });
    }

    isSaving = false;
  }

  async function handleDelete(arc: NowArc) {
    if (!confirm(`Delete the arc "${arc.title}"? This cannot be undone.`)) return;

    const currentListRes = await readData<NowArc>('now');
    const list = currentListRes.unwrapOr([]).filter((item) => item.id !== arc.id);

    const saveRes = await writeData('now', list);
    if (saveRes.isOk()) {
      notificationState.success(`Deleted arc "${arc.title}".`, { title: 'Arc Deleted' });
      await invalidateAll();
    } else {
      notificationState.error(saveRes.error.message, { title: 'Delete Failed' });
    }
  }
</script>

<svelte:head>
  <title>Manage Now | Admin</title>
</svelte:head>

<div class="space-y-6">
  <SearchBar
    bind:value={searchQuery}
    bind:filters
    bind:sorts
    properties={filterProperties}
    totalCount={arcs.length}
    filteredCount={filteredArcs.length}
    onnew={openAddModal}
  >
    {#snippet extra()}
      <button
        type="button"
        onclick={() => openAddModal()}
        class="btn-primary text-sm flex items-center gap-1.5 px-3 py-2 shrink-0 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        New Arc
      </button>
    {/snippet}
  </SearchBar>

  {#if filteredArcs.length === 0}
    <EmptyState
      title={searchQuery || filters.length > 0 ? 'No matching arcs' : 'No arcs yet'}
      message={searchQuery || filters.length > 0
        ? 'No arcs match your search or filters.'
        : 'Add a dated arc to build your /now page and the CV focus list.'}
      actionLabel={searchQuery || filters.length > 0 ? undefined : 'New Arc'}
      onaction={searchQuery || filters.length > 0 ? undefined : openAddModal}
    />
  {:else}
    <div class="grid grid-cols-1 gap-4">
      {#each filteredArcs as arc (arc.id)}
        {@const status = arcStatus(arc)}
        <div
          class="card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-[oklch(0.35_0.01_286)] transition-colors"
        >
          <div class="flex-1 min-w-0 space-y-2">
            <div class="flex items-center gap-3 flex-wrap">
              <span
                class="px-2.5 py-0.5 rounded border font-mono text-[11px] font-semibold uppercase tracking-wide {statusClass(status)}"
              >
                {statusLabel(status)}
              </span>
              <h3 class="text-lg font-semibold text-white truncate">{arc.title}</h3>
            </div>

            <p class="font-mono text-xs text-[oklch(0.60_0.02_256.79)]">
              {formatRange(arc.startDate, arc.endDate)}
            </p>

            <div class="flex flex-wrap items-center gap-1.5">
              {#each AUDIENCES.filter((item) => arc.audience?.includes(item.value)) as item (item.value)}
                <span class="px-2 py-0.5 rounded border text-[11px] font-medium {audienceClass(item.value)}">
                  {item.label}
                  <span class="opacity-60">· {item.host}</span>
                </span>
              {/each}
              {#if !arc.audience || arc.audience.length === 0}
                <span class="px-2 py-0.5 rounded border text-[11px] font-medium bg-red-500/10 text-red-400 border-red-500/20">
                  No audience
                </span>
              {/if}
            </div>

            <p class="text-sm text-[oklch(0.60_0.02_256.79)] line-clamp-2">
              {plainText(arc.description)}
            </p>

            <div class="flex items-center gap-4 text-xs text-[oklch(0.50_0.01_286.03)] pt-1">
              <span>{plainText(arc.description).split(/\s+/).filter(Boolean).length} words</span>
              {#if arc.updatedAt}
                <span>Updated {new Date(arc.updatedAt).toLocaleDateString()}</span>
              {/if}
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onclick={() => openEditModal(arc)}
              class="text-blue-400 hover:text-blue-300 text-sm px-3 py-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 font-medium transition-colors cursor-pointer"
            >
              Edit
            </button>
            <button
              type="button"
              onclick={() => handleDelete(arc)}
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

<!-- Modal: Add / Edit Arc -->
{#if isModalOpen}
  <Modal
    title={isEditing ? 'Edit Arc' : 'New Arc'}
    maxWidth="5xl"
    dirty={isDirty}
    saving={isSaving}
    onsave={handleSave}
    onclose={closeModal}
  >
    <!-- Title and dates -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="md:col-span-2">
        <label for="arc-title" class="block text-xs font-semibold uppercase tracking-wider text-[oklch(0.60_0.02_256.79)] mb-1">
          Title *
        </label>
        <input
          id="arc-title"
          type="text"
          bind:this={titleInput}
          bind:value={currentArc.title}
          placeholder="e.g. Learning systems programming"
          class="input-field text-sm"
        />
      </div>

      <div>
        <label for="arc-start" class="block text-xs font-semibold uppercase tracking-wider text-[oklch(0.60_0.02_256.79)] mb-1">
          Start date *
        </label>
        <input
          id="arc-start"
          type="date"
          bind:value={currentArc.startDate}
          required
          class="input-field text-sm font-mono"
        />
      </div>

      <div>
        <label for="arc-end" class="block text-xs font-semibold uppercase tracking-wider text-[oklch(0.60_0.02_256.79)] mb-1">
          End date <span class="normal-case font-normal opacity-60">(optional)</span>
        </label>
        <input
          id="arc-end"
          type="date"
          bind:value={currentArc.endDate}
          class="input-field text-sm font-mono"
        />
        <p class="mt-1 text-[11px] text-[oklch(0.60_0.02_256.79)]">
          Leave blank if it's still ongoing.
        </p>
      </div>
    </div>

    <!-- Audience multiselect -->
    <fieldset>
      <legend class="block text-xs font-semibold uppercase tracking-wider text-[oklch(0.60_0.02_256.79)] mb-2">
        Audience * <span class="normal-case font-normal opacity-60">(choose one or both)</span>
      </legend>

      <div class="flex flex-wrap gap-2">
        {#each AUDIENCES as option (option.value)}
          {@const selected = currentArc.audience.includes(option.value)}
          <label
            class="flex items-center gap-2.5 px-3.5 py-2.5 rounded border cursor-pointer select-none transition-colors {selected
              ? 'bg-teal-500/10 border-teal-500/40 text-teal-200'
              : 'bg-black/20 border-[oklch(0.2739_0.0055_286.03)] text-[oklch(0.7107_0.0351_256.79)] hover:border-[oklch(0.40_0.005_286.03)]'}"
          >
            <input
              type="checkbox"
              class="accent-teal-500"
              checked={selected}
              onchange={() => toggleAudience(option.value)}
            />
            <span class="text-sm font-medium">{option.label}</span>
            <span class="text-[11px] font-mono opacity-60">{option.host}</span>
          </label>
        {/each}
      </div>

      <p class="mt-2 text-xs text-[oklch(0.60_0.02_256.79)]">
        Professional shows only on cv.sqrt.fyi, personal only on sqrt.fyi. Selecting both
        publishes the arc to both /now pages.
      </p>
    </fieldset>

    <!-- Editor toolbar & view switcher -->
    <div class="flex justify-between items-center pt-2">
      <label for="arc-description" class="text-xs font-semibold uppercase tracking-wider text-[oklch(0.60_0.02_256.79)]">
        Description (Markdown) *
      </label>

      <div class="flex bg-[oklch(0.1803_0.0059_285.89)] rounded p-0.5 border border-[oklch(0.2739_0.0055_286.03)] text-xs">
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

    <!-- Editor / preview grid -->
    <div
      class="grid gap-4 min-h-[380px] max-h-[500px]"
      class:grid-cols-1={editorViewMode !== 'split'}
      class:md:grid-cols-2={editorViewMode === 'split'}
    >
      {#if editorViewMode !== 'preview'}
        <div class="flex flex-col bg-black/40 rounded border border-[oklch(0.2739_0.0055_286.03)] overflow-hidden">
          <textarea
            id="arc-description"
            bind:value={currentArc.description}
            placeholder="Describe what this arc is about, what you're doing, and what you're learning..."
            class="w-full flex-1 bg-transparent text-white font-mono text-sm leading-relaxed p-4 focus:outline-none resize-none min-h-[340px]"
          ></textarea>
          <div class="px-3 py-1.5 bg-[oklch(0.1803_0.0059_285.89)] border-t border-[oklch(0.2739_0.0055_286.03)] text-[11px] text-[oklch(0.7107_0.0351_256.79)] font-mono flex justify-between">
            <span>Ctrl+S to save</span>
            <span>{formStats.lines} lines · {formStats.words} words</span>
          </div>
        </div>
      {/if}

      {#if editorViewMode !== 'edit'}
        <div class="flex flex-col bg-black/70 rounded border border-[oklch(0.2739_0.0055_286.03)] overflow-y-auto p-5 text-white">
          <div class="border-b border-white/10 pb-3 mb-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded border font-mono text-[10px] font-semibold uppercase tracking-wide {statusClass(arcStatus(currentArc))}">
                {statusLabel(arcStatus(currentArc))}
              </span>
              <span class="text-[11px] font-mono text-teal-400">{previewRange}</span>
            </div>

            {#if currentArc.title}
              <h3 class="text-xl font-serif text-white mt-2">{currentArc.title}</h3>
            {/if}

            <div class="flex flex-wrap gap-1.5 mt-2">
              {#each AUDIENCES.filter((item) => currentArc.audience.includes(item.value)) as item (item.value)}
                <span class="px-1.5 py-0.5 rounded border text-[10px] {audienceClass(item.value)}">
                  {item.label}
                </span>
              {/each}
            </div>
          </div>

          <div class="now-modal-preview">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html previewHtml}
          </div>
        </div>
      {/if}
    </div>

    {#snippet footer()}
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
          {isEditing ? 'Update Arc' : 'Publish Arc'}
        {/if}
      </button>
    {/snippet}
  </Modal>
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

  .now-modal-preview :global(ul),
  .now-modal-preview :global(ol) {
    padding-left: 1.25rem;
    margin: 0 0 0.75rem 0;
  }

  .now-modal-preview :global(ul) {
    list-style-type: disc;
  }

  .now-modal-preview :global(ol) {
    list-style-type: decimal;
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

  .now-modal-preview :global(code) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.85em;
    background: oklch(1 0 0 / 0.08);
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
  }

  .now-modal-preview :global(blockquote) {
    margin: 0 0 0.75rem 0;
    padding-left: 0.85rem;
    border-left: 2px solid oklch(1 0 0 / 0.2);
    color: oklch(0.8 0 0);
  }
</style>
