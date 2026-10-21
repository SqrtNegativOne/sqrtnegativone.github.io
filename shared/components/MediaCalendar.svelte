<script lang="ts">
  import { buildCalendarMonth, eventLabel, formatDayLong, WEEKDAY_LABELS } from '../lib/mediaLog';
  import type { CalendarDay, CalendarMediaEntry } from '../lib/mediaLog';
  import type { MediaItem, MediaLogEvent } from '../types';
  import { getPosterUrl } from '../utils/getPosterUrl';

  interface Props {
    year: number;
    /** Zero-based, like `Date#getMonth`. */
    month: number;
    events?: MediaLogEvent[];
    media?: MediaItem[];
    /** `YYYY-MM-DD`; pass in so prerendered and hydrated copies agree. */
    today?: string;
    selectedDay?: string | null;
    /** Latest day that may be picked or navigated to (normally today). */
    maxDay?: string;
    resolveAsset?: (url: string) => string;
    onprev: () => void;
    onnext: () => void;
    ontoday?: () => void;
    onselectday?: (day: string) => void;
    onselectmedia?: (day: string, item: MediaItem) => void;
    maxPosters?: number;
  }

  let {
    year,
    month,
    events = [],
    media = [],
    today = '',
    selectedDay = null,
    maxDay = '',
    resolveAsset = (url: string) => url,
    onprev,
    onnext,
    ontoday,
    onselectday,
    onselectmedia,
    maxPosters = 3
  }: Props = $props();

  const itemById = $derived(new Map(media.map((item) => [item.id, item])));
  const calendar = $derived(buildCalendarMonth(year, month, events, today));

  const viewKey = $derived(`${year}-${String(month + 1).padStart(2, '0')}`);
  const maxMonth = $derived(maxDay.slice(0, 7));
  const canNext = $derived(!maxMonth || viewKey < maxMonth);

  function dayEnabled(day: CalendarDay): boolean {
    return !maxDay || day.key <= maxDay;
  }

  function dayItems(day: CalendarDay): { entry: CalendarMediaEntry; item: MediaItem }[] {
    return day.media.flatMap((entry) => {
      const item = itemById.get(entry.mediaId);
      return item ? [{ entry, item }] : [];
    });
  }

  function posterFor(item: MediaItem): string {
    return item.poster_image ? resolveAsset(getPosterUrl(item.poster_image)) : '';
  }

  function entryTitle(entry: CalendarMediaEntry, item: MediaItem): string {
    return `${item.title} — ${eventLabel(entry.latest)}`;
  }

  function chooseDay(day: CalendarDay) {
    onselectday?.(day.key);
  }

  function choosePoster(day: CalendarDay, item: MediaItem) {
    if (onselectmedia) onselectmedia(day.key, item);
    else if (onselectday) onselectday(day.key);
  }
</script>

