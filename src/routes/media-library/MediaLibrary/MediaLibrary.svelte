<script lang="ts">
  import mediaData from "../../../../static/media/media.json";

  import MediaModal from "./MediaModal.svelte";
  import FilterSort from "../../../../shared/components/FilterSort.svelte";
  import { applyFilters, applySorts } from "../../../../shared/utils/mediaFilters";
  import { fade, scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  
  import MediaCarousel from "./MediaCarousel.svelte";
  import LibraryTable from "./LibraryTable.svelte";
  
  let searchQuery = $state("");
  let filters = $state([]);
  let sorts = $state<{ property: string, direction: 'asc' | 'desc' }[]>([{ property: 'rating', direction: 'desc' }]);

  let filteredBuckets = $derived((() => {
    const filtered = applyFilters(mediaData, filters, searchQuery);
    const sorted = applySorts(filtered, sorts);
    
    const byRatingDesc = [...filtered].sort((a, b) => ((b.rating as number) || 0) - ((a.rating as number) || 0));
    
    const buckets: { 
      consuming: Record<string, unknown>[], 
      goat: Record<string, unknown>[],
      library: Record<string, unknown>[] 
    } = { consuming: [], goat: [], library: [] };

    buckets.goat = byRatingDesc.filter(i => Array.isArray((i as any).tags) && (i as any).tags.includes('goat'));

    for (const item of sorted) {
      if (item.status === "consuming") {
        buckets.consuming.push(item);
      } else {
        buckets.library.push(item);
      }
    }
    return buckets;
  })());

  let activeItem: Record<string, unknown> | null = $state(null);
  let fullPosterUrl: string | null = $state(null);

  function toggleSort(column: string) {
    const existingIndex = sorts.findIndex(s => s.property === column);
    if (existingIndex >= 0) {
      if (sorts[existingIndex].direction === 'desc') {
        sorts[existingIndex].direction = 'asc';
      } else {
        sorts[existingIndex].direction = 'desc';
      }
    } else {
      sorts.push({ property: column, direction: column === 'title' || column === 'status' ? 'asc' : 'desc' });
    }
    sorts = [...sorts];
  }

  function openDetails(item: Record<string, unknown>) {
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
    
    <div class="ml-filters">
      <input type="text" bind:value={searchQuery} placeholder="Search..." class="ml-search-input" />
      <FilterSort bind:filters bind:sorts />
    </div>
  </header>

  <MediaCarousel title="Currently" items={filteredBuckets.consuming} {openDetails} {openFullPoster} />
  
  <MediaCarousel title="Greatest of All Time" items={filteredBuckets.goat} {openDetails} {openFullPoster} />

  <LibraryTable items={filteredBuckets.library} {sorts} {toggleSort} {openDetails} {openFullPoster} />

  {#if mediaData.length === 0}
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
  position: fixed;
  inset: 0;
  z-index: 5;
  overflow-y: auto;
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

@media (max-width: 640px) {
  .ml-root {
    padding: 28px 18px 80px;
  }
}
</style>
