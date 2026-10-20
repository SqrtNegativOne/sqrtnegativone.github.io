<script lang="ts">
  import { TYPE_LABEL } from "$shared/components/constants";
  import RatingChart from "$shared/components/RatingChart.svelte";

  import StatusBadge from "$shared/components/StatusBadge.svelte";
  import TypeBadge from "$shared/components/TypeBadge.svelte";
  import { fade, scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { getPosterUrl } from "$lib/utils";
  import { deriveMediaHistory, formatCheckpoint, formatLogDate, LOG_KIND_LABEL } from "$shared/lib/mediaLog";
  import type { MediaItem, MediaLogEvent } from "$shared/types";
  import logData from "../../../data/media-log.json";

  let { item, closeDetails, openFullPoster } = $props<{ item: MediaItem; closeDetails: () => void; openFullPoster?: (url: string) => void }>();

  // The projection only contains public events, but filter again so a private
  // entry can never surface through the modal.
  const itemLog = $derived(
    (logData as unknown as MediaLogEvent[])
      .filter((event) => event.visibility === 'public' && event.media_id === item.id)
      .sort((a, b) => a.at.localeCompare(b.at))
  );

  const history = $derived(deriveMediaHistory(itemLog));
  // `add` is shelf bookkeeping, not a diary entry worth repeating in the list,
  // but its date is the item's "Added" date.
  const addedAt = $derived(itemLog.find((event) => event.kind === 'add')?.at ?? null);
  const diary = $derived(itemLog.filter((event) => event.kind !== 'add'));
</script>



<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="ml-modal-backdrop" onclick={closeDetails} transition:fade={{ duration: 200 }}>
  <div class="ml-modal-content" onclick={(e) => e.stopPropagation()} transition:scale={{ start: 0.95, duration: 300, easing: cubicOut }}>
    <button class="ml-modal-close" onclick={closeDetails} aria-label="Close details">
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
    <div class="ml-modal-grid">
      <div class="ml-modal-poster-sticky">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="ml-modal-poster {openFullPoster && item.poster_image ? 'is-interactive' : ''}" onclick={(e) => { if(openFullPoster) { e.stopPropagation(); openFullPoster(getPosterUrl(item.poster_image as string)); } }} style={openFullPoster && item.poster_image ? 'cursor: pointer;' : ''}>
          {#if item.poster_image}
            <img src={getPosterUrl(item.poster_image as string)} alt="" />
          {:else}
            <div class="ml-poster-fallback"><span>{TYPE_LABEL[item.type] || item.type}</span></div>
          {/if}
        </div>
      </div>
      <div class="ml-modal-info">
        <h2 class="ml-modal-title">
          {item.title}
        </h2>
        {#if item.author || item.publisher}
          <div class="ml-modal-author-pub text-[oklch(0.8_0.03_256)] font-medium mt-2">
            {[item.author, item.publisher].filter(Boolean).join(' • ')}
          </div>
        {/if}
        {#if item.tagline}
          <p class="ml-modal-tagline">{item.tagline}</p>
        {/if}
        <div class="ml-modal-meta">
          <div class="flex items-center gap-2">
            <TypeBadge type={item.type} variant="icon" sizeClass="w-[18px] h-[18px]" />
            <StatusBadge status={item.status} />
          </div>
          <RatingChart
            rating={item.rating}
            expected={['wishlist', 'next up', 'waiting for'].includes(item.status as string)}
            uncertain={Boolean(item.uncertain)}
          />
        </div>
        {#if addedAt || history.startedAt || history.finishedAt || history.lastCheckpoint}
          <div class="ml-modal-dates">
            {#if addedAt}
              <span>Added <span class="ml-date-value">{formatLogDate(addedAt)}</span></span>
            {/if}
            {#if history.startedAt}
              <span>Started <span class="ml-date-value">{formatLogDate(history.startedAt)}</span></span>
            {/if}
            {#if history.finishedAt}
              <span>Finished <span class="ml-date-value">{formatLogDate(history.finishedAt)}</span></span>
            {/if}
            {#if history.lastCheckpoint && !history.finishedAt}
              <span>{formatCheckpoint(history.lastCheckpoint)} <span class="ml-date-value">as of {formatLogDate(history.lastCheckpoint.at)}</span></span>
            {/if}
          </div>
        {/if}
        {#if diary.length > 0}
          <div class="ml-modal-log">
            {#each diary.slice(-5).reverse() as event (event.id)}
              <div class="ml-modal-log-row">
                <span class="ml-modal-log-date">{formatLogDate(event.at)}</span>
                <span>
                  {LOG_KIND_LABEL[event.kind]}{event.kind === 'checkpoint' ? ` · ${formatCheckpoint(event)}` : ''}
                  {#if (event.round ?? 1) > 1} · Round {event.round}{/if}
                  {#if event.note}<span class="ml-modal-log-note"> — {event.note}</span>{/if}
                </span>
              </div>
            {/each}
          </div>
        {/if}
        {#if item.description}
          <div class="ml-modal-description">
            {item.description}
          </div>
        {/if}
        {#if item.notes}
          <div class="ml-modal-desc">
            {item.notes}
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
    max-width: 800px;
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
    grid-template-columns: minmax(220px, 38%) 1fr;
    align-items: start;
    gap: 32px;
  }

  /* Keep the poster pinned to the vertical centre of the visible modal while
     the description/notes column scrolls beside it. */
  .ml-modal-poster-sticky {
    position: sticky;
    top: 50%;
    transform: translateY(-50%);
    align-self: start;
  }

  .ml-modal-poster {
    overflow: hidden;
    background: oklch(0.2329 0.0095 285.64);
    width: 100%;
    border-radius: 8px;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .ml-modal-poster.is-interactive:hover {
    transform: scale(1.03);
    box-shadow: 0 12px 32px oklch(0 0 0 / 0.5);
  }

  .ml-modal-poster img {
    width: 100%;
    height: auto;
    display: block;
  }

  .ml-poster-fallback {
    width: 100%;
    aspect-ratio: 2/3;
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

  .ml-modal-tagline {
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

  .ml-modal-description {
    color: oklch(0.5416 0.0154 285.87);
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    margin-bottom: 16px;
    font-style: italic;
  }

  .ml-modal-desc {
    color: oklch(0.8622 0.0068 286.26);
    font-size: 15px;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .ml-modal-dates {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 20px;
    margin: 0 0 20px;
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: oklch(0.5416 0.0154 285.87);
  }

  .ml-date-value {
    color: oklch(0.8622 0.0068 286.26);
    letter-spacing: 0.04em;
  }

  .ml-modal-log {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0 0 20px;
    padding-top: 14px;
    border-top: 1px solid oklch(1 0 0 / 0.08);
    font-size: 13px;
    line-height: 1.45;
    color: oklch(0.8622 0.0068 286.26);
  }

  .ml-modal-log-row {
    display: flex;
    align-items: baseline;
    gap: 14px;
  }

  .ml-modal-log-date {
    min-width: 82px;
    flex-shrink: 0;
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: oklch(0.5416 0.0154 285.87);
  }

  .ml-modal-log-note {
    color: oklch(0.6363 0.0133 286.02);
    font-style: italic;
  }






  @media (max-width: 640px) {
    .ml-modal-grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .ml-modal-poster-sticky {
      position: static;
      transform: none;
    }

    .ml-modal-poster {
      width: 140px;
    }
  }
</style>
