<script lang="ts">
  import HeroCard from "./HeroCard.svelte";
  import type { MediaItem } from "../../../../shared/types";

  let { title, items, openDetails } = $props<{
    title: string;
    items: MediaItem[];
    openDetails: (item: MediaItem) => void;
  }>();
</script>

{#if items.length > 0}
  <section class="ml-section ml-section--hero">
    <h2 class="ml-section-title">{title}</h2>
    <div class="ml-hero-row">
      {#each items as item (item.type + '-' + item.id)}
        <HeroCard {item} {openDetails} />
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

  /* ---------- Hero row (carousels) ---------- */
  .ml-hero-row {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    padding-top: 12px;
    margin-top: -12px;
    padding-bottom: 24px;
    scrollbar-width: thin;
    scrollbar-color: oklch(1 0 0 / 0.2) transparent;
  }

  .ml-hero-row::-webkit-scrollbar {
    height: 6px;
  }

  .ml-hero-row::-webkit-scrollbar-track {
    background: transparent;
  }

  .ml-hero-row::-webkit-scrollbar-thumb {
    background-color: oklch(1 0 0 / 0.2);
    border-radius: 10px;
  }
</style>
