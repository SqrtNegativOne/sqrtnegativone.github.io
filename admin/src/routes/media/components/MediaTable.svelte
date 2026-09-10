<script lang="ts">
  import { assetState } from '$lib/assetState.svelte';
  import LibraryRow from '../../../../../shared/components/LibraryRow.svelte';
  let { filteredMedia, openEdit, openFullPoster } = $props();
</script>

<div class="card overflow-x-auto bg-[oklch(0.2103_0.0059_285.89)] border border-[oklch(0.2739_0.0055_286.03)] rounded">
  <div class="ml-table" role="table">
    <div class="ml-table-head" role="row">
      <span role="columnheader" class="ml-col-poster"></span>
      <span role="columnheader" class="ml-col-title">Title</span>
      <span role="columnheader" class="ml-col-rating">Rating</span>
    </div>
    {#each filteredMedia as item (item.id)}
      <LibraryRow {item} openDetails={openEdit} {openFullPoster} resolveAsset={(url) => assetState.resolve(url)} />
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
    border-bottom: 1px solid oklch(0.2739 0.0055 286.03);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: oklch(0.7107 0.0351 256.79);
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
