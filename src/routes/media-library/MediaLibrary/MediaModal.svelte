<script lang="ts">
  import { TYPE_LABEL } from "./constants";
  import RatingChart from "./RatingChart.svelte";
  import { icons } from "$lib/icons";
  
  let { item, closeDetails, openFullPoster } = $props<{ item: any; closeDetails: () => void; openFullPoster?: (url: string) => void }>();
</script>

{#snippet statusBadge(status: string)}
  <span class={`ml-status ml-status--${status.replace(' ', '-')} ml-2`}>
    <span class="ml-status-icon">
      {@html icons[`status-${status.replace(' ', '-')}`] || icons['type-default']}
    </span>
    {status}
  </span>
{/snippet}

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="ml-modal-backdrop" onclick={closeDetails}>
  <div class="ml-modal-content" onclick={(e) => e.stopPropagation()}>
    <button class="ml-modal-close" onclick={closeDetails} aria-label="Close details">
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
    <div class="ml-modal-grid">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="ml-modal-poster" onclick={(e) => { if(openFullPoster) { e.stopPropagation(); openFullPoster(item.poster_image); } }} style={openFullPoster && item.poster_image ? "cursor: pointer;" : ""}>
        {#if item.poster_image}
          <img src={item.poster_image} alt="" />
        {:else}
          <div class="ml-poster-fallback"><span>{TYPE_LABEL[item.type] || item.type}</span></div>
        {/if}
      </div>
      <div class="ml-modal-info">
        <h2 class="ml-modal-title">{item.title}</h2>
        {#if item.subtitle}
          <p class="ml-modal-subtitle">{item.subtitle}</p>
        {/if}
        <div class="ml-modal-meta">
          <span class={`ml-badge ml-badge--${item.type} static inline-block !relative !top-0 !left-0`}>{TYPE_LABEL[item.type] || item.type}</span>
          {@render statusBadge(item.status)}
          <RatingChart rating={item.rating} />
        </div>
        {#if item.description}
          <div class="ml-modal-desc">
            {item.description}
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
    max-width: 700px;
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
    grid-template-columns: 220px 1fr;
    gap: 32px;
  }

  .ml-modal-poster {
    border-radius: 8px;
    overflow: hidden;
    background: oklch(0.2329 0.0095 285.64);
    aspect-ratio: 2/3;
    width: 100%;
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

  .ml-modal-subtitle {
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

  .ml-modal-desc {
    color: oklch(0.8622 0.0068 286.26);
    font-size: 15px;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .ml-badge {
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 3px 7px;
    border-radius: 3px;
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    background: oklch(0 0 0 / 0.65);
    color: oklch(0.9707 0.0027 286.35);
    backdrop-filter: blur(4px);
  }

  .ml-badge--game  { background: oklch(0.5611 0.2236 295.48 / 0.85); }
  .ml-badge--movie { background: oklch(0.5814 0.2349 27.99 / 0.85); }
  .ml-badge--show  { background: oklch(0.5645 0.1497 247.37 / 0.85); }
  .ml-badge--book  { background: oklch(0.6521 0.1322 81.57 / 0.85); }

  .ml-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 6px 10px;
    border-radius: 4px;
  }

  .ml-status-icon {
    width: 14px;
    height: 14px;
    display: inline-flex;
  }

  .ml-status-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .ml-status--consuming  { background: oklch(0.8594 0.1588 85.88 / 0.15);  color: oklch(0.869 0.1453 85.42); }
  .ml-status--finished   { background: oklch(0.7451 0.1577 151.54 / 0.15);  color: oklch(0.7815 0.1344 160.05); }
  .ml-status--wishlist   { background: oklch(0.5854 0.2041 277.12 / 0.15); color: oklch(0.6801 0.1583 276.93); }
  .ml-status--rewishlist { background: oklch(0.6056 0.2189 292.72 / 0.15); color: oklch(0.709 0.1592 293.54); }
  .ml-status--next-up    { background: oklch(0.7148 0.1257 215.22 / 0.15); color: oklch(0.7971 0.1339 211.53); }
  .ml-status--dropped    { background: oklch(0.5866 0.2061 26.36 / 0.15); color: oklch(0.6047 0.1648 23.41); }
  .ml-status--shelved    { background: oklch(0.7137 0.0192 261.32 / 0.15); color: oklch(0.7137 0.0192 261.32); }

  .ml-rating {
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 12px;
    color: oklch(0.9707 0.0027 286.35);
    white-space: nowrap;
  }

  .ml-rating-num {
    font-weight: 600;
  }

  .ml-rating-sep,
  .ml-rating-max {
    color: oklch(0.5416 0.0154 285.87);
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