<section class="cal" aria-label="Media calendar">
  <header class="cal-head">
    <h2 class="cal-month">{calendar.label}</h2>
    <div class="cal-nav">
      {#if ontoday}
        <button type="button" class="cal-btn" onclick={() => ontoday?.()}>Today</button>
      {/if}
      <button type="button" class="cal-btn cal-arrow" onclick={() => onprev()} aria-label="Previous month">
        &larr;
      </button>
      <button
        type="button"
        class="cal-btn cal-arrow"
        onclick={() => onnext()}
        aria-label="Next month"
        disabled={!canNext}
      >
        &rarr;
      </button>
    </div>
  </header>

  <div class="cal-scroll">
    <div class="cal-inner">
      <div class="cal-weekdays" aria-hidden="true">
        {#each WEEKDAY_LABELS as label (label)}
          <span>{label}</span>
        {/each}
      </div>

      <div class="cal-grid">
        {#each calendar.weeks as week, weekIndex (weekIndex)}
          {#each week as day (day.key)}
            {@const entries = dayItems(day)}
            {@const shown = entries.slice(0, maxPosters)}
            {@const overflow = entries.length - shown.length}
            {@const enabled = dayEnabled(day)}
            {@const clickable = Boolean(onselectday) && enabled}
            <div
              class="cal-cell"
              class:is-outside={!day.inMonth}
              class:is-today={day.isToday}
              class:is-selected={selectedDay === day.key}
              class:has-entries={entries.length > 0}
              class:is-disabled={!enabled}
            >
              {#if clickable}
                <button
                  type="button"
                  class="cal-hit"
                  onclick={() => chooseDay(day)}
                  aria-pressed={selectedDay === day.key}
                  aria-label={`Log for ${formatDayLong(day.key)}`}
                ></button>
              {/if}

              <span class="cal-day" aria-hidden={clickable ? 'true' : undefined}>{day.day}</span>

              {#if day.isToday}
                <span class="cal-today" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              {/if}

              {#if entries.length > 0}
                <div class="cal-posters">
                  {#each shown as { entry, item } (entry.mediaId)}
                    {#if onselectmedia || onselectday}
                      <button
                        type="button"
                        class="cal-poster"
                        onclick={() => choosePoster(day, item)}
                        title={entryTitle(entry, item)}
                        aria-label={entryTitle(entry, item)}
                      >
                        {#if item.poster_image}
                          <img src={posterFor(item)} alt="" loading="lazy" />
                        {:else}
                          <span class="cal-poster-fallback">{item.title.slice(0, 2)}</span>
                        {/if}
                      </button>
                    {:else}
                      <span class="cal-poster" title={entryTitle(entry, item)}>
                        {#if item.poster_image}
                          <img src={posterFor(item)} alt="" loading="lazy" />
                        {:else}
                          <span class="cal-poster-fallback">{item.title.slice(0, 2)}</span>
                        {/if}
                      </span>
                    {/if}
                  {/each}
                  {#if overflow > 0}
                    <span class="cal-more">+{overflow}</span>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .cal {
    display: flex;
    flex-direction: column;
    gap: 10px;
    color: oklch(0.9707 0.0027 286.35);
  }

  .cal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .cal-month {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.01em;
    color: inherit;
  }

  .cal-nav {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .cal-btn {
    appearance: none;
    background: oklch(1 0 0 / 0.03);
    border: 1px solid oklch(1 0 0 / 0.09);
    border-radius: 5px;
    color: oklch(0.8622 0.0068 286.26);
    cursor: pointer;
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 5px 9px;
    line-height: 1;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }

  .cal-btn:not(:disabled):hover {
    background: oklch(1 0 0 / 0.07);
    border-color: oklch(1 0 0 / 0.18);
    color: oklch(0.9707 0.0027 286.35);
  }

  .cal-btn:disabled {
    opacity: 0.28;
    cursor: default;
  }

  .cal-btn:focus-visible {
    outline: 2px solid oklch(0.7107 0.0351 256.79);
    outline-offset: 1px;
  }

  .cal-arrow {
    font-family: inherit;
    font-size: 13px;
    letter-spacing: 0;
    padding: 3px 9px;
  }

  .cal-scroll {
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .cal-inner {
    min-width: 540px;
  }

  .cal-weekdays {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0;
    margin-bottom: 5px;
  }

  .cal-weekdays span {
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: oklch(0.5416 0.0154 285.87);
    padding-left: 4px;
  }

  /* Cells touch: each one draws its own right/bottom hairline, so the grid
     collapses into a single table instead of separate boxes. */
  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0;
    border-top: 1px solid oklch(1 0 0 / 0.09);
    border-left: 1px solid oklch(1 0 0 / 0.09);
  }

  .cal-cell {
    position: relative;
    min-height: 84px;
    border: 0;
    border-radius: 0;
    background: oklch(1 0 0 / 0.015);
    box-shadow: 1px 0 0 oklch(1 0 0 / 0.09), 0 1px 0 oklch(1 0 0 / 0.09);
    overflow: hidden;
  }

  .cal-cell.is-outside {
    opacity: 0.35;
  }

  .cal-cell.is-selected {
    outline: 1px solid oklch(0.7107 0.0351 256.79 / 0.85);
    outline-offset: -1px;
    background: oklch(0.7107 0.0351 256.79 / 0.1);
  }

  .cal-cell.is-disabled .cal-day {
    color: oklch(0.5416 0.0154 285.87 / 0.45);
  }

  .cal-hit {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: 0;
    background: transparent;
    cursor: pointer;
    padding: 0;
    transition: background 0.15s ease;
  }

  .cal-hit:hover {
    background: oklch(1 0 0 / 0.04);
  }

  .cal-hit:focus-visible {
    outline: 2px solid oklch(0.7107 0.0351 256.79);
    outline-offset: -2px;
  }

  /* Pinned to the corner rather than relying on the button's own centring. */
  .cal-day {
    position: absolute;
    top: 5px;
    left: 7px;
    z-index: 1;
    pointer-events: none;
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
    line-height: 1;
    color: oklch(0.6363 0.0133 286.02);
  }

  /* Four gold ticks instead of an outline, so "today" never reads as "selected". */
  .cal-today {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  .cal-today span {
    position: absolute;
    width: 8px;
    height: 8px;
    border: 0 solid oklch(0.83 0.13 84);
  }

  .cal-today span:nth-child(1) {
    top: 2px;
    left: 2px;
    border-top-width: 1px;
    border-left-width: 1px;
  }

  .cal-today span:nth-child(2) {
    top: 2px;
    right: 2px;
    border-top-width: 1px;
    border-right-width: 1px;
  }

  .cal-today span:nth-child(3) {
    bottom: 2px;
    left: 2px;
    border-bottom-width: 1px;
    border-left-width: 1px;
  }

  .cal-today span:nth-child(4) {
    bottom: 2px;
    right: 2px;
    border-bottom-width: 1px;
    border-right-width: 1px;
  }

  /* The posters sit above the full-cell hit area; gaps fall through to it. */
  .cal-posters {
    position: absolute;
    left: 5px;
    right: 5px;
    bottom: 5px;
    z-index: 1;
    display: flex;
    align-items: flex-end;
    gap: 3px;
    pointer-events: none;
  }

  .cal-poster {
    pointer-events: auto;
    width: 25px;
    aspect-ratio: 2 / 3;
    flex-shrink: 0;
    overflow: hidden;
    border: 0;
    border-radius: 0;
    padding: 0;
    background: oklch(0.2329 0.0095 285.64);
    cursor: pointer;
    display: block;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .cal-poster:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px oklch(0 0 0 / 0.5);
  }

  .cal-poster:focus-visible {
    outline: 2px solid oklch(0.7107 0.0351 256.79);
    outline-offset: 1px;
  }

  .cal-poster img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .cal-poster-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 7px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: oklch(0.5416 0.0154 285.87);
  }

  .cal-more {
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 9px;
    letter-spacing: 0.06em;
    color: oklch(0.7107 0.0351 256.79);
    padding-bottom: 2px;
  }

  @media (max-width: 760px) {
    .cal-inner {
      min-width: 560px;
    }

    .cal-cell {
      min-height: 72px;
    }

    .cal-poster {
      width: 21px;
    }
  }
</style>
