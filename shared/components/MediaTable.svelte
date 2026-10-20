<script lang="ts">
  import LibraryRow from './LibraryRow.svelte';
  import MediaGroupHeading from './MediaGroupHeading.svelte';
  import type { MediaGroup, MediaSortRule } from '../lib/mediaLibrary';
  import type { MediaItem } from '../types';

  let {
    groups,
    sorts = [],
    toggleSort,
    openDetails,
    openFullPoster,
    resolveAsset = (url: string) => url,
    title = ''
  } = $props<{
    groups: MediaGroup[];
    sorts?: MediaSortRule[];
    /** When provided, the Title/Rating headers become sort buttons. */
    toggleSort?: (column: string) => void;
    openDetails: (item: MediaItem) => void;
    openFullPoster?: (url: string) => void;
    resolveAsset?: (url: string) => string;
    /** Optional heading for the whole view, e.g. "Library" on the public site. */
    title?: string;
  }>();

  function sortDirection(column: string): 'asc' | 'desc' | undefined {
    return sorts.find((sort: MediaSortRule) => sort.property === column)?.direction;
  }

  // Collapsed by default; keys stay expanded across filter changes for groups
  // that still exist.
  let expandedGroups = $state<string[]>([]);

  function isExpanded(key: string): boolean {
    return expandedGroups.includes(key);
  }

  function toggleGroup(key: string) {
    expandedGroups = isExpanded(key)
      ? expandedGroups.filter((expanded) => expanded !== key)
      : [...expandedGroups, key];
  }
</script>

{#if groups.length > 0}
  <section class="ml-section">
    {#if title}
      <h2 class="ml-section-title">{title}</h2>
    {/if}

    <div class="ml-table" role="table">
      <div class="ml-table-head" role="row">
        <span role="columnheader" class="ml-col-poster"></span>
        {#if toggleSort}
          <button
            type="button"
            role="columnheader"
            class="ml-col-title ml-sortable"
            aria-sort={sortDirection('title') === 'asc' ? 'ascending' : sortDirection('title') === 'desc' ? 'descending' : 'none'}
            onclick={() => toggleSort?.('title')}
          >
            Title {#if sortDirection('title')}{sortDirection('title') === 'asc' ? '▲' : '▼'}{/if}
          </button>
          <button
            type="button"
            role="columnheader"
            class="ml-col-rating ml-sortable"
            aria-sort={sortDirection('rating') === 'asc' ? 'ascending' : sortDirection('rating') === 'desc' ? 'descending' : 'none'}
            onclick={() => toggleSort?.('rating')}
          >
            Rating {#if sortDirection('rating')}{sortDirection('rating') === 'asc' ? '▲' : '▼'}{/if}
          </button>
        {:else}
          <span role="columnheader" class="ml-col-title">Title</span>
          <span role="columnheader" class="ml-col-rating">Rating</span>
        {/if}
      </div>

      {#each groups as group (group.key)}
        <div class="ml-group-head" role="row">
          <div class="ml-group-cell" role="cell" aria-colspan={3}>
            <MediaGroupHeading
              {group}
              panelId={`ml-table-panel-${group.key}`}
              expanded={isExpanded(group.key)}
              onToggle={() => toggleGroup(group.key)}
            />
          </div>
        </div>
        <div
          class="ml-group-rows"
          role="rowgroup"
          id={`ml-table-panel-${group.key}`}
          hidden={!isExpanded(group.key)}
        >
          {#each group.items as item (item.type + '-' + item.id)}
            <LibraryRow {item} {openDetails} {openFullPoster} {resolveAsset} />
          {/each}
        </div>
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
    margin: 0 0 20px;
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

  .ml-group-head {
    padding: 28px 8px 10px;
    border-bottom: 1px solid oklch(0.2419 0.0114 285.52);
  }

  .ml-table-head + .ml-group-head {
    padding-top: 18px;
  }

  .ml-group-cell {
    display: flex;
    align-items: center;
  }

  .ml-group-rows[hidden] {
    display: none;
  }

  @media (max-width: 640px) {
    .ml-table-head {
      display: none;
    }

    .ml-table-head + .ml-group-head {
      padding-top: 10px;
    }
  }
</style>
