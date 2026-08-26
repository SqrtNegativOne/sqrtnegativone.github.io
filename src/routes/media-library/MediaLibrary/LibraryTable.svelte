<script lang="ts">
  import LibraryRow from "./LibraryRow.svelte";

  let { items, sorts, toggleSort, openDetails, openFullPoster } = $props<{
    items: Record<string, unknown>[];
    sorts: { property: string; direction: 'asc' | 'desc' }[];
    toggleSort: (column: string) => void;
    openDetails: (item: Record<string, unknown>) => void;
    openFullPoster?: (url: string) => void;
  }>();
</script>

{#if items.length > 0}
  <section class="ml-section">
    <h2 class="ml-section-title">Library</h2>
    <div class="ml-table" role="table">
      <div class="ml-table-head" role="row">
        <span role="columnheader" class="ml-col-poster"></span>
        <button role="columnheader" class="ml-col-title ml-sortable" onclick={() => toggleSort('title')}>
          Title {#if sorts.find(s => s.property === 'title')}{sorts.find(s => s.property === 'title')?.direction === 'asc' ? '▲' : '▼'}{/if}
        </button>
        <button role="columnheader" class="ml-col-rating ml-sortable" onclick={() => toggleSort('rating')}>
          Rating {#if sorts.find(s => s.property === 'rating')}{sorts.find(s => s.property === 'rating')?.direction === 'asc' ? '▲' : '▼'}{/if}
        </button>
      </div>
      {#each items as item (item.type + '-' + item.id)}
        <LibraryRow {item} {openDetails} {openFullPoster} />
      {/each}
    </div>
  </section>
{/if}

<style>
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

  /* ---------- Table / library grid ---------- */
  .ml-table {
    display: flex;
    flex-direction: column;
    border-top: 1px solid oklch(0.2419 0.0114 285.52);
  }

  .ml-table-head {
    display: grid;
    grid-template-columns: 60px 1fr 70px;
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

  @media (max-width: 640px) {
    .ml-table-head {
      display: none;
    }
  }
</style>
