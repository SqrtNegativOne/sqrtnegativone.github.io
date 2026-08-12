<script lang="ts">
  import { TYPE_LABEL } from "./constants";
  import RatingChart from "../../../../shared/components/RatingChart.svelte";
  import { icons } from "$lib/icons";
  import StatusBadge from "../../../../shared/components/StatusBadge.svelte";
  import TypeBadge from "../../../../shared/components/TypeBadge.svelte";
  
  let { item, openDetails, openFullPoster } = $props<{ item: any; openDetails: (item: any) => void; openFullPoster?: (url: string) => void }>();
</script>



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
      <TypeBadge type={item.type} variant="icon" sizeClass="w-5 h-5" />
      <StatusBadge status={item.status} />
    </span>
    {#if item.tagline}
      <span class="ml-row-sub">{item.tagline}</span>
    {/if}
  </span>
  <span role="cell" class="ml-col-rating">
    <RatingChart rating={item.rating} />
  </span>
</div>

<style>
  .ml-row {
    display: grid;
    grid-template-columns: 60px 1fr 70px;
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
    font-family: "Manrope", system-ui, sans-serif;
    font-size: 20px;
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


  .ml-poster {
    position: relative;
    background: oklch(0.2329 0.0095 285.64);
    overflow: hidden;
    transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .ml-poster:hover {
    transform: scale(1.08);
    box-shadow: 0 8px 24px oklch(0 0 0 / 0.5);
    z-index: 10;
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
    border-radius: 3px;
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
      grid-template-columns: 60px 1fr auto;
      grid-template-areas:
        "poster title rating"
        "poster tagline tagline";
      row-gap: 4px;
    }

    .ml-row .ml-col-poster { grid-area: poster; }
    .ml-row .ml-col-title  { grid-area: title; display: flex; flex-direction: column; }
    .ml-row .ml-col-rating { grid-area: rating; }
    .ml-row-sub { grid-area: tagline; }
  }
</style>
