<script lang="ts">
  import { TYPE_LABEL } from "$shared/components/constants";
  import TypeBadge from "$shared/components/TypeBadge.svelte";
  import StatusBadge from "$shared/components/StatusBadge.svelte";
  import RatingChart from "$shared/components/RatingChart.svelte";
  import { getPosterUrl } from "$lib/utils";
  import type { MediaItem } from "$shared/types";

  let { item, openDetails } = $props<{
    item: MediaItem;
    openDetails: (item: MediaItem) => void;
  }>();

  const expected = $derived(
    ['wishlist', 'next up', 'waiting for'].includes(item.status as string)
  );

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetails(item);
    }
  }
</script>

<div
  class="ml-card"
  role="button"
  tabindex="0"
  aria-label={`${item.title}${item.author ? ` by ${item.author}` : ''}`}
  onclick={() => openDetails(item)}
  onkeydown={handleKeydown}
>
  <div class="ml-card-poster">
    {#if item.poster_image}
      <img
        class="ml-card-img"
        src={getPosterUrl(item.poster_image as string)}
        alt=""
        loading="lazy"
      />
    {:else}
      <div class="ml-poster-fallback">
        <span>{TYPE_LABEL[item.type as string] || item.type}</span>
      </div>
    {/if}
  </div>

  {#if item.hidden}
    <span class="ml-hidden-badge">Hidden</span>
  {/if}

  <div class="ml-card-meta">
    <div class="ml-card-info">
      <h3 class="ml-card-title">{item.title}</h3>
      <div class="ml-card-sub">
        <TypeBadge type={item.type as string} variant="icon" sizeClass="w-4 h-4" />
        <StatusBadge status={item.status as string} />
      </div>
      {#if item.author || item.publisher}
        <div class="ml-card-author">
          {[item.author, item.publisher].filter(Boolean).join(" • ")}
        </div>
      {/if}
      {#if item.tagline || item.notes}
        <p class="ml-card-tagline">
          {#if item.tagline}<span class="ml-card-tagline-text">{item.tagline}</span>{/if}
          {#if item.notes}
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-card-notes-icon" aria-hidden="true"><title>Has notes</title><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>
          {/if}
        </p>
      {/if}
    </div>
    <div class="ml-card-rating">
      <RatingChart
        rating={item.rating}
        {expected}
        uncertain={Boolean(item.uncertain)}
      />
    </div>
  </div>
</div>

<style>
  .ml-card {
    position: relative;
    display: block;
    aspect-ratio: 2 / 3;
    width: 100%;
    overflow: hidden;
    background: oklch(0.2329 0.0095 285.64);
    box-shadow: 0 1px 0 oklch(1 0 0 / 0.04) inset;
    cursor: pointer;
    outline: none;
    transition:
      transform 280ms cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 280ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .ml-card:hover,
  .ml-card:focus-visible {
    transform: translateY(-4px);
    box-shadow: 0 20px 44px oklch(0 0 0 / 0.6);
  }

  .ml-card:focus-visible {
    outline: 2px solid oklch(0.72 0.12 250);
    outline-offset: 2px;
  }

  .ml-card-poster {
    position: absolute;
    inset: 0;
  }

  .ml-card-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .ml-card:hover .ml-card-img,
  .ml-card:focus-visible .ml-card-img {
    transform: scale(1.01);
  }

  /* ---------- Hover-revealed meta panel ---------- */
  .ml-card-meta {
    position: absolute;
    inset: auto 0 0 0;
    display: flex;
    align-items: flex-end;
    gap: 10px;
    padding: 44px 14px 14px;
    background: linear-gradient(
      to top,
      oklch(0.1091 0.0043 285.93 / 0.96) 0%,
      oklch(0.1091 0.0043 285.93 / 0.82) 45%,
      oklch(0.1091 0.0043 285.93 / 0) 100%
    );
    opacity: 0;
    transform: translateY(10px);
    transition:
      opacity 220ms ease,
      transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
  }

  .ml-card:hover .ml-card-meta,
  .ml-card:focus-visible .ml-card-meta,
  .ml-card:focus-within .ml-card-meta {
    opacity: 1;
    transform: translateY(0);
  }

  .ml-card-info {
    flex: 1;
    min-width: 0;
  }

  .ml-card-title {
    margin: 0;
    font-family: "PT Sans Narrow", system-ui, sans-serif;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.005em;
    line-height: 1.2;
    color: oklch(0.9707 0.0027 286.35);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .ml-card-sub {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 5px;
  }

  .ml-card-author {
    margin-top: 5px;
    font-size: 12px;
    font-weight: 500;
    color: oklch(0.8 0.03 256);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ml-card-tagline {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 4px 0 0;
    font-size: 11.5px;
    line-height: 1.35;
    color: oklch(0.6891 0.013 286.05);
  }

  .ml-card-tagline-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-style: italic;
  }

  .ml-card-notes-icon {
    flex-shrink: 0;
    opacity: 0.7;
  }

  .ml-card-rating {
    flex-shrink: 0;
    align-self: flex-end;
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

  .ml-hidden-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 3px;
    color: oklch(0.82 0.14 85);
    background: oklch(0.1091 0.0043 285.93 / 0.75);
    border: 1px solid oklch(0.82 0.14 85 / 0.25);
    backdrop-filter: blur(4px);
  }

  @media (hover: none) {
    /* Touch devices have no hover: always show the meta panel. */
    .ml-card-meta {
      opacity: 1;
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ml-card,
    .ml-card-img,
    .ml-card-meta {
      transition: none;
    }

    .ml-card:hover,
    .ml-card:focus-visible {
      transform: none;
    }

    .ml-card:hover .ml-card-img,
    .ml-card:focus-visible .ml-card-img {
      transform: none;
    }
  }
</style>
