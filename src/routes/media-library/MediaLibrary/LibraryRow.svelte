<script lang="ts">
  import { TYPE_LABEL } from "./constants";
  import RatingChart from "./RatingChart.svelte";
  import { icons } from "$lib/icons";
  
  let { item, openDetails, openFullPoster } = $props<{ item: any; openDetails: (item: any) => void; openFullPoster?: (url: string) => void }>();
</script>

{#snippet statusBadge(status: string)}
  <span class={`ml-status ml-status--${status.replace(' ', '-')}`}>
    <span class="ml-status-icon">
      {@html icons[`status-${status.replace(' ', '-')}`] || icons['type-default']}
    </span>
    {status}
  </span>
{/snippet}

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<div class="ml-row cursor-pointer" role="row" onclick={() => openDetails(item)}>
  <span role="cell" class="ml-col-poster">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class={`ml-poster ml-poster--xs`} onclick={(e) => { if(openFullPoster) { e.stopPropagation(); openFullPoster(item.poster_image); } }} style="view-transition-name: poster-{item.id}">
      {#if item.poster_image}
        <img src={item.poster_image} alt="" loading="lazy" />
      {:else}
        <div class="ml-poster-fallback">
          <span>{TYPE_LABEL[item.type] || item.type}</span>
        </div>
      {/if}
    </div>
  </span>
  <span role="cell" class="ml-col-title">
    <span class="ml-row-title-container">
      <span class="ml-row-title">{item.title}</span>
      <span class="ml-type-icon" style="color: {item.type === 'movie' ? 'oklch(0.7137 0.1434 254.62)' : item.type === 'show' ? 'oklch(0.7217 0.1767 305.5)' : item.type === 'game' ? 'oklch(0.8003 0.1821 151.71)' : item.type === 'book' ? 'oklch(0.8606 0.1731 91.94)' : 'oklch(0.7107 0.0351 256.79)'}">
        {@html icons[`type-${item.type}`] || icons['type-default']}
      </span>
    </span>
    {#if item.tagline}
      <span class="ml-row-sub">{item.tagline}</span>
    {/if}
  </span>
  <span role="cell" class="ml-col-status">
    {@render statusBadge(item.status)}
  </span>
  <span role="cell" class="ml-col-rating">
    <RatingChart rating={item.rating} />
  </span>
</div>

<style>
  .ml-row {
    display: grid;
    grid-template-columns: 76px 1fr 130px 100px;
    align-items: center;
    gap: 16px;
    padding: 12px 8px;
    border-bottom: 1px solid oklch(0.2419 0.0114 285.52);
    transition: background-color 120ms ease;
  }

  .ml-row:hover {
    background-color: oklch(0.1941 0.012 285.23);
  }

  .ml-row-title {
    display: block;
    font-size: 18px;
    font-weight: 500;
    letter-spacing: -0.005em;
  }

  .ml-row-sub {
    display: block;
    font-size: 14px;
    color: oklch(0.6363 0.0133 286.02);
    margin-top: 2px;
  }

  .ml-row-title-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ml-type-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    opacity: 0.8;
    display: inline-flex;
  }

  .ml-type-icon :global(svg) {
    width: 100%;
    height: 100%;
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
    transition: transform 300ms ease;
  }

  .ml-poster:hover img {
    transform: scale(1.05);
  }

  .ml-poster--xs {
    aspect-ratio: 2 / 3;
    width: 60px;
    border-radius: 6px;
    flex-shrink: 0;
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
  .ml-status--waiting-for{ background: oklch(0.75 0.15 45 / 0.15); color: oklch(0.75 0.15 45); }

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
    .ml-row {
      grid-template-columns: 44px 1fr auto;
      grid-template-areas:
        "poster title rating"
        "poster meta  meta";
      row-gap: 4px;
    }

    .ml-row .ml-col-poster { grid-area: poster; }
    .ml-row .ml-col-title  { grid-area: title;  }
    .ml-row .ml-col-rating { grid-area: rating; }
    .ml-row .ml-col-status {
      grid-area: meta;
      display: inline-block;
    }
  }
</style>
