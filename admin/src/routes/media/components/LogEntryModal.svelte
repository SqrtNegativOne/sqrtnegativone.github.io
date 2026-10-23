<script lang="ts">
  import { tick, untrack } from 'svelte';
  import Modal from '$lib/Modal.svelte';
  import { assetState } from '$lib/assetState.svelte';
  import { getPosterUrl } from '../../../../../shared/utils/getPosterUrl';
  import {
    defaultUnitForType,
    eventLabel,
    formatLogDate,
    localLogStamp,
    LOG_KIND_LABEL,
    PROGRESS_UNIT_LABEL,
    statusForEvent,
    todayStamp
  } from '../../../../../shared/lib/mediaLog';
  import type { MediaItem, MediaLogEvent, MediaLogKind, MediaProgressUnit, MediaVisibility } from '../../../../../shared/types';
  import { mediaLogState } from '../mediaLogState.svelte';

  interface Props {
    open?: boolean;
    media?: MediaItem[];
    /** `YYYY-MM-DD`; the cell that was clicked, or today for Ctrl+N. */
    date?: string;
    initialMediaId?: string | null;
    /** Edit an existing entry instead of creating one. */
    eventId?: string | null;
    /** Everything logged for the same title on the same day, oldest first. */
    siblings?: MediaLogEvent[];
    onchange?: (day: string) => void;
    onsaved?: (day: string) => void;
  }

  let {
    open = $bindable(false),
    media = [],
    date = '',
    initialMediaId = null,
    eventId = null,
    siblings = [],
    onchange,
    onsaved
  }: Props = $props();

  // Every remaining kind is a consumption event, so all of them take a round
  // and an optional progress snapshot.
  const KINDS: MediaLogKind[] = ['start', 'checkpoint', 'finish', 'drop', 'shelve', 'resume'];
  const today = todayStamp();

  let activeId = $state<string | null>(null);
  let query = $state('');
  let selected = $state<MediaItem | null>(null);
  let kind = $state<MediaLogKind>('checkpoint');
  let formDate = $state(today);
  let time = $state('');
  let unit = $state<MediaProgressUnit | null>(null);
  let unitValue = $state('');
  let value = $state('');
  let total = $state('');
  let round = $state(1);
  let note = $state('');
  let isPublic = $state(false);
  let updateStatus = $state(true);
  let targetStatus = $state('consuming');
  let showProgress = $state(false);
  let saving = $state(false);
  let baseline = $state('');
  let searchInput: HTMLInputElement | undefined = $state();

  const editing = $derived(Boolean(activeId));
  const dateAllowed = $derived(Boolean(formDate) && formDate <= today);

  // Re-seed the form whenever the dialog opens or a different entry is chosen.
  $effect(() => {
    if (!open) return;
    const incoming = eventId;
    untrack(() => {
      activeId = incoming ?? null;
      loadForm(incoming);
    });
  });

  function snapshot(): string {
    return JSON.stringify({
      query,
      selectedId: selected?.id ?? '',
      kind,
      formDate,
      time,
      round,
      unit: showProgress ? unit : null,
      value: showProgress ? value : '',
      total: showProgress ? total : '',
      note,
      isPublic,
      updateStatus,
      targetStatus
    });
  }

  const dirty = $derived(snapshot() !== baseline);

  function loadForm(id: string | null) {
    selected = null;
    query = '';
    kind = 'checkpoint';
    targetStatus = 'consuming';
    formDate = date || today;
    time = localLogStamp().slice(11, 16);
    unit = null;
    unitValue = '';
    value = '';
    total = '';
    round = 1;
    note = '';
    isPublic = false;
    updateStatus = true;
    showProgress = false;
    saving = false;

    const entry = id ? mediaLogState.events.find((event) => event.id === id) : null;
    if (entry) {
      selected = media.find((item) => item.id === entry.media_id) ?? null;
      kind = entry.kind;
      targetStatus = kind === 'finish'
        ? (selected?.status === 'rewishlist' ? 'rewishlist' : 'finished')
        : (statusForEvent(kind) ?? '');
      formDate = entry.at.slice(0, 10);
      time = /T\d{2}:\d{2}/.test(entry.at) ? entry.at.slice(11, 16) : '';
      round = entry.round ?? 1;
      unit = entry.unit ?? null;
      unitValue = unit ?? '';
      value = entry.value !== undefined && entry.value !== null ? String(entry.value) : '';
      total = entry.total !== undefined && entry.total !== null ? String(entry.total) : '';
      note = entry.note ?? '';
      isPublic = entry.visibility === 'public';
      showProgress = Boolean(entry.unit || value !== '' || total !== '');
    } else {
      selected = media.find((item) => item.id === initialMediaId) ?? null;
      kind = 'checkpoint';
      targetStatus = 'consuming';
      if (selected) {
        unit = defaultUnitForType(selected.type);
        unitValue = unit ?? '';
      }
    }

    baseline = snapshot();
  }

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

  function posterFor(item: MediaItem | undefined): string {
    return item?.poster_image ? assetState.resolve(getPosterUrl(item.poster_image)) : '';
  }

  function selectItem(item: MediaItem) {
    selected = item;
    query = '';
    kind = 'checkpoint';
    targetStatus = 'consuming';
    unit = defaultUnitForType(item.type);
    unitValue = unit ?? '';
    value = '';
    total = '';
  }

  function setKind(option: MediaLogKind) {
    kind = option;
    if (option === 'finish') {
      if (targetStatus !== 'finished' && targetStatus !== 'rewishlist') {
        targetStatus = selected?.status === 'rewishlist' ? 'rewishlist' : 'finished';
      }
    } else {
      targetStatus = statusForEvent(option) ?? '';
    }
  }

  function changeSelection() {
    selected = null;
    void tick().then(() => searchInput?.focus());
  }

  function selectSibling(id: string) {
    activeId = id;
    loadForm(id);
  }

  function onUnitChange(next: string) {
    unitValue = next;
    unit = (next || null) as MediaProgressUnit | null;
  }

  async function save() {
    if (!selected || saving || !dateAllowed) return;
    saving = true;
    try {
      const payload = {
        media_id: selected.id,
        kind,
        at: time ? `${formDate}T${time}` : formDate,
        round,
        unit: showProgress ? unit : undefined,
        value: showProgress && value !== '' ? Number(value) : undefined,
        total: showProgress && total !== '' ? Number(total) : undefined,
        note,
        visibility: (isPublic ? 'public' : 'private') as MediaVisibility,
        updateStatus,
        targetStatus: updateStatus ? targetStatus : undefined
      };
      const ok = activeId
        ? await mediaLogState.updateEvent(activeId, payload)
        : await mediaLogState.addEvent(payload);
      if (!ok) return;
      open = false;
      onchange?.(formDate);
      onsaved?.(formDate);
    } finally {
      saving = false;
    }
  }

  async function remove() {
    if (!activeId) return;
    if (!confirm('Delete this log entry?')) return;
    const day = formDate;
    await mediaLogState.removeEvent(activeId);
    open = false;
    onchange?.(day);
  }
