<script lang="ts">
  import mediaProperties from '../../../../../static/media/media-properties.json';
  import { untrack } from 'svelte';
  import { assetState } from '$lib/assetState.svelte';
  import { getPosterUrl } from '../../../../../shared/utils/getPosterUrl';
  import type { MediaItem } from '../../../../../shared/types';

  let {
    isModalOpen = $bindable(),
    isEditing,
    currentItem = $bindable(),
    existingItems = [],
    isSearching,
    isSaving,
    searchError,
    handleSearch,
    handlePaste,
    handleSave,
    handleDelete,
    onOpenExisting,
    onOpenPoster
  } = $props();

  let tagsInput = $state('');
  let titleInput: HTMLInputElement | undefined = $state();
  let titleFocused = $state(false);

  $effect(() => {
    const id = currentItem.id;
    if (isModalOpen && id !== undefined) {
      tagsInput = untrack(() => currentItem.tags?.join(', ') || '');
      titleInput?.focus();
    }
  });

  function handleTagsInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    tagsInput = val;
    currentItem.tags = val.split(',').map((s) => s.trim()).filter(Boolean);
  }

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
</script>

{#if isModalOpen}
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" data-modal="true" tabindex="-1">
    <div class="bg-[oklch(0.2103_0.0059_285.89)] border border-[oklch(0.2739_0.0055_286.03)] rounded shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
      <div class="p-5 border-b border-[oklch(0.2739_0.0055_286.03)] bg-[oklch(0.1603_0.0059_285.89)] flex justify-between items-center shrink-0">
        <div>
          <h2 class="text-xl font-semibold text-white">{isEditing ? 'Edit Media' : 'Add New Media'}</h2>
          <p class="text-xs text-[oklch(0.7107_0.0351_256.79)] mt-0.5">Track a book, movie, show, or game in your library.</p>
        </div>
        <button aria-label="Close modal" onclick={() => isModalOpen = false} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white cursor-pointer">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto">
        <form id="save-media-form" onsubmit={handleSave} class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-6">
            <!-- Main column -->
            <div class="space-y-6 min-w-0">
              <!-- Identity -->
              <section class="space-y-4">
                <h3 class="text-[11px] font-mono uppercase tracking-[0.18em] text-[oklch(0.7107_0.0351_256.79)] border-b border-[oklch(0.2739_0.0055_286.03)] pb-2">Identity</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label for="media-type" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Type</label>
                    <select id="media-type" name="type" bind:value={currentItem.type} class="input-field">
                      {#each mediaProperties.types as type (type)}
                        <option value={type.value}>{type.label}</option>
                      {/each}
                    </select>
                  </div>

                  <div class="space-y-2">
                    <label for="media-status" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Status</label>
                    <select id="media-status" name="status" bind:value={currentItem.status} class="input-field">
                      {#each mediaProperties.statuses as status (status)}
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
                    <label for="media-tags" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Tags <span class="text-[oklch(0.60_0.02_256.79)] font-normal">(comma separated)</span></label>
                    <input id="media-tags" type="text" name="tags" value={tagsInput} oninput={handleTagsInput} class="input-field" placeholder="e.g. goat, favorites" />
                  </div>
                </div>
              </section>

              <!-- Progress & Rating -->
              <section class="space-y-4">
                <h3 class="text-[11px] font-mono uppercase tracking-[0.18em] text-[oklch(0.7107_0.0351_256.79)] border-b border-[oklch(0.2739_0.0055_286.03)] pb-2">Progress &amp; Rating</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label for="media-rating" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Rating (1-7)</label>
                    <input id="media-rating" type="number" min="1" max="7" step="any" inputmode="decimal" name="rating" bind:value={currentItem.rating} class="input-field" required />
                  </div>

                  <div class="space-y-2">
                    <label for="media-current" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Progress / Total</label>
                    <div class="flex space-x-2">
                      <input id="media-current" type="number" name="current" bind:value={currentItem.current} class="input-field w-1/2" placeholder="Current" />
                      <input id="media-total" type="number" name="total" bind:value={currentItem.total} class="input-field w-1/2" placeholder="Total" />
                    </div>
                  </div>

                  <label for="media-completed" class="flex items-center gap-3 cursor-pointer select-none">
                    <input type="checkbox" id="media-completed" bind:checked={currentItem.completed} class="rounded border-zinc-700 text-blue-600 focus:ring-blue-500 bg-zinc-800" />
                    <span class="text-sm text-[oklch(0.7107_0.0351_256.79)]">Completed</span>
                  </label>

                  <label for="media-hidden" class="flex items-center gap-3 cursor-pointer select-none">
                    <input type="checkbox" id="media-hidden" bind:checked={currentItem.hidden} class="rounded border-zinc-700 text-blue-600 focus:ring-blue-500 bg-zinc-800" />
                    <span class="text-sm text-[oklch(0.7107_0.0351_256.79)]">Hidden from public library</span>
                  </label>
                </div>
              </section>

              <!-- Synopsis & Notes -->
              <section class="space-y-4">
                <h3 class="text-[11px] font-mono uppercase tracking-[0.18em] text-[oklch(0.7107_0.0351_256.79)] border-b border-[oklch(0.2739_0.0055_286.03)] pb-2">Synopsis &amp; Notes</h3>
                <div class="space-y-2">
                  <label for="media-desc" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Description</label>
                  <textarea id="media-desc" name="description" bind:value={currentItem.description} class="input-field min-h-[110px] resize-y" placeholder="Synopsis or overview..."></textarea>
                </div>
                <div class="space-y-2">
                  <label for="media-notes" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Notes</label>
                  <textarea id="media-notes" name="notes" bind:value={currentItem.notes} class="input-field min-h-[90px] resize-y" placeholder="Your personal notes..."></textarea>
                </div>
              </section>

              <!-- Private -->
              <section class="space-y-2 rounded border border-amber-500/20 bg-amber-500/[0.03] p-4">
                <label for="media-private" class="flex justify-between items-end gap-3 text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">
                  <span>Private Notes</span>
                  <span class="text-xs text-amber-500/80 font-mono">🔒 Encrypted / Local only</span>
                </label>
                <textarea id="media-private" name="private_notes" bind:value={currentItem.private_notes} class="input-field min-h-[90px] resize-y border-amber-500/30 focus:border-amber-500 focus:ring-amber-500/20" placeholder="These notes are encrypted securely and never exposed publicly..."></textarea>
              </section>
            </div>

            <!-- Poster column -->
            <aside class="space-y-3">
              <h3 class="text-[11px] font-mono uppercase tracking-[0.18em] text-[oklch(0.7107_0.0351_256.79)] border-b border-[oklch(0.2739_0.0055_286.03)] pb-2">Poster</h3>
              {#if posterPreviewSrc}
                <button
                  type="button"
                  onclick={() => onOpenPoster?.(posterPreviewSrc)}
                  class="group relative block w-full aspect-[2/3] rounded overflow-hidden bg-black/40 border border-[oklch(0.2739_0.0055_286.03)] cursor-zoom-in"
                  aria-label="Open full poster"
                >
                  <img src={posterPreviewSrc} alt="Poster preview" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </button>
              {:else}
                <div class="w-full aspect-[2/3] rounded bg-black/40 border border-[oklch(0.2739_0.0055_286.03)] flex items-center justify-center text-xs text-[oklch(0.60_0.02_256.79)]">
                  No poster
                </div>
              {/if}
              <div class="space-y-2">
                <label for="media-poster" class="block text-xs font-medium text-[oklch(0.7107_0.0351_256.79)]">Poster Image URL</label>
                <input id="media-poster" type="text" name="poster_image" bind:value={currentItem.poster_image} onpaste={handlePaste} placeholder="URL or paste image..." class="input-field text-xs" />
              </div>
              <p class="text-[11px] text-[oklch(0.60_0.02_256.79)] leading-relaxed">Paste an image directly, or use <span class="text-blue-400">Search Metadata</span> to fetch one automatically.</p>
            </aside>
          </div>
        </form>
      </div>

      <div class="p-5 flex justify-between items-center border-t border-[oklch(0.2739_0.0055_286.03)] bg-[oklch(0.1603_0.0059_285.89)] shrink-0">
        <div>
          {#if isEditing}
            <button type="button" class="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-all cursor-pointer" onclick={() => handleDelete(currentItem.id)}>
              Delete
            </button>
          {/if}
        </div>
        <div class="flex space-x-4">
          <button type="button" onclick={() => isModalOpen = false} class="btn-secondary">Cancel</button>
          <button type="submit" form="save-media-form" class="btn-primary flex items-center justify-center gap-2 cursor-pointer" disabled={isSaving}>
            {#if isSaving}
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            {:else}
              Save Media
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
