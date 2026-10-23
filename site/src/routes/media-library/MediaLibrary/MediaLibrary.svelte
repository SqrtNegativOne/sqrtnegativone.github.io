<script lang="ts">
  import mediaData from "../../../../static/media/media.json";
  import mediaProperties from "../../../../static/media/media-properties.json";

  import MediaModal from "./MediaModal.svelte";
  import FilterSort from "$shared/components/FilterSort.svelte";
  import MediaInfo from "$shared/components/MediaInfo.svelte";
  import MediaGallery from "$shared/components/MediaGallery.svelte";
  import MediaGalleryCard from "$shared/components/MediaGalleryCard.svelte";
  import MediaTable from "$shared/components/MediaTable.svelte";
  import MediaViewToggle from "$shared/components/MediaViewToggle.svelte";
  import { applyFilters, applySorts } from "./mediaFilters";
  import { groupMediaByType, toggleSort, type MediaViewMode } from "$shared/lib/mediaLibrary";
  import { fade, scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  
  import type { MediaItem } from "$shared/types";
  
  const typedMediaData = mediaData as unknown as MediaItem[];
  const visibleMediaData = typedMediaData.filter((item) => !item.hidden);

  // Only non-meta tags shown in the filter dropdown.
  const allTags = $derived(
    Array.from(new Set(visibleMediaData.flatMap((item) => item.tags || []))).filter((t) => !t.startsWith('meta')).sort()
  );

  const filterProperties = $derived([
    { value: 'type', label: 'Type', type: 'select' as const, options: mediaProperties.types },
    { value: 'status', label: 'Status', type: 'select' as const, options: mediaProperties.statuses },
    { value: 'tags', label: 'Tag', type: 'select' as const, options: allTags.map((t) => ({ value: t, label: t })) },
    { value: 'rating', label: 'Rating', type: 'number' as const },
    { value: 'title', label: 'Title', type: 'text' as const }
  ]);

  let searchQuery = $state("");
  // Public site: show the consumed library (finished/dropped/shelved/consuming)
  // plus rewishlist, which belongs to both the consumed and to-consume groups.
  const DEFAULT_STATUS_FILTER = ['finished', 'dropped', 'shelved', 'rewishlist', 'consuming'];
  let filters = $state<{ property: string, operator: string, value: string | number | boolean | string[] }[]>([
    { property: 'status', operator: 'is', value: [...DEFAULT_STATUS_FILTER] }
  ]);
  let sorts = $state<{ property: string, direction: 'asc' | 'desc' }[]>([{ property: 'rating', direction: 'desc' }]);

  let carouselsData = $derived((() => {
    const byRatingDesc = [...visibleMediaData].sort((a, b) => ((b.rating ?? -1) as number) - ((a.rating ?? -1) as number));
    const goat = byRatingDesc.filter(i => Array.isArray(i.tags) && i.tags.includes('meta/goat'));
    const consuming = byRatingDesc.filter(i => i.status === "consuming");
    // Recent reviews: items with non-empty notes, ordered by added_at desc then array order desc
    const withNotes = visibleMediaData.filter(i => i.notes && (i.notes as string).trim());
    const recentReviews = [...withNotes].sort((a, b) => {
      if (a.added_at && b.added_at) return (b.added_at as string).localeCompare(a.added_at as string);
      if (a.added_at) return -1;
      if (b.added_at) return 1;
      return withNotes.indexOf(b) - withNotes.indexOf(a);
    }).slice(0, 8);
    return { goat, consuming, recentReviews };
  })());

  let libraryData = $derived((() => {
    const filtered = applyFilters(visibleMediaData, filters, searchQuery);
    const sorted = applySorts(filtered, sorts);
    return sorted.filter(item => item.status !== "consuming");
  })());

  const libraryGroups = $derived(groupMediaByType(libraryData));

  let activeItem: MediaItem | null = $state(null);
  let fullPosterUrl: string | null = $state(null);

  let viewMode = $state<MediaViewMode>('gallery');

  function handleToggleSort(column: string) {
    sorts = toggleSort(sorts, column);
  }

  function openDetails(item: MediaItem) {
    activeItem = item;
    document.body.style.overflow = 'hidden';
  }

  function closeDetails() {
    activeItem = null;
    if (!fullPosterUrl) {
      document.body.style.overflow = '';
    }
  }

  function openFullPoster(url: string | undefined | null) {
    if (url) {
      fullPosterUrl = url;
      document.body.style.overflow = 'hidden';
    }
  }

  function closeFullPoster() {
    fullPosterUrl = null;
    if (!activeItem) {
      document.body.style.overflow = '';
    }
  }
</script>

<div class="ml-root">
  <header class="ml-header">
    <div class="ml-header-text">
      <h1 class="ml-title">Media Library</h1>
      <p class="ml-tagline">Things I'm watching, reading, playing.</p>
    </div>
  </header>

  {#if carouselsData.consuming.length > 0}
    <section class="ml-section">
      <h2 class="ml-section-title">Currently</h2>
      <div class="ml-carousel-grid">
        {#each carouselsData.consuming as item (item.type + '-' + item.id)}
          <MediaGalleryCard {item} {openDetails} />
        {/each}
      </div>
    </section>
  {/if}

  <div class="ml-dual-row">
    {#if carouselsData.goat.length > 0}
      <section class="ml-section ml-section--grow">
        <h2 class="ml-section-title">Greatest of All Time</h2>
        <div class="ml-carousel-grid">
          {#each carouselsData.goat as item (item.type + '-' + item.id)}
            <MediaGalleryCard {item} {openDetails} />
          {/each}
        </div>
      </section>
    {/if}

    {#if carouselsData.recentReviews.length > 0}
      <section class="ml-section ml-section--reviews">
        <h2 class="ml-section-title">Recent Reviews</h2>
        <div class="ml-reviews-list">
          {#each carouselsData.recentReviews as item (item.type + '-' + item.id)}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="ml-review-row" onclick={() => openDetails(item)}>
              <div class="ml-review-poster">
                {#if item.poster_image}
                  <img src={`/media/media-posters/${item.poster_image}.avif`} alt="" loading="lazy" />
                {:else}
                  <div class="ml-review-poster-fallback"></div>
                {/if}
              </div>
              <div class="ml-review-body">
                <span class="ml-review-title">{item.title}</span>
                <p class="ml-review-note">{item.notes}</p>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}
  </div>

  <div class="ml-filters-container">
    <div class="ml-filters">
      <input type="text" bind:value={searchQuery} placeholder="Search..." class="ml-search-input" />
      <FilterSort bind:filters bind:sorts properties={filterProperties} />
      <MediaInfo />
      <MediaViewToggle bind:viewMode storageKey="ml-view-mode" />
    </div>
  </div>

  {#if viewMode === 'gallery'}
    <MediaGallery groups={libraryGroups} {openDetails} title="Library" />
  {:else}
    <MediaTable
      groups={libraryGroups}
      {sorts}
      toggleSort={handleToggleSort}
      {openDetails}
      {openFullPoster}
      title="Library"
    />
  {/if}

  {#if visibleMediaData.length === 0}
    <p class="ml-empty">Nothing here yet.</p>
  {/if}

  {#if activeItem}
    <MediaModal item={activeItem} {closeDetails} {openFullPoster} />
  {/if}

  {#if fullPosterUrl}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="ml-full-poster-backdrop" onclick={closeFullPoster} transition:fade={{ duration: 150 }}>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <img src={fullPosterUrl} alt="Full view" class="ml-full-poster-img" onclick={(e) => e.stopPropagation()} transition:scale={{ start: 0.95, duration: 150, easing: cubicOut }} />
      <button class="fixed top-4 right-4 sm:hidden text-[oklch(0.6363_0.0133_286.02)] hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-colors" onclick={closeFullPoster} aria-label="Close poster">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  {/if}
</div>

<style>
.ml-full-poster-backdrop {
  position: fixed;
  inset: 0;
  background: oklch(0 0 0 / 0.95);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.ml-full-poster-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 24px 48px oklch(0 0 0 / 0.6);
}

.ml-root {
  min-height: 100vh;
  background: oklch(0.1505 0.0042 285.88);
  color: oklch(0.9707 0.0027 286.35);
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  padding: clamp(24px, 5vw, 64px) clamp(20px, 5vw, 72px) 96px;
  -webkit-font-smoothing: antialiased;
}

.ml-header {
  margin-bottom: 40px;
}

.ml-header-text {
  padding-right: 60px;
}

/* Carousel / feature sections */
.ml-section {
  margin-top: 48px;
}

.ml-section-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: oklch(0.785 0.0112 286.14);
  margin: 0 0 16px;
}

.ml-section--grow {
  flex: 1 1 0;
  min-width: 0;
}

.ml-section--reviews {
  width: 360px;
  flex-shrink: 0;
}

/* Side-by-side: GOAT carousel + Recent Reviews */
.ml-dual-row {
  display: flex;
  gap: 48px;
  align-items: flex-start;
  margin-top: 48px;
}

/* Grid of gallery-style cards (same component as the main library) */
.ml-carousel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

/* Recent Reviews list */
.ml-reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  border-top: 1px solid oklch(1 0 0 / 0.08);
}

.ml-review-row {
  display: flex;
  gap: 12px;
  padding: 12px 4px;
  border-bottom: 1px solid oklch(1 0 0 / 0.06);
  cursor: pointer;
  transition: background-color 120ms ease;
  border-radius: 4px;
}

.ml-review-row:hover {
  background: oklch(1 0 0 / 0.03);
}

.ml-review-poster {
  flex-shrink: 0;
  width: 36px;
  height: 54px;
  border-radius: 3px;
  overflow: hidden;
  background: oklch(0.2329 0.0095 285.64);
}

.ml-review-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ml-review-poster-fallback {
  width: 100%;
  height: 100%;
  background: oklch(0.2329 0.0095 285.64);
}

.ml-review-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ml-review-title {
  font-size: 13px;
  font-weight: 600;
  color: oklch(0.9707 0.0027 286.35);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ml-review-note {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: oklch(0.6363 0.0133 286.02);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ml-title {
  font-family: "Instrument Serif", "Iowan Old Style", Georgia, serif;
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 400;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1;
}

.ml-tagline {
  margin: 12px 0 0;
  color: oklch(0.6363 0.0133 286.02);
  font-size: 14px;
  letter-spacing: 0.02em;
}

.ml-filters {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  flex-wrap: wrap;
}

.ml-search-input {
  background: oklch(1 0 0 / 0.05);
  border: 1px solid oklch(1 0 0 / 0.1);
  color: oklch(0.9707 0.0027 286.35);
  padding: 10px 16px;
  border-radius: 8px;
  font-family: "Inter", system-ui, sans-serif;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.ml-search-input:focus {
  border-color: oklch(1 0 0 / 0.3);
  background: oklch(1 0 0 / 0.08);
}

.ml-search-input {
  flex: 1;
  min-width: 200px;
}

.ml-empty {
  color: oklch(0.5416 0.0154 285.87);
  text-align: center;
  padding: 80px 0;
  font-style: italic;
}

@media (max-width: 900px) {
  .ml-dual-row {
    flex-direction: column;
    gap: 0;
  }

  .ml-section--reviews {
    width: 100%;
    margin-top: 48px;
  }
}

@media (max-width: 640px) {
  .ml-root {
    padding: 28px 18px 80px;
  }

  .ml-carousel-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
  }
}
</style>
