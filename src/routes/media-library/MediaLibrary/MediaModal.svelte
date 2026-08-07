<script lang="ts">
  import { TYPE_LABEL } from "./constants";
  import RatingChart from "./RatingChart.svelte";
  
  let { item, closeDetails } = $props<{ item: any; closeDetails: () => void }>();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="ml-modal-backdrop" onclick={closeDetails}>
  <div class="ml-modal-content" onclick={(e) => e.stopPropagation()}>
    <button class="ml-modal-close" onclick={closeDetails} aria-label="Close details">
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
    <div class="ml-modal-grid">
      <div class="ml-modal-poster">
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
          <span class={`ml-status ml-status--${item.status} ml-2`}>{item.status}</span>
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
    background: rgba(0, 0, 0, 0.95); /* Replaced backdrop-filter with darker solid color */
    transform: translateZ(0);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .ml-modal-content {
    background: #111114;
    border: 1px solid #1f1f25;
    border-radius: 16px;
    width: 100%;
    max-width: 700px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
    padding: 32px;
  }

  .ml-modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    color: #8a8a93;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .ml-modal-close:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  .ml-modal-grid {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 32px;
  }

  .ml-modal-poster {
    border-radius: 8px;
    overflow: hidden;
    background: #1d1d22;
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

  .ml-modal-info {
    display: flex;
    flex-direction: column;
  }

  .ml-modal-title {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
    font-family: "Instrument Serif", serif;
  }

  .ml-modal-subtitle {
    margin: 8px 0 0;
    color: #9a9aa3;
    font-size: 16px;
  }

  .ml-modal-meta {
    margin: 16px 0 24px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .ml-modal-desc {
    color: #d1d1d6;
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
    background: rgba(0, 0, 0, 0.65);
    color: #f5f5f7;
    backdrop-filter: blur(4px);
  }

  .ml-badge--game  { background: rgba(132, 73, 230, 0.85); }
  .ml-badge--movie { background: rgba(229, 9, 20, 0.85); }
  .ml-badge--show  { background: rgba(0, 122, 200, 0.85); }
  .ml-badge--book  { background: rgba(184, 134, 11, 0.85); }

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
    .ml-modal-grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }
    
    .ml-modal-poster {
      width: 140px;
    }
  }
</style>
