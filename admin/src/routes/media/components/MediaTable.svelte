<script lang="ts">
  import { assetState } from '$lib/assetState.svelte';
  import LibraryRow from '../../../../../shared/components/LibraryRow.svelte';
  let { filteredMedia, openEdit } = $props();
</script>

<div class="card overflow-x-auto bg-[oklch(0.2077_0.0398_265.75)] border border-[oklch(0.3717_0.0392_257.29)] rounded-lg">
  <div class="ml-table" role="table">
    <div class="ml-table-head" role="row">
      <span role="columnheader" class="ml-col-poster"></span>
      <span role="columnheader" class="ml-col-title">Title</span>
      <span role="columnheader" class="ml-col-rating">Rating</span>
    </div>
    {#each filteredMedia as item (item.id)}
      <LibraryRow {item} openDetails={openEdit} resolveAsset={(url) => assetState.resolve(url)} />
    {/each}
    {#if filteredMedia.length === 0}
      <div class="p-8 text-center text-[oklch(0.7107_0.0351_256.79)]">No media found matching your filters.</div>
    {/if}
  </div>
</div>

<style>
  /* ---------- Table / library grid ---------- */
  .ml-table {
    display: flex;
    flex-direction: column;
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
    padding-top: 12px;
    padding-bottom: 12px;
    margin-left: 8px;
    margin-right: 8px;
  }

  @media (max-width: 640px) {
    .ml-table-head {
      display: none;
    }
  }
</style>
