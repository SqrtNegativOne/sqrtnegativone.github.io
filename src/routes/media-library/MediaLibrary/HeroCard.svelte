<script lang="ts">
  import { TYPE_LABEL } from "./constants";
  import RatingChart from "./RatingChart.svelte";
  
  let { item, openDetails } = $props<{ item: any; openDetails: (item: any) => void }>();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<article class="ml-hero-card" onclick={() => openDetails(item)}>
  <div class="ml-poster ml-poster--lg">
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
    {#if item.subtitle}
      <p class="ml-hero-sub">{item.subtitle}</p>
    {/if}
    <p class="ml-hero-line">
      {TYPE_LABEL[item.type] || item.type}
    </p>
  </div>
</article>

<style>
  .ml-hero-card {
    background: linear-gradient(180deg, #18181c 0%, #111114 100%);
    border-radius: 12px;
    overflow: hidden;
    transition: transform 180ms ease, box-shadow 180ms ease;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.03) inset;
  }

  .ml-hero-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
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
    color: #9a9aa3;
    font-size: 13px;
    line-height: 1.4;
  }

  .ml-hero-line {
    margin: 10px 0 0;
    color: #6e6e78;
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
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
    .ml-hero-title { font-size: 16px; }
  }
</style>
