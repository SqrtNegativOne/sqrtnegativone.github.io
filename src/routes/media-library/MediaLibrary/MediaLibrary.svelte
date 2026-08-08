<script lang="ts">
  import mediaData from "../../../data/media.json";
  import HeroCard from "./HeroCard.svelte";
  import LibraryRow from "./LibraryRow.svelte";
  import MediaModal from "./MediaModal.svelte";
  
  let searchQuery = $state("");
  let typeFilter = $state("all");
  let sortOrder = $state("rating-desc");

  let filteredBuckets = $derived((() => {
    const buckets: { consuming: any[], library: any[] } = { consuming: [], library: [] };
    for (const item of mediaData) {
      if (searchQuery && !item.title?.toLowerCase().includes(searchQuery.toLowerCase()) && !item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())) continue;
      if (typeFilter !== "all" && item.type !== typeFilter) continue;

      if (item.status === "consuming") {
        buckets.consuming.push(item);
      } else {
        buckets.library.push(item);
      }
    }
    const sortFn = (a: any, b: any) => {
      if (sortOrder === "title-asc") return (a.title || "").localeCompare(b.title || "");
      if (sortOrder === "title-desc") return (b.title || "").localeCompare(a.title || "");
      if (sortOrder === "rating-desc") return (b.rating || 0) - (a.rating || 0) || a.title.localeCompare(b.title);
      if (sortOrder === "rating-asc") return (a.rating || 0) - (b.rating || 0) || a.title.localeCompare(b.title);
      return 0;
    };
    buckets.consuming.sort(sortFn);
    buckets.library.sort(sortFn);
    return buckets;
  })());

  let activeItem: any = $state(null);

  function openDetails(item: any) {
    activeItem = item;
    document.body.style.overflow = 'hidden';
  }

  function closeDetails() {
    activeItem = null;
    document.body.style.overflow = '';
  }
</script>

<div class="ml-root">
  <header class="ml-header">
    <h1 class="ml-title">Media Library</h1>
    <p class="ml-tagline">Things I'm watching, reading, playing.</p>
    
    <div class="ml-filters">
      <input type="text" bind:value={searchQuery} placeholder="Search..." class="ml-search-input" />
      <select bind:value={typeFilter} class="ml-select">
        <option value="all">All Types</option>
        <option value="movie">Movies</option>
        <option value="show">Shows</option>
        <option value="game">Games</option>
        <option value="book">Books</option>
      </select>
      <select bind:value={sortOrder} class="ml-select">
        <option value="rating-desc">Highest Rated</option>
        <option value="rating-asc">Lowest Rated</option>
        <option value="title-asc">Title (A-Z)</option>
        <option value="title-desc">Title (Z-A)</option>
      </select>
    </div>
  </header>

  {#if filteredBuckets.consuming.length > 0}
    <section class="ml-section ml-section--hero">
      <h2 class="ml-section-title">Currently</h2>
      <div class="ml-hero-row">
        {#each filteredBuckets.consuming as item (item.type + '-' + item.id)}
          <HeroCard {item} {openDetails} />
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
          <span role="columnheader" class="ml-col-title">Title</span>
          <span role="columnheader" class="ml-col-status">Status</span>
          <span role="columnheader" class="ml-col-rating">Rating</span>
        </div>
        {#each filteredBuckets.library as item (item.type + '-' + item.id)}
          <LibraryRow {item} {openDetails} />
        {/each}
      </div>
    </section>
  {/if}

  {#if mediaData.length === 0}
    <p class="ml-empty">Nothing here yet.</p>
  {/if}

  {#if activeItem}
    <MediaModal item={activeItem} {closeDetails} />
  {/if}
</div>

<style>
/* Media Library — standalone Netflix-ish layout, intentionally not matching
   the rest of the site. Lives in a fixed full-viewport panel so the global
   border frame / portrait / nav of the SPA shell don't interfere. */

.ml-root {
  position: fixed;
  inset: 0;
  z-index: 5;
  overflow-y: auto;
  background: #0b0b0d;
  color: #f5f5f7;
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
  color: #8a8a93;
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f5f5f7;
  padding: 10px 16px;
  border-radius: 8px;
  font-family: "Inter", system-ui, sans-serif;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.ml-search-input:focus,
.ml-select:focus {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
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
  background: #111114;
  color: #f5f5f7;
}

.ml-section-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #b8b8c0;
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
  border-top: 1px solid #1f1f25;
}

.ml-table-head {
  display: grid;
  grid-template-columns: 60px 1fr 110px 90px;
  align-items: center;
  gap: 16px;
  padding: 12px 8px;
  border-bottom: 1px solid #1f1f25;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6e6e78;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  padding-top: 8px;
  padding-bottom: 8px;
}

.ml-empty {
  color: #6e6e78;
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
