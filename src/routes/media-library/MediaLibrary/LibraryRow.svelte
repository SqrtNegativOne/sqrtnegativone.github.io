<script lang="ts">
  import { TYPE_LABEL } from "./constants";
  import RatingChart from "./RatingChart.svelte";
  
  let { item, openDetails } = $props<{ item: any; openDetails: (item: any) => void }>();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<div class="ml-row cursor-pointer" role="row" onclick={() => openDetails(item)}>
  <span role="cell" class="ml-col-poster">
    <div class={`ml-poster ml-poster--xs`}>
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
    <span class="ml-row-title">{item.title}</span>
    {#if item.subtitle}
      <span class="ml-row-sub">{item.subtitle}</span>
    {/if}
  </span>
  <span role="cell" class="ml-col-type">{TYPE_LABEL[item.type] || item.type}</span>
  <span role="cell" class="ml-col-status">
    <span class={`ml-status ml-status--${item.status}`}>{item.status}</span>
  </span>
  <span role="cell" class="ml-col-rating">
    <RatingChart rating={item.rating} />
  </span>
</div>

<style>
  .ml-row {
    display: grid;
    grid-template-columns: 60px 1fr 100px 110px 90px;
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
    font-size: 15px;
    font-weight: 500;
    letter-spacing: -0.005em;
  }

  .ml-row-sub {
    display: block;
    font-size: 12px;
    color: #8a8a93;
    margin-top: 2px;
  }

  .ml-col-type {
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 12px;
    color: #b8b8c0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
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
    width: 44px;
    border-radius: 4px;
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
    display: inline-block;
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 4px 8px;
    border-radius: 3px;
  }

  .ml-status--consuming  { background: rgba(255, 200, 60, 0.15);  color: #ffcc55; }
  .ml-status--finished   { background: rgba(80, 200, 120, 0.15);  color: #5dd29a; }
  .ml-status--wishlist   { background: rgba(120, 130, 150, 0.15); color: #9aa2b2; }
  .ml-status--rewishlist { background: rgba(120, 130, 150, 0.15); color: #9aa2b2; }
  .ml-status--next\ up   { background: rgba(120, 130, 150, 0.15); color: #9aa2b2; }
  .ml-status--abandoned  { background: rgba(220, 50, 50, 0.15); color: #d25050; }

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
    .ml-row .ml-col-type,
    .ml-row .ml-col-status {
      grid-area: meta;
      display: inline-block;
      margin-right: 10px;
    }
  }
</style>
