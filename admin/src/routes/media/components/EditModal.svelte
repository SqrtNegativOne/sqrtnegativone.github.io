<script lang="ts">
  import mediaProperties from '../../../../../site/static/media/media-properties.json';
  import { assetState } from '$lib/assetState.svelte';
  import CollapsibleSection from '$lib/CollapsibleSection.svelte';
  import { getPosterUrl } from '../../../../../shared/utils/getPosterUrl';
  import { eventLabel, formatLogDate } from '../../../../../shared/lib/mediaLog';
  import type { MediaItem, MediaLogEvent } from '../../../../../shared/types';
  import Modal from '$lib/Modal.svelte';
  import TagInput from '$lib/TagInput.svelte';
  import { mediaLogState } from '../mediaLogState.svelte';

  let {
    isModalOpen = $bindable(),
    isEditing,
    currentItem = $bindable(),
    existingItems = [],
    history = [],
    isSearching,
    isSaving,
    dirty = false,
    isSearchModalOpen = false,
    searchError,
    handleSearch,
    handlePaste,
    handleSave,
    handleDelete,
    onOpenExisting,
    onOpenPoster,
    onOpenLog
  } = $props();

  let logHistory = $derived((history ?? []) as MediaLogEvent[]);

  // Collapsible blocks re-derive their open state whenever the modal reopens
  // or a different item is loaded into it.
  let sectionKey = $derived(`${isModalOpen ? 'open' : 'closed'}:${currentItem.id ?? ''}`);

  // Status is free to set by hand: the log is incomplete by nature (something
  // may have been finished years before logging existed), so it never gates
  // what this editor allows. The log only *nudges* a status when you log an
  // event; see `nudgeStatus()` in mediaLogState.
  const availableStatuses = mediaProperties.statuses as { value: string; label: string }[];

  let titleInput: HTMLInputElement | undefined = $state();
  let titleFocused = $state(false);

  let allTags = $derived(
    Array.from(new Set((existingItems as MediaItem[]).flatMap((i) => i.tags || []))).sort()
  );

  $effect(() => {
    if (isModalOpen && currentItem.id !== undefined) {
      titleInput?.focus();
    }
  });

  function normalize(value: string | undefined): string {
    return (value || '').toLowerCase().trim();
  }

  function fuzzyScore(title: string, query: string): number {
    const t = normalize(title);
    const q = normalize(query);
    if (!t || !q) return 0;
    if (t === q) return 1000;
    const idx = t.indexOf(q);
    if (idx === 0) return 900;
    if (idx > 0) return 700 - idx;

    let cursor = 0;
    let streak = 0;
    let bestStreak = 0;
    let matched = 0;
    for (const ch of q.replace(/\s+/g, '')) {
      const found = t.indexOf(ch, cursor);
      if (found === -1) return 0;
      streak = found === cursor ? streak + 1 : 1;
      bestStreak = Math.max(bestStreak, streak);
      cursor = found + 1;
      matched++;
    }
    return matched === 0 ? 0 : 300 + bestStreak;
  }

  let suggestions = $derived.by(() => {
    const q = currentItem.title?.trim() ?? '';
    if (q.length < 2) return [] as MediaItem[];
    const selfId = currentItem.id;
    return (existingItems as MediaItem[])
      .map((item) => ({ item, score: fuzzyScore(item.title, q) }))
      .filter(({ item, score }) => score > 0 && item.id !== selfId)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ item }) => item);
  });

  let posterPreviewSrc = $derived.by(() => {
    const p = currentItem.poster_image;
    if (!p) return '';
    if (p.startsWith('data:') || p.startsWith('http') || p.startsWith('/')) return assetState.resolve(p);
    return assetState.resolve(getPosterUrl(p));
  });

  /** The calendar is read-only, so entry management lives in this history list. */
  async function toggleEntryVisibility(event: MediaLogEvent) {
    const next = event.visibility === 'public' ? 'private' : 'public';
    await mediaLogState.setVisibility(event.id, next);
  }

  async function removeEntry(event: MediaLogEvent) {
    if (!confirm('Delete this log entry?')) return;
    await mediaLogState.removeEvent(event.id);
  }
</script>

<Modal
  open={isModalOpen}
  title={isEditing ? 'Edit Media' : 'New Media'}
  maxWidth="6xl"
  saving={isSaving}
  dirty={dirty}
  onclose={() => isModalOpen = false}
  bodyClass="overflow-y-auto p-6"
