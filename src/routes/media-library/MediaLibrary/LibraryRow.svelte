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
    <span class="ml-row-title-container">
      <span class="ml-row-title">{item.title}</span>
      {#if item.type === 'movie'}
        <svg class="ml-type-icon" style="color: #60a5fa;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
      {:else if item.type === 'show'}
        <svg class="ml-type-icon" style="color: #c084fc;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
      {:else if item.type === 'game'}
        <svg class="ml-type-icon" style="color: #4ade80;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><rect x="2" y="6" width="20" height="12" rx="2"></rect></svg>
      {:else if item.type === 'book'}
        <svg class="ml-type-icon" style="color: #facc15;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
      {:else}
        <svg class="ml-type-icon" style="color: #94a3b8;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      {/if}
    </span>
    {#if item.subtitle}
      <span class="ml-row-sub">{item.subtitle}</span>
    {/if}
  </span>
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
    grid-template-columns: 60px 1fr 110px 90px;
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
    .ml-row .ml-col-status {
      grid-area: meta;
      display: inline-block;
    }
  }
</style>
