<script lang="ts">
  import MediaGalleryCard from './MediaGalleryCard.svelte';
  import MediaGroupHeading from './MediaGroupHeading.svelte';
  import type { MediaGroup } from '../lib/mediaLibrary';
  import type { MediaItem } from '../types';

  let {
    groups,
    openDetails,
    resolveAsset = (url: string) => url,
    title = ''
  } = $props<{
    groups: MediaGroup[];
    openDetails: (item: MediaItem) => void;
    resolveAsset?: (url: string) => string;
    /** Optional heading for the whole view, e.g. "Library" on the public site. */
    title?: string;
  }>();

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

    {#each groups as group (group.key)}
      <section class="ml-group" aria-labelledby={`ml-gallery-group-${group.key}`}>
        <div class="ml-group-head">
          <MediaGroupHeading
            {group}
            id={`ml-gallery-group-${group.key}`}
            panelId={`ml-gallery-panel-${group.key}`}
            expanded={isExpanded(group.key)}
            onToggle={() => toggleGroup(group.key)}
          />
        </div>
        <div
          class="ml-gallery"
          id={`ml-gallery-panel-${group.key}`}
          hidden={!isExpanded(group.key)}
        >
          {#each group.items as item (item.type + '-' + item.id)}
            <MediaGalleryCard {item} {openDetails} {resolveAsset} />
          {/each}
        </div>
      </section>
    {/each}
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

  .ml-group + .ml-group {
    margin-top: 40px;
  }

  .ml-group-head {
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid oklch(0.2419 0.0114 285.52);
  }

  .ml-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
  }

  /* The hidden attribute must beat the grid display above. */
  .ml-gallery[hidden] {
    display: none;
  }

  @media (max-width: 640px) {
    .ml-gallery {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
    }
  }
</style>
