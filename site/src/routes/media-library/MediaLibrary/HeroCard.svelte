<script lang="ts">
  import { TYPE_LABEL } from "../../../../shared/components/constants";
  import TypeBadge from "../../../../shared/components/TypeBadge.svelte";
  import { getPosterUrl } from "$lib/utils";
  import type { MediaItem } from "../../../../shared/types";
  
  let { item, openDetails } = $props<{ item: MediaItem; openDetails: (item: MediaItem) => void; }>();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<article class="ml-hero-card" onclick={() => openDetails(item)}>
  <div class="ml-poster ml-poster--lg">
    {#if item.poster_image}
      <img src={getPosterUrl(item.poster_image as string)} alt="" loading="lazy" />
    {:else}
      <div class="ml-poster-fallback">
        <span>{TYPE_LABEL[item.type as string] || item.type}</span>
      </div>
    {/if}
  </div>
  <div class="ml-hero-meta">
    <div class="ml-hero-title-row">
      <div class="ml-hero-title-group">
        <h3 class="ml-hero-title">{item.title}</h3>
        <TypeBadge type={item.type as string} variant="icon" sizeClass="w-[18px] h-[18px]" />
      </div>
    </div>
    {#if item.author || item.publisher}
      <div class="text-xs text-[oklch(0.8_0.03_256)] mt-1.5 font-medium truncate">
        {[item.author, item.publisher].filter(Boolean).join(' • ')}
      </div>
    {/if}
    {#if item.tagline}
      <p class="ml-hero-sub truncate">{item.tagline}</p>
    {/if}
  </div>
</article>

<style>
  .ml-hero-card {
    background: linear-gradient(180deg, oklch(0.2108 0.0078 285.71) 0%, oklch(0.179 0.0061 285.77) 100%);
    overflow: hidden;
    transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 0 oklch(1 0 0 / 0.03) inset;
    cursor: pointer;
    flex-shrink: 0;
    width: 200px; /* Reduced size for carousel */
    display: flex;
    flex-direction: column;
  }

  .ml-hero-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px oklch(0 0 0 / 0.6);
  }

  .ml-hero-meta {
    padding: 16px 18px 20px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .ml-hero-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .ml-hero-title-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ml-hero-title {
    margin: 0;
    font-size: 16px; /* slightly smaller title */
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.25;
  }

  .ml-hero-sub {
    margin: 6px 0 0;
    color: oklch(0.6891 0.013 286.05);
    font-size: 13px;
    line-height: 1.4;
  }

  .ml-poster {
    position: relative;
    background: oklch(0.2329 0.0095 285.64);
    overflow: hidden;
  }

  .ml-poster img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ml-poster--lg {
    aspect-ratio: 2 / 3;
    width: 100%;
  }

  .ml-poster-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: repeating-linear-gradient(
      135deg,
      oklch(0.2329 0.0095 285.64) 0px,
      oklch(0.2329 0.0095 285.64) 8px,
      oklch(0.202 0.0079 285.67) 8px,
      oklch(0.202 0.0079 285.67) 16px
    );
    color: oklch(0.4235 0.0148 285.75);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  @media (max-width: 640px) {
    .ml-hero-title { font-size: 16px; }
  }
</style>
