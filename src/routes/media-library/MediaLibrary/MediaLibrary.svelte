<script lang="ts">
  import mediaData from "../../../data/media.json";
  import mediaProperties from "../../../../static/media-properties.json";
  import HeroCard from "./HeroCard.svelte";
  import LibraryRow from "./LibraryRow.svelte";
  import MediaModal from "./MediaModal.svelte";
  import { tick } from "svelte";
  import FilterSort from "../../../../shared/components/FilterSort.svelte";
  import { applyFilters, applySorts } from "../../../../shared/utils/mediaFilters";
  
  let searchQuery = $state("");
  let filters = $state([]);
  let sorts = $state([{ property: 'rating', direction: 'desc' }]);

  let filteredBuckets = $derived((() => {
    const filtered = applyFilters(mediaData, filters, searchQuery);
    const sorted = applySorts(filtered, sorts);
    
    const buckets: { consuming: any[], library: any[] } = { consuming: [], library: [] };
    for (const item of sorted) {
      if (item.status === "consuming") {
        buckets.consuming.push(item);
      } else {
        buckets.library.push(item);
      }
    }
    return buckets;
  })());

  let activeItem: any = $state(null);
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

  function openDetails(item: any) {
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        activeItem = item;
        document.body.style.overflow = 'hidden';
        await tick();
      });
    } else {
      activeItem = item;
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDetails() {
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        activeItem = null;
        if (!fullPosterUrl) {
          document.body.style.overflow = '';
        }
        await tick();
      });
    } else {
      activeItem = null;
      if (!fullPosterUrl) {
        document.body.style.overflow = '';
      }
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
    <h1 class="ml-title">Media Library</h1>
    <p class="ml-tagline">Things I'm watching, reading, playing.</p>
    
    <div class="ml-filters">
      <input type="text" bind:value={searchQuery} placeholder="Search..." class="ml-search-input" />
      <FilterSort bind:filters bind:sorts />
    </div>
  </header>

  {#if filteredBuckets.consuming.length > 0}
    <section class="ml-section ml-section--hero">
      <h2 class="ml-section-title">Currently</h2>
      <div class="ml-hero-row">
        {#each filteredBuckets.consuming as item (item.type + '-' + item.id)}
          <HeroCard {item} {activeItem} {openDetails} {openFullPoster} />
        {/each}
      </div>
    </section>
  {/if}

  {#if filteredBuckets.library.length > 0}
    <section class="ml-section">
      <h2 class="ml-section-title">Library</h2>
      <div class="ml-table" role="table">
        <div class="ml-table-head" role="row">
          <span role="columnheader" class="ml-col-poster"></span>
          <button role="columnheader" class="ml-col-title ml-sortable" onclick={() => toggleSort('title')}>
            Title {#if sorts.find(s => s.property === 'title')}{sorts.find(s => s.property === 'title')?.direction === 'asc' ? '▲' : '▼'}{/if}
          </button>
          <button role="columnheader" class="ml-col-status ml-sortable" onclick={() => toggleSort('status')}>
            Status {#if sorts.find(s => s.property === 'status')}{sorts.find(s => s.property === 'status')?.direction === 'asc' ? '▲' : '▼'}{/if}
          </button>
          <button role="columnheader" class="ml-col-rating ml-sortable" onclick={() => toggleSort('rating')}>
            Rating {#if sorts.find(s => s.property === 'rating')}{sorts.find(s => s.property === 'rating')?.direction === 'asc' ? '▲' : '▼'}{/if}
          </button>
        </div>
        {#each filteredBuckets.library as item (item.type + '-' + item.id)}
          <LibraryRow {item} {activeItem} {openDetails} {openFullPoster} />
        {/each}
      </div>
    </section>
  {/if}

  {#if mediaData.length === 0}
    <p class="ml-empty">Nothing here yet.</p>
  {/if}

  {#if activeItem}
    <MediaModal item={activeItem} {closeDetails} {openFullPoster} />
  {/if}

  {#if fullPosterUrl}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="ml-full-poster-backdrop" onclick={closeFullPoster}>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <img src={fullPosterUrl} alt="Full view" class="ml-full-poster-img" onclick={(e) => e.stopPropagation()} />
      <button class="ml-modal-close" onclick={closeFullPoster} aria-label="Close poster">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  {/if}
</div>

<style>
/* Media Library — standalone Netflix-ish layout, intentionally not matching
   the rest of the site. Lives in a fixed full-viewport panel so the global
   border frame / portrait / nav of the SPA shell don't interfere. */

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
  border-radius: 8px;
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
  padding-right: 60px; /* leave room for the hamburger */
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

.ml-section {
  margin-top: 48px;
}

/* ---------- Filters ---------- */

.ml-filters {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  flex-wrap: wrap;
}

.ml-search-input,
.ml-select {
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

.ml-search-input:focus,
.ml-select:focus {
  border-color: oklch(1 0 0 / 0.3);
  background: oklch(1 0 0 / 0.08);
}

.ml-search-input {
  flex: 1;
  min-width: 200px;
}

.ml-select {
  appearance: none;
  padding-right: 32px;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238a8a93' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  cursor: pointer;
}

.ml-select option {
  background: oklch(0.179 0.0061 285.77);
  color: oklch(0.9707 0.0027 286.35);
}

.ml-section-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: oklch(0.785 0.0112 286.14);
  margin: 0 0 16px;
}

/* ---------- Hero row (currently doing) ---------- */

.ml-hero-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

/* ---------- Table / library grid ---------- */

.ml-table {
  display: flex;
  flex-direction: column;
  border-top: 1px solid oklch(0.2419 0.0114 285.52);
}

.ml-table-head {
  display: grid;
  grid-template-columns: 60px 1fr 110px 90px;
  align-items: center;
  gap: 16px;
  padding: 12px 8px;
  border-bottom: 1px solid oklch(0.2419 0.0114 285.52);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: oklch(0.5416 0.0154 285.87);
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  padding-top: 8px;
  padding-bottom: 8px;
}

.ml-sortable {
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  padding: 0;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 6px;
  outline: none;
  text-transform: inherit;
  letter-spacing: inherit;
}

.ml-sortable:hover {
  color: oklch(0.9707 0.0027 286.35);
}

.ml-empty {
  color: oklch(0.5416 0.0154 285.87);
  text-align: center;
  padding: 80px 0;
  font-style: italic;
}

/* ---------- Responsive ---------- */

@media (max-width: 640px) {
  .ml-root {
    padding: 28px 18px 80px;
  }

  .ml-hero-row {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  .ml-table-head {
    display: none;
  }
}
</style>