>
  <form id="save-media-form" onsubmit={handleSave}>
          <div class="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
            <!-- Main column -->
            <div class="min-w-0 space-y-7">
              <!-- Details: the fields you always need at hand -->
              <CollapsibleSection title="Details" collapsible={false}>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="space-y-2">
                    <select id="media-type" name="type" bind:value={currentItem.type} class="input-field" aria-label="Type">
                      {#each mediaProperties.types as type (type)}
                        <option value={type.value}>{type.label}</option>
                      {/each}
                    </select>
                  </div>

                  <div class="space-y-2">
                    <select id="media-status" name="status" bind:value={currentItem.status} class="input-field" aria-label="Status">
                      {#each availableStatuses as status (status.value)}
                        <option value={status.value}>{status.label}</option>
                      {/each}
                    </select>
                  </div>

                  <div class="space-y-2 sm:col-span-2">
                    <label for="media-title" class="flex justify-between items-end gap-3 text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">
                      <span>Title</span>
                      <button type="button" onclick={handleSearch} disabled={isSearching || !currentItem.title} class="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 cursor-pointer">
                        {isSearching ? 'Searching...' : 'Search Metadata'}
                      </button>
                    </label>
                    <div class="relative">
                      <input
                        id="media-title"
                        type="text"
                        name="title"
                        bind:this={titleInput}
                        bind:value={currentItem.title}
                        onkeydown={(e) => { if (e.key === 'Enter' && !isEditing && currentItem.title) { e.preventDefault(); handleSearch(); } }}
                        onfocus={() => titleFocused = true}
                        onblur={() => setTimeout(() => titleFocused = false, 150)}
                        class="input-field"
                        autocomplete="off"
                        required
                      />
                      {#if titleFocused && suggestions.length > 0}
                        <div class="absolute left-0 right-0 top-full mt-1 z-30 rounded border border-[oklch(0.2739_0.0055_286.03)] bg-[oklch(0.1603_0.0059_285.89)] shadow-2xl shadow-black/60 overflow-hidden">
                          <div class="px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-amber-400/90 bg-amber-500/5 border-b border-[oklch(0.2739_0.0055_286.03)]">
                            Already in your library — open instead?
                          </div>
                          <div class="max-h-60 overflow-y-auto">
                            {#each suggestions as s (s.id)}
                              <button
                                type="button"
                                onclick={() => onOpenExisting?.(s)}
                                class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                <div class="w-8 h-11 shrink-0 rounded overflow-hidden bg-black/40 flex items-center justify-center">
                                  {#if s.poster_image}
                                    <img src={assetState.resolve(getPosterUrl(s.poster_image))} alt="" class="w-full h-full object-cover" />
                                  {:else}
                                    <span class="text-[9px] uppercase text-[oklch(0.60_0.02_256.79)]">{s.type}</span>
                                  {/if}
                                </div>
                                <div class="min-w-0 flex-1">
                                  <div class="text-sm text-white truncate">{s.title}</div>
                                  <div class="text-[11px] text-[oklch(0.7107_0.0351_256.79)] truncate capitalize">
                                    {s.type} · {s.status}{s.author ? ' · ' + s.author : ''}
                                  </div>
                                </div>
                                <span class="text-[10px] font-mono uppercase tracking-wider text-blue-400 shrink-0">Open</span>
                              </button>
                            {/each}
                          </div>
                        </div>
                      {/if}
                    </div>
                    {#if searchError}
                      <div class="text-xs text-red-400 mt-1">{searchError}</div>
                    {/if}
                  </div>

                  <div class="space-y-2">
                    <label for="media-author" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Author</label>
                    <input id="media-author" type="text" name="author" bind:value={currentItem.author} class="input-field" placeholder="e.g. Stephen King, Christopher Nolan, Valve" />
                  </div>

                  <div class="space-y-2">
                    <label for="media-publisher" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Publisher</label>
                    <input id="media-publisher" type="text" name="publisher" bind:value={currentItem.publisher} class="input-field" placeholder="e.g. Penguin Random House, Warner Bros" />
                  </div>

                  <div class="space-y-2 sm:col-span-2">
                    <label for="media-tagline" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Tagline <span class="text-[oklch(0.60_0.02_256.79)] font-normal">(optional)</span></label>
                    <input id="media-tagline" type="text" name="tagline" bind:value={currentItem.tagline} class="input-field" placeholder="e.g. The subtitle or tagline" />
                  </div>

                  <div class="space-y-2 sm:col-span-2">
                    <label for="media-tags" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Tags</label>
                    <TagInput bind:tags={currentItem.tags} suggestions={allTags} placeholder="e.g. meta/goat, favorites" />
                  </div>

                  <!-- An empty rating is the whole expression of uncertainty: leave it blank. -->
                  <div class="space-y-2">
                    <label for="media-rating" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Rating (0-6)</label>
                    <input id="media-rating" type="number" min="0" max="6" step="any" inputmode="decimal" name="rating" bind:value={currentItem.rating} class="input-field" placeholder="Leave empty if unsure" />
                  </div>

                  <div class="space-y-2">
                    <span class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Visibility</span>
                    <label for="media-hidden" class="flex items-center gap-3 cursor-pointer select-none">
                      <input type="checkbox" id="media-hidden" bind:checked={currentItem.hidden} class="rounded border-zinc-700 text-blue-600 focus:ring-blue-500 bg-zinc-800" />
                      <span class="text-sm text-[oklch(0.7107_0.0351_256.79)]">Hidden from public library</span>
                    </label>
                  </div>
                </div>
              </CollapsibleSection>

              <!-- Synopsis & Notes -->
              <CollapsibleSection title="Description" content={currentItem.description} resetKey={sectionKey}>
                <textarea
                  id="media-desc"
                  name="description"
                  aria-label="Description"
                  bind:value={currentItem.description}
                  class="input-field min-h-[110px] resize-y"
                  placeholder="Synopsis or overview..."
                ></textarea>
              </CollapsibleSection>

              <CollapsibleSection title="Personal Notes" content={currentItem.notes} resetKey={sectionKey}>
                <textarea
                  id="media-notes"
                  name="notes"
                  aria-label="Personal Notes"
                  bind:value={currentItem.notes}
                  class="input-field min-h-[90px] resize-y"
                  placeholder="Your personal notes..."
                ></textarea>
              </CollapsibleSection>

              <!-- Private -->
              <CollapsibleSection title="Private (local only)" tone="private" content={currentItem.private_notes} resetKey={sectionKey}>
                <textarea
                  id="media-private"
                  name="private_notes"
                  aria-label="Private notes"
                  bind:value={currentItem.private_notes}
                  class="input-field min-h-[90px] resize-y"
                  placeholder="Stored in admin/data/media-private.json — never committed or served."
                ></textarea>
              </CollapsibleSection>

              <!-- History (derived from the media log) -->
              <CollapsibleSection title="History" collapsible={false}>
                {#snippet actions()}
                  <button
                    type="button"
                    onclick={() => onOpenLog?.(currentItem.id)}
                    class="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    Log an entry →
                  </button>
                {/snippet}

                {#if currentItem.added_at}
                  <p class="font-mono text-[10px] uppercase tracking-[0.12em] text-[oklch(0.5416_0.0154_285.87)]">
                    Added <span class="text-[oklch(0.7107_0.0351_256.79)]">{formatLogDate(currentItem.added_at)}</span>
                  </p>
                {/if}

                {#if logHistory.length === 0}
                  <p class="text-sm text-[oklch(0.60_0.02_256.79)]">Nothing logged yet.</p>
                {:else}
                  <ul class="space-y-2">
                    {#each logHistory as event (event.id)}
                      <li class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span class="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[oklch(0.60_0.02_256.79)]">
                          {formatLogDate(event.at)}
                        </span>
                        <span class="min-w-0 flex-1 text-[oklch(0.8622_0.0068_286.26)]">
                          {eventLabel(event)}
                        </span>
                        <button
                          type="button"
                          onclick={() => toggleEntryVisibility(event)}
                          class="rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors {event.visibility === 'public'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                            : 'border-[oklch(0.2739_0.0055_286.03)] text-[oklch(0.7107_0.0351_256.79)] hover:bg-white/5'}"
                          title={event.visibility === 'public' ? 'Visible on the site; click to make private' : 'Private; click to publish to the site'}
                        >
                          {event.visibility === 'public' ? 'Public' : 'Private'}
                        </button>
                        <button
                          type="button"
                          onclick={() => removeEntry(event)}
                          class="text-[10px] font-mono uppercase tracking-wider text-red-400/70 transition-colors hover:text-red-400"
                          aria-label="Delete log entry"
                        >
                          Delete
                        </button>
                      </li>
                    {/each}
                  </ul>
                {/if}
              </CollapsibleSection>
            </div>

            <!-- Poster column -->
            <aside class="min-w-0 space-y-3 self-start lg:sticky lg:top-6">
              {#if posterPreviewSrc}
                <button
                  type="button"
                  onclick={() => onOpenPoster?.(posterPreviewSrc)}
                  class="group relative block w-full aspect-2/3 rounded overflow-hidden bg-black/40 border border-[oklch(0.2739_0.0055_286.03)] cursor-zoom-in"
                  aria-label="Open full poster"
                >
                  <img src={posterPreviewSrc} alt="Poster preview" class="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300" />
                </button>
              {:else}
                <div class="w-full aspect-2/3 rounded bg-black/40 border border-[oklch(0.2739_0.0055_286.03)] flex items-center justify-center text-xs text-[oklch(0.60_0.02_256.79)]">
                  No poster
                </div>
              {/if}
              <div class="space-y-2">
                <input id="media-poster" type="text" name="poster_image" bind:value={currentItem.poster_image} onpaste={handlePaste} placeholder="URL or paste image..." class="input-field text-xs" aria-label="Poster Image Input"/>
              </div>
            </aside>
          </div>
  </form>

  {#snippet footer()}
    <div class="mr-auto">
      {#if isEditing}
        <button type="button" class="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-all cursor-pointer" onclick={() => handleDelete(currentItem.id)}>
          Delete
        </button>
      {/if}
    </div>
    <button type="button" onclick={() => isModalOpen = false} class="btn-secondary">Cancel</button>
    <button type="submit" form="save-media-form" class="btn-primary flex items-center justify-center gap-2 cursor-pointer" disabled={isSaving}>
      {#if isSaving}
        <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Saving...
      {:else}
        {isEditing ? 'Save Changes' : 'Add Media'}
      {/if}
    </button>
  {/snippet}
</Modal>
