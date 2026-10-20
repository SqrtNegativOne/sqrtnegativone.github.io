<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { assetState } from '$lib/assetState.svelte';
  import { getPosterUrl } from '../../../../shared/utils/getPosterUrl';
  import {
    defaultUnitForType,
    formatCheckpoint,
    formatLogDate,
    groupEventsByMonth,
    localLogStamp,
    LOG_KIND_LABEL,
    PROGRESS_UNIT_LABEL,
    todayStamp
  } from '../../../../shared/lib/mediaLog';
  import type {
    MediaItem,
    MediaLogEvent,
    MediaLogKind,
    MediaProgressUnit,
    MediaVisibility
  } from '../../../../shared/types';
  import { mediaLogState } from './mediaLogState.svelte';

  interface Props {
    media?: MediaItem[];
    onOpenItem?: (item: MediaItem) => void;
    /** Preselect an item when arriving from the EditModal's "Open log" link. */
    initialMediaId?: string | null;
    onInitialConsumed?: () => void;
  }

  let { media = [], onOpenItem, initialMediaId = null, onInitialConsumed }: Props = $props();

  const QUICK_KINDS: MediaLogKind[] = [
    'start',
    'checkpoint',
    'finish',
    'drop',
    'shelve',
    'resume',
    'note'
  ];

  const KINDS_WITH_ROUND = new Set<MediaLogKind>(['start', 'checkpoint', 'finish']);
  const VISIBILITY_FILTERS: ('all' | 'public' | 'private')[] = ['all', 'public', 'private'];

  let query = $state('');
  let selected = $state<MediaItem | null>(null);
  let kind = $state<MediaLogKind>('checkpoint');
  let date = $state(todayStamp());
  let time = $state(localLogStamp().slice(11, 16));
  let unit = $state<MediaProgressUnit | null>(null);
  let unitValue = $state('');
  let value = $state<string>('');
  let total = $state<string>('');
  let round = $state(1);
  let note = $state('');
  let isPublic = $state(false);
  let updateStatus = $state(true);
  let saving = $state(false);

  let visibilityFilter = $state<'all' | 'public' | 'private'>('all');
  let logSearch = $state('');
  let lastInitial = $state<string | null>(null);

  $effect(() => {
    if (!initialMediaId) {
      lastInitial = null;
      return;
    }
    if (initialMediaId === lastInitial) return;
    const item = media.find((entry) => entry.id === initialMediaId);
    if (!item) return;
    lastInitial = initialMediaId;
    selectItem(item);
    onInitialConsumed?.();
  });

  const matches = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q || selected) return [];
    return media
      .filter((item) => {
        const haystack = `${item.title} ${item.author ?? ''} ${item.publisher ?? ''}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 6);
  });

  const itemById = $derived(new Map(media.map((item) => [item.id, item])));

  const filteredEvents = $derived.by(() => {
    const q = logSearch.trim().toLowerCase();
    return mediaLogState.events
      .filter((event) => itemById.has(event.media_id))
      .filter((event) => visibilityFilter === 'all' || event.visibility === visibilityFilter)
      .filter((event) => {
        if (!q) return true;
        const item = itemById.get(event.media_id);
        return `${item?.title ?? ''} ${event.note ?? ''} ${LOG_KIND_LABEL[event.kind]}`.toLowerCase().includes(q);
      });
  });

  const groups = $derived(groupEventsByMonth(filteredEvents));
  const publicCount = $derived(mediaLogState.publicEvents.length);

  function selectItem(item: MediaItem) {
    selected = item;
    query = '';
    unit = defaultUnitForType(item.type);
    unitValue = unit ? unit : '';
    value = '';
    total = '';
    kind = 'checkpoint';
  }

  function clearSelection() {
    selected = null;
    query = '';
  }

  function onUnitChange(next: string) {
    unitValue = next;
    unit = (next || null) as MediaProgressUnit | null;
  }

  function buildAt(): string {
    const day = date || todayStamp();
    return time ? `${day}T${time}` : day;
  }

  async function save() {
    if (!selected || saving) return;
    saving = true;
    try {
      const ok = await mediaLogState.addEvent({
        media_id: selected.id,
        kind,
        at: buildAt(),
        round,
        unit: kind === 'checkpoint' ? unit : undefined,
        value: kind === 'checkpoint' && value !== '' ? Number(value) : undefined,
        total: kind === 'checkpoint' && total !== '' ? Number(total) : undefined,
        note,
        visibility: isPublic ? 'public' : 'private',
        updateStatus
      });
      if (ok) {
        value = '';
        total = '';
        note = '';
        // Private by default: a single public entry must not flip the default
        // for everything logged afterwards.
        isPublic = false;
        await invalidateAll();
      }
    } finally {
      saving = false;
    }
  }

  async function toggleVisibility(event: MediaLogEvent) {
    const next: MediaVisibility = event.visibility === 'public' ? 'private' : 'public';
    await mediaLogState.setVisibility(event.id, next);
  }

  async function removeEvent(event: MediaLogEvent) {
    if (!confirm(`Delete this ${LOG_KIND_LABEL[event.kind].toLowerCase()} entry?`)) return;
    await mediaLogState.removeEvent(event.id);
  }

  function posterFor(item: MediaItem | undefined): string {
    return item?.poster_image ? assetState.resolve(getPosterUrl(item.poster_image)) : '';
  }
</script>

<div class="space-y-6">
  <!-- Quick capture -->
  <section class="card p-5 space-y-4">
    <div class="flex items-baseline justify-between gap-4">
      <h2 class="text-sm font-mono uppercase tracking-[0.16em] text-[oklch(0.7107_0.0351_256.79)]">Log an entry</h2>
      <p class="text-[11px] font-mono uppercase tracking-[0.12em] text-[oklch(0.5416_0.0154_285.87)]">
        {mediaLogState.events.length} events · {publicCount} public
      </p>
    </div>

    <!-- Title picker -->
    <div class="relative">
      {#if selected}
        <div class="flex items-center gap-4 rounded border border-[oklch(0.2739_0.0055_286.03)] bg-black/20 p-3">
          <div class="h-16 w-11 shrink-0 overflow-hidden rounded bg-black/40">
            {#if selected.poster_image}
              <img src={posterFor(selected)} alt="" class="h-full w-full object-cover" />
            {/if}
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium text-white">{selected.title}</div>
            <div class="text-[11px] uppercase tracking-wider text-[oklch(0.7107_0.0351_256.79)]">
              {selected.type} · {selected.status}
            </div>
          </div>
          <button type="button" onclick={clearSelection} class="btn-secondary text-xs">Change</button>
        </div>
      {:else}
        <label for="log-title" class="mb-2 block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Title</label>
        <input
          id="log-title"
          type="text"
          bind:value={query}
          class="input-field"
          placeholder="Search your library..."
          autocomplete="off"
        />
        {#if matches.length > 0}
          <div class="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded border border-[oklch(0.2739_0.0055_286.03)] bg-[oklch(0.1603_0.0059_285.89)] shadow-2xl shadow-black/60">
            {#each matches as item (item.id)}
              <button
                type="button"
                onclick={() => selectItem(item)}
                class="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/5"
              >
                <div class="h-10 w-7 shrink-0 overflow-hidden rounded bg-black/40">
                  {#if item.poster_image}
                    <img src={posterFor(item)} alt="" class="h-full w-full object-cover" />
                  {/if}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm text-white">{item.title}</div>
                  <div class="truncate text-[11px] uppercase tracking-wider text-[oklch(0.7107_0.0351_256.79)]">
                    {item.type} · {item.status}
                  </div>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      {/if}
    </div>

    <!-- Kind -->
    <div class="flex flex-wrap gap-2">
      {#each QUICK_KINDS as option (option)}
        <button
          type="button"
          onclick={() => kind = option}
          class="rounded border px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors {kind === option
            ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
            : 'border-[oklch(0.2739_0.0055_286.03)] bg-white/[0.02] text-[oklch(0.7107_0.0351_256.79)] hover:bg-white/5'}"
        >
          {LOG_KIND_LABEL[option]}
        </button>
      {/each}
    </div>

    <!-- Date / round / checkpoint -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
      <div class="space-y-1">
        <label for="log-date" class="block text-[11px] font-mono uppercase tracking-[0.12em] text-[oklch(0.60_0.02_256.79)]">Date</label>
        <input id="log-date" type="date" bind:value={date} class="input-field [color-scheme:dark]" />
      </div>
      <div class="space-y-1">
        <label for="log-time" class="block text-[11px] font-mono uppercase tracking-[0.12em] text-[oklch(0.60_0.02_256.79)]">Time (optional)</label>
        <input id="log-time" type="time" bind:value={time} class="input-field [color-scheme:dark]" />
      </div>
      {#if KINDS_WITH_ROUND.has(kind)}
        <div class="space-y-1">
          <label for="log-round" class="block text-[11px] font-mono uppercase tracking-[0.12em] text-[oklch(0.60_0.02_256.79)]">Round</label>
          <input id="log-round" type="number" min="1" step="1" bind:value={round} class="input-field" />
        </div>
      {/if}
      {#if kind === 'checkpoint'}
        <div class="space-y-1">
          <label for="log-unit" class="block text-[11px] font-mono uppercase tracking-[0.12em] text-[oklch(0.60_0.02_256.79)]">Unit</label>
          <select id="log-unit" value={unitValue} onchange={(e) => onUnitChange(e.currentTarget.value)} class="input-field">
            <option value="">No unit</option>
            {#each Object.entries(PROGRESS_UNIT_LABEL) as [unitKey, unitLabel] (unitKey)}
              <option value={unitKey}>{unitLabel}</option>
            {/each}
          </select>
        </div>
      {/if}
    </div>

    {#if kind === 'checkpoint'}
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="space-y-1">
          <label for="log-value" class="block text-[11px] font-mono uppercase tracking-[0.12em] text-[oklch(0.60_0.02_256.79)]">Progress</label>
          <input id="log-value" type="number" step="any" bind:value={value} class="input-field" placeholder={unit === 'hour' ? 'e.g. 12' : 'e.g. 4'} />
        </div>
        <div class="space-y-1">
          <label for="log-total" class="block text-[11px] font-mono uppercase tracking-[0.12em] text-[oklch(0.60_0.02_256.79)]">Total (optional)</label>
          <input id="log-total" type="number" step="any" bind:value={total} class="input-field" placeholder="e.g. 8" />
        </div>
      </div>
    {/if}

    <div class="space-y-1">
      <label for="log-note" class="block text-[11px] font-mono uppercase tracking-[0.12em] text-[oklch(0.60_0.02_256.79)]">Note (optional)</label>
      <textarea id="log-note" bind:value={note} class="input-field min-h-[70px] resize-y" placeholder="How did it go?"></textarea>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-5">
        <label class="flex cursor-pointer select-none items-center gap-2 text-sm text-[oklch(0.7107_0.0351_256.79)]" title="Appears on sqrt.fyi after the next publish">
          <input type="checkbox" bind:checked={isPublic} class="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500" />
          Make public
        </label>
        <label class="flex cursor-pointer select-none items-center gap-2 text-sm text-[oklch(0.7107_0.0351_256.79)]">
          <input type="checkbox" bind:checked={updateStatus} class="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500" />
          Update status
        </label>
      </div>
      <button type="button" onclick={save} disabled={!selected || saving} class="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
        {saving ? 'Saving...' : 'Log it'}
      </button>
    </div>
  </section>

  <!-- Timeline -->
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-sm font-mono uppercase tracking-[0.16em] text-[oklch(0.7107_0.0351_256.79)]">Timeline</h2>
      <div class="flex items-center gap-2">
        <div class="w-40">
          <input type="text" bind:value={logSearch} placeholder="Filter..." class="input-field" />
        </div>
        {#each VISIBILITY_FILTERS as filter (filter)}
          <button
            type="button"
            onclick={() => visibilityFilter = filter}
            class="rounded border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors {visibilityFilter === filter
              ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
              : 'border-[oklch(0.2739_0.0055_286.03)] text-[oklch(0.7107_0.0351_256.79)] hover:bg-white/5'}"
          >
            {filter}
          </button>
        {/each}
      </div>
    </div>

    {#if mediaLogState.loading && !mediaLogState.loaded}
      <p class="text-sm text-[oklch(0.60_0.02_256.79)]">Loading log...</p>
    {:else if groups.length === 0}
      <div class="card p-8 text-center text-[oklch(0.7107_0.0351_256.79)]">
        Nothing logged yet. Pick a title above and log a start, checkpoint, or finish.
      </div>
    {:else}
      {#each groups as group (group.key)}
        <div class="space-y-2">
          <h3 class="text-[11px] font-mono uppercase tracking-[0.16em] text-[oklch(0.5416_0.0154_285.87)]">{group.label}</h3>
          <div class="card divide-y divide-[oklch(0.2739_0.0055_286.03)]">
            {#each group.events as event (event.id)}
              {@const item = itemById.get(event.media_id)}
              <div class="flex items-center gap-3 p-3">
                <button
                  type="button"
                  onclick={() => item && onOpenItem?.(item)}
                  class="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <div class="h-14 w-10 shrink-0 overflow-hidden rounded bg-black/40">
                    {#if item?.poster_image}
                      <img src={posterFor(item)} alt="" class="h-full w-full object-cover" />
                    {/if}
                  </div>
                  <div class="min-w-0">
                    <div class="truncate text-sm font-medium text-white">{item?.title ?? event.media_id}</div>
                    <div class="text-[11px] uppercase tracking-wider text-[oklch(0.7107_0.0351_256.79)]">
                      {LOG_KIND_LABEL[event.kind]}{event.kind === 'checkpoint' ? ` · ${formatCheckpoint(event)}` : ''}
                      {#if (event.round ?? 1) > 1} · Round {event.round}{/if}
                    </div>
                    {#if event.note}
                      <p class="mt-1 line-clamp-2 text-xs text-[oklch(0.60_0.02_256.79)]">{event.note}</p>
                    {/if}
                  </div>
                </button>

                <div class="flex shrink-0 items-center gap-3">
                  <span class="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-[oklch(0.5416_0.0154_285.87)] sm:inline">
                    {formatLogDate(event.at, true)}
                  </span>
                  <button
                    type="button"
                    onclick={() => toggleVisibility(event)}
                    class="rounded border px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors {event.visibility === 'public'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                      : 'border-[oklch(0.2739_0.0055_286.03)] text-[oklch(0.7107_0.0351_256.79)] hover:bg-white/5'}"
                    title={event.visibility === 'public' ? 'Visible on the site; click to make private' : 'Private; click to publish to the site'}
                  >
                    {event.visibility === 'public' ? 'Public' : 'Private'}
                  </button>
                  <button
                    type="button"
                    onclick={() => removeEvent(event)}
                    class="text-[11px] text-red-400/70 transition-colors hover:text-red-400"
                    aria-label="Delete log entry"
                  >
                    Delete
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    {/if}
  </section>
</div>