</script>

<Modal
  open={open}
  title={editing ? 'Edit entry' : 'Log an entry'}
  maxWidth="2xl"
  {saving}
  {dirty}
  onclose={() => (open = false)}
  onsave={save}
  bodyClass="overflow-y-auto p-6"
>
  <div class="space-y-4">
    {#if editing && siblings.length > 1}
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="mr-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[oklch(0.5416_0.0154_285.87)]">That day</span>
        {#each siblings as entry (entry.id)}
          <button
            type="button"
            onclick={() => selectSibling(entry.id)}
            class="rounded border px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors {entry.id === activeId
              ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
              : 'border-[oklch(0.2739_0.0055_286.03)] text-[oklch(0.7107_0.0351_256.79)] hover:bg-white/5'}"
          >
            {formatLogDate(entry.at, true)} · {eventLabel(entry)}
          </button>
        {/each}
      </div>
    {/if}

    <!-- 1. The title (fixed while editing) -->
    <div>
      {#if selected}
        <div class="flex items-center gap-3 rounded border border-[oklch(0.2739_0.0055_286.03)] bg-black/20 p-3">
          <span class="h-16 w-11 shrink-0 overflow-hidden rounded bg-black/40">
            {#if selected.poster_image}
              <img src={posterFor(selected)} alt="" class="h-full w-full object-cover" />
            {/if}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-medium text-white">{selected.title}</span>
            <span class="block text-[11px] uppercase tracking-wider text-[oklch(0.7107_0.0351_256.79)]">
              {selected.type} · {selected.status}
            </span>
          </span>
          {#if !editing}
            <button type="button" onclick={changeSelection} class="btn-secondary text-xs">Change</button>
          {/if}
        </div>
      {:else}
        <label for="log-title" class="mb-2 block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Title</label>
        <input
          id="log-title"
          type="text"
          data-autofocus
          bind:this={searchInput}
          bind:value={query}
          class="input-field"
          placeholder="Search your library..."
          autocomplete="off"
        />
        {#if matches.length > 0}
          <ul class="mt-1 max-h-52 overflow-y-auto rounded border border-[oklch(0.2739_0.0055_286.03)] bg-[oklch(0.1603_0.0059_285.89)]">
            {#each matches as item (item.id)}
              <li>
                <button
                  type="button"
                  onclick={() => selectItem(item)}
                  class="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/5"
                >
                  <span class="h-10 w-7 shrink-0 overflow-hidden rounded bg-black/40">
                    {#if item.poster_image}
                      <img src={posterFor(item)} alt="" class="h-full w-full object-cover" />
                    {/if}
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm text-white">{item.title}</span>
                    <span class="block truncate text-[11px] uppercase tracking-wider text-[oklch(0.7107_0.0351_256.79)]">
                      {item.type} · {item.status}
                    </span>
                  </span>
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      {/if}
    </div>

    <!-- 2. What did you do -->
    <div class="flex flex-wrap gap-2" class:opacity-40={!selected}>
      {#each KINDS as option (option)}
        <button
          type="button"
          disabled={!selected}
          onclick={() => setKind(option)}
          aria-pressed={kind === option}
          class="rounded border px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors disabled:cursor-not-allowed {kind === option
            ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
            : 'border-[oklch(0.2739_0.0055_286.03)] bg-white/[0.02] text-[oklch(0.7107_0.0351_256.79)] hover:bg-white/5'}"
        >
          {LOG_KIND_LABEL[option]}
        </button>
      {/each}
    </div>

    <!-- 3. When -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div class="space-y-1">
        <label for="log-date" class="block text-[11px] font-mono uppercase tracking-[0.12em] text-[oklch(0.60_0.02_256.79)]">Date</label>
        <input id="log-date" type="date" bind:value={formDate} max={today} class="input-field [color-scheme:dark]" />
      </div>
      <div class="space-y-1">
        <label for="log-time" class="block text-[11px] font-mono uppercase tracking-[0.12em] text-[oklch(0.60_0.02_256.79)]">Time</label>
        <input id="log-time" type="time" bind:value={time} class="input-field [color-scheme:dark]" />
      </div>
      <div class="space-y-1">
        <label for="log-round" class="block text-[11px] font-mono uppercase tracking-[0.12em] text-[oklch(0.60_0.02_256.79)]">Round</label>
        <input id="log-round" type="number" min="1" step="1" bind:value={round} class="input-field" />
      </div>
    </div>

    <!-- 4. Optional snapshot -->
    <div class="space-y-3">
      <label class="flex w-fit cursor-pointer select-none items-center gap-2 text-sm text-[oklch(0.7107_0.0351_256.79)]">
        <input type="checkbox" bind:checked={showProgress} class="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500" />
        Add progress
      </label>

      {#if showProgress}
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div class="space-y-1">
            <label for="log-unit" class="block text-[11px] font-mono uppercase tracking-[0.12em] text-[oklch(0.60_0.02_256.79)]">Unit</label>
            <select id="log-unit" value={unitValue} onchange={(e) => onUnitChange(e.currentTarget.value)} class="input-field">
              <option value="">No unit</option>
              {#each Object.entries(PROGRESS_UNIT_LABEL) as [unitKey, unitLabel] (unitKey)}
                <option value={unitKey}>{unitLabel}</option>
              {/each}
            </select>
          </div>
          <div class="space-y-1">
            <label for="log-value" class="block text-[11px] font-mono uppercase tracking-[0.12em] text-[oklch(0.60_0.02_256.79)]">Progress</label>
            <input id="log-value" type="number" step="any" bind:value={value} class="input-field" placeholder={unit === 'hour' ? 'e.g. 12' : 'e.g. 4'} />
          </div>
          <div class="space-y-1">
            <label for="log-total" class="block text-[11px] font-mono uppercase tracking-[0.12em] text-[oklch(0.60_0.02_256.79)]">Total</label>
            <input id="log-total" type="number" step="any" bind:value={total} class="input-field" placeholder="e.g. 8" />
          </div>
        </div>
      {/if}
    </div>

    <!-- 5. Session note -->
    <div class="space-y-1">
      <label for="log-note" class="block text-[11px] font-mono uppercase tracking-[0.12em] text-[oklch(0.60_0.02_256.79)]">Session note</label>
      <textarea id="log-note" bind:value={note} class="input-field min-h-[70px] resize-y" placeholder="Anything worth remembering about this session?"></textarea>
    </div>

    {#if !dateAllowed}
      <p class="text-xs text-red-400">A log cannot be dated in the future.</p>
    {/if}

    <div class="flex flex-wrap items-center gap-5">
      <label class="flex cursor-pointer select-none items-center gap-2 text-sm text-[oklch(0.7107_0.0351_256.79)]" title="Appears on sqrt.fyi after the next publish">
        <input type="checkbox" bind:checked={isPublic} class="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500" />
        Make public
      </label>
      <div class="flex flex-wrap items-center gap-2">
        <label class="flex cursor-pointer select-none items-center gap-2 text-sm text-[oklch(0.7107_0.0351_256.79)]">
          <input type="checkbox" bind:checked={updateStatus} class="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500" />
          Update status
        </label>
        {#if updateStatus}
          {#if kind === 'finish'}
            <div class="inline-flex items-center gap-1 rounded border border-[oklch(0.2739_0.0055_286.03)] bg-black/20 p-0.5 text-xs">
              <button
                type="button"
                onclick={() => (targetStatus = 'finished')}
                class="rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors {targetStatus === 'finished'
                  ? 'border border-blue-500/50 bg-blue-500/15 text-blue-300 font-semibold'
                  : 'text-[oklch(0.7107_0.0351_256.79)] hover:bg-white/5'}"
              >
                Finished
              </button>
              <button
                type="button"
                onclick={() => (targetStatus = 'rewishlist')}
                class="rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors {targetStatus === 'rewishlist'
                  ? 'border border-blue-500/50 bg-blue-500/15 text-blue-300 font-semibold'
                  : 'text-[oklch(0.7107_0.0351_256.79)] hover:bg-white/5'}"
              >
                Rewishlist
              </button>
            </div>
          {:else if targetStatus}
            <span class="rounded border border-[oklch(0.2739_0.0055_286.03)] bg-white/[0.02] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[oklch(0.60_0.02_256.79)]">
              {targetStatus}
            </span>
          {/if}
        {/if}
      </div>
    </div>
  </div>

  {#snippet footer()}
    {#if editing}
      <button type="button" class="mr-auto text-xs text-red-400/80 transition-colors hover:text-red-400" onclick={remove}>
        Delete entry
      </button>
    {/if}
    <button type="button" class="btn-secondary" onclick={() => (open = false)}>Cancel</button>
    <button
      type="button"
      class="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
      onclick={save}
      disabled={!selected || saving || !dateAllowed}
    >
      {saving ? 'Saving...' : editing ? 'Save changes' : 'Log it'}
    </button>
  {/snippet}
</Modal>
