<script lang="ts">
  import {
    formatCheckpoint,
    formatLogDate,
    groupEventsByMonth,
    LOG_KIND_LABEL
  } from '$shared/lib/mediaLog';
  import type { MediaItem, MediaLogEvent } from '$shared/types';
  import { getPosterUrl } from '$lib/utils';

  interface Props {
    events?: MediaLogEvent[];
    media?: MediaItem[];
    openDetails?: (item: MediaItem) => void;
  }

  let { events = [], media = [], openDetails }: Props = $props();

  const itemById = $derived(new Map(media.map((item) => [item.id, item])));

  const visibleEvents = $derived(
    events.filter(
      (event) =>
        event.visibility === 'public' &&
        event.kind !== 'add' &&
        itemById.has(event.media_id)
    )
  );

  const groups = $derived(groupEventsByMonth(visibleEvents));
</script>

<section class="ml-log" aria-label="Media log">
  {#if groups.length === 0}
    <p class="ml-log-empty">Nothing public yet. Entries marked private in the admin stay off this page.</p>
  {:else}
    {#each groups as group (group.key)}
      <div class="ml-log-month">
        <h2 class="ml-log-month-title">{group.label}</h2>
        <div class="ml-log-list">
          {#each group.events as event (event.id)}
            {@const item = itemById.get(event.media_id)}
            {#if item}
              <button type="button" class="ml-log-row" onclick={() => openDetails?.(item)}>
                <span class="ml-log-poster">
                  {#if item.poster_image}
                    <img src={getPosterUrl(item.poster_image)} alt="" loading="lazy" />
                  {:else}
                    <span class="ml-log-poster-fallback">{item.type}</span>
                  {/if}
                </span>

                <span class="ml-log-body">
                  <span class="ml-log-verb">
                    {LOG_KIND_LABEL[event.kind]}{event.kind === 'checkpoint' ? ` · ${formatCheckpoint(event)}` : ''}
                    {#if (event.round ?? 1) > 1} · Round {event.round}{/if}
                  </span>
                  <span class="ml-log-title">{item.title}</span>
                  {#if event.note}
                    <span class="ml-log-note">{event.note}</span>
                  {/if}
                </span>

                <span class="ml-log-date">{formatLogDate(event.at)}</span>
              </button>
            {/if}
          {/each}
        </div>
      </div>
    {/each}
  {/if}
</section>

<style>
  .ml-log {
    margin-top: 8px;
  }

  .ml-log-month {
    margin-bottom: 48px;
  }

  .ml-log-month-title {
    font-family: 'Instrument Serif', 'Iowan Old Style', Georgia, serif;
    font-size: clamp(28px, 3vw, 36px);
    font-weight: 400;
    letter-spacing: -0.01em;
    margin: 0 0 8px;
    color: oklch(0.9707 0.0027 286.35);
  }

  .ml-log-list {
    border-top: 1px solid oklch(1 0 0 / 0.08);
  }

  .ml-log-row {
    display: flex;
    align-items: center;
    gap: 18px;
    width: 100%;
    padding: 14px 4px;
    background: transparent;
    border: 0;
    border-bottom: 1px solid oklch(1 0 0 / 0.08);
    color: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .ml-log-row:hover {
    background: oklch(1 0 0 / 0.035);
  }

  .ml-log-poster {
    width: 44px;
    aspect-ratio: 2 / 3;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: 4px;
    background: oklch(0.2329 0.0095 285.64);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ml-log-poster img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .ml-log-poster-fallback {
    font-size: 8px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: oklch(0.5416 0.0154 285.87);
  }

  .ml-log-body {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
    flex: 1;
  }

  .ml-log-verb {
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: oklch(0.5416 0.0154 285.87);
  }

  .ml-log-title {
    font-size: 17px;
    line-height: 1.3;
    color: oklch(0.9707 0.0027 286.35);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ml-log-note {
    font-size: 13px;
    line-height: 1.5;
    color: oklch(0.6363 0.0133 286.02);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .ml-log-date {
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: oklch(0.5416 0.0154 285.87);
    flex-shrink: 0;
  }

  .ml-log-empty {
    color: oklch(0.6363 0.0133 286.02);
    text-align: center;
    padding: 64px 0;
    font-style: italic;
    border-top: 1px solid oklch(1 0 0 / 0.08);
  }

  @media (max-width: 640px) {
    .ml-log-row {
      gap: 12px;
    }

    .ml-log-date {
      display: none;
    }

    .ml-log-title {
      white-space: normal;
    }
  }
</style>
