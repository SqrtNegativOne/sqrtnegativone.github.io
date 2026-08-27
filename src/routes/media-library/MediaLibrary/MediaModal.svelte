<script lang="ts">
  import { TYPE_LABEL } from "./constants";
  import RatingChart from "../../../../shared/components/RatingChart.svelte";

  import StatusBadge from "../../../../shared/components/StatusBadge.svelte";
  import TypeBadge from "../../../../shared/components/TypeBadge.svelte";
  import { fade, scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { getPosterUrl } from "$lib/utils";
  
  let { item, closeDetails, openFullPoster } = $props<{ item: Record<string, unknown>; closeDetails: () => void; openFullPoster?: (url: string) => void }>();
</script>



<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="ml-modal-backdrop" onclick={closeDetails} transition:fade={{ duration: 200 }}>
  <div class="ml-modal-content" onclick={(e) => e.stopPropagation()} transition:scale={{ start: 0.95, duration: 300, easing: cubicOut }}>
    <button class="ml-modal-close" onclick={closeDetails} aria-label="Close details">
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
    <div class="ml-modal-grid">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="ml-modal-poster {openFullPoster && item.poster_image ? 'is-interactive' : ''}" onclick={(e) => { if(openFullPoster) { e.stopPropagation(); openFullPoster(getPosterUrl(item.poster_image as string)); } }} style={openFullPoster && item.poster_image ? 'cursor: pointer;' : ''}>
        {#if item.poster_image}
          <img src={getPosterUrl(item.poster_image as string)} alt="" />
        {:else}
          <div class="ml-poster-fallback"><span>{TYPE_LABEL[item.type] || item.type}</span></div>
        {/if}
      </div>
      <div class="ml-modal-info">
        <h2 class="ml-modal-title">
          {item.title}
        </h2>
        {#if item.tagline}
          <p class="ml-modal-tagline">{item.tagline}</p>
        {/if}
        <div class="ml-modal-meta">
          <div class="flex items-center gap-2">
            <TypeBadge type={item.type} variant="icon" sizeClass="w-[18px] h-[18px]" />
            <StatusBadge status={item.status} />
          </div>
          <RatingChart rating={item.rating as number} expected={['wishlist', 'next up', 'waiting for'].includes(item.status as string)} />
        </div>
        {#if item.description}
          <div class="ml-modal-description">
            {item.description}
          </div>
        {/if}
        {#if item.notes}
          <div class="ml-modal-desc">
            {item.notes}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .ml-modal-backdrop {
    position: fixed;
    inset: 0;
    background: oklch(0 0 0 / 0.95); /* Replaced backdrop-filter with darker solid color */
    transform: translateZ(0);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .ml-modal-content {
    background: oklch(0.179 0.0061 285.77);
    border: 1px solid oklch(0.2419 0.0114 285.52);
    border-radius: 16px;
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 24px 48px oklch(0 0 0 / 0.6);
    padding: 32px;
  }

  .ml-modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    color: oklch(0.6363 0.0133 286.02);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .ml-modal-close:hover {
    color: white;
    background: oklch(1 0 0 / 0.1);
  }

  .ml-modal-grid {
    display: grid;
    grid-template-columns: minmax(220px, 38%) 1fr;
    align-items: center;
    gap: 32px;
  }

  .ml-modal-poster {
    overflow: hidden;
    background: oklch(0.2329 0.0095 285.64);
    aspect-ratio: 2/3;
    width: 100%;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .ml-modal-poster.is-interactive:hover {
    transform: scale(1.03);
    box-shadow: 0 12px 32px oklch(0 0 0 / 0.5);
  }

  .ml-modal-poster img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

  .ml-modal-info {
    display: flex;
    flex-direction: column;
  }

  .ml-modal-title {
    margin: 0;
    font-size: 40px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
    font-family: "Instrument Serif", serif;
  }

  .ml-modal-tagline {
    margin: 8px 0 0;
    color: oklch(0.6891 0.013 286.05);
    font-size: 18px;
  }

  .ml-modal-meta {
    margin: 16px 0 24px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .ml-modal-description {
    color: oklch(0.5416 0.0154 285.87);
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    margin-bottom: 16px;
    font-style: italic;
  }

  .ml-modal-desc {
    color: oklch(0.8622 0.0068 286.26);
    font-size: 15px;
    line-height: 1.6;
    white-space: pre-wrap;
  }






  @media (max-width: 640px) {
    .ml-modal-grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }
    
    .ml-modal-poster {
      width: 140px;
    }
  }
</style>
