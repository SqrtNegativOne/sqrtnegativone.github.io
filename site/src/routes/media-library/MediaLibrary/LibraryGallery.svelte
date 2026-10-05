<script lang="ts">
  import GalleryCard from "./GalleryCard.svelte";
  import type { MediaItem } from "$shared/types";

  let { items, openDetails } = $props<{
    items: MediaItem[];
    openDetails: (item: MediaItem) => void;
  }>();
</script>

{#if items.length > 0}
  <section class="ml-section">
    <h2 class="ml-section-title">Library</h2>
    <div class="ml-gallery">
      {#each items as item (item.type + '-' + item.id)}
        <GalleryCard {item} {openDetails} />
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

  .ml-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
  }

  @media (max-width: 640px) {
    .ml-gallery {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
    }
  }
</style>
