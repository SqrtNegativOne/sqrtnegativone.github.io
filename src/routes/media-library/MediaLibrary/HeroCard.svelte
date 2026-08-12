<script lang="ts">
  import { TYPE_LABEL } from "./constants";
  import RatingChart from "../../../../shared/components/RatingChart.svelte";
  
  let { item, openDetails, openFullPoster } = $props<{ item: any; openDetails: (item: any) => void; openFullPoster?: (url: string) => void }>();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<article class="ml-hero-card" onclick={() => openDetails(item)}>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="ml-poster ml-poster--lg" onclick={(e) => { if(openFullPoster) { e.stopPropagation(); openFullPoster(item.poster_image); } }}>
    {#if item.poster_image}
      <img src={item.poster_image} alt="" loading="lazy" />
    {:else}
      <div class="ml-poster-fallback">
        <span>{TYPE_LABEL[item.type] || item.type}</span>
      </div>
    {/if}
  </div>
  <div class="ml-hero-meta">
    <div class="ml-hero-title-row">
      <h3 class="ml-hero-title">{item.title}</h3>
      <RatingChart rating={item.rating} />
    </div>
    {#if item.tagline}
      <p class="ml-hero-sub">{item.tagline}</p>
    {/if}
    <p class="ml-hero-line">
      {TYPE_LABEL[item.type] || item.type}
    </p>
  </div>
</article>

<style>
  .ml-hero-card {
    background: linear-gradient(180deg, oklch(0.2108 0.0078 285.71) 0%, oklch(0.179 0.0061 285.77) 100%);
    border-radius: 6px;
    overflow: hidden;
    transition: transform 180ms ease, box-shadow 180ms ease;
    box-shadow: 0 1px 0 oklch(1 0 0 / 0.03) inset;
  }

  .ml-hero-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px oklch(0 0 0 / 0.5);
  }

  .ml-hero-meta {
    padding: 16px 18px 20px;
  }

  .ml-hero-title-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }

  .ml-hero-title {
    margin: 0;
    font-size: 18px;
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

  .ml-hero-line {
    margin: 10px 0 0;
    color: oklch(0.5416 0.0154 285.87);
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
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
