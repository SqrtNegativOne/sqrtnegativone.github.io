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
    <div class={`ml-poster ml-poster--xs`} onclick={(e) => { if(openFullPoster) { e.stopPropagation(); openFullPoster(item.poster_image); } }}>
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
      <span class="ml-type-icon" style="color: {item.type === 'movie' ? '#60a5fa' : item.type === 'show' ? '#c084fc' : item.type === 'game' ? '#4ade80' : item.type === 'book' ? '#facc15' : '#94a3b8'}">
        {@html icons[`type-${item.type}`] || icons['type-default']}
      </span>
    </span>
    {#if item.subtitle}
      <span class="ml-row-sub">{item.subtitle}</span>
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
    border-bottom: 1px solid #1f1f25;
    transition: background-color 120ms ease;
  }

  .ml-row:hover {
    background-color: #14141a;
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
    color: #8a8a93;
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
    background: #1d1d22;
    overflow: hidden;
  }

  .ml-poster img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
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
      #1d1d22 0px,
      #1d1d22 8px,
      #16161a 8px,
      #16161a 16px
    );
    color: #4d4d56;
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

  .ml-status--consuming  { background: rgba(255, 200, 60, 0.15);  color: #ffcc55; }
  .ml-status--finished   { background: rgba(80, 200, 120, 0.15);  color: #5dd29a; }
  .ml-status--wishlist   { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
  .ml-status--rewishlist { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
  .ml-status--next-up    { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
  .ml-status--dropped    { background: rgba(220, 50, 50, 0.15); color: #d25050; }
  .ml-status--shelved    { background: rgba(156, 163, 175, 0.15); color: #9ca3af; }

  .ml-rating {
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 12px;
    color: #f5f5f7;
    white-space: nowrap;
  }

  .ml-rating-num {
    font-weight: 600;
  }

  .ml-rating-sep,
  .ml-rating-max {
    color: #6e6e78;
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
