<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import MediaCalendar from '$shared/components/MediaCalendar.svelte';
  import { shiftMonth, todayStamp } from '$shared/lib/mediaLog';
  import type { MediaItem, MediaLogEvent } from '$shared/types';

  interface Props {
    events?: MediaLogEvent[];
    media?: MediaItem[];
    openDetails?: (item: MediaItem) => void;
  }

  let { events = [], media = [], openDetails }: Props = $props();

  const itemById = $derived(new Map(media.map((item) => [item.id, item])));

  const visibleEvents = $derived(
    events.filter((event) => event.visibility === 'public' && itemById.has(event.media_id))
  );

  // Open on the most recent entry. Derived from the data (never the clock) so
  // the prerendered HTML and the hydrated page agree.
  const latestKey = untrack(() => {
    const known = new Set(media.map((item) => item.id));
    let latest = '';
    for (const event of events) {
      if (event.visibility !== 'public' || !known.has(event.media_id)) continue;
      const day = event.at.slice(0, 10);
      if (day > latest) latest = day;
    }
    return latest;
  });

  let viewYear = $state(latestKey ? Number(latestKey.slice(0, 4)) : 0);
  let viewMonth = $state(latestKey ? Number(latestKey.slice(5, 7)) - 1 : 0);
  // Filled in after mount so the build date never decides what "today" is.
  let todayKey = $state('');

  onMount(() => {
    todayKey = todayStamp();
  });

  function stepMonth(delta: number) {
    const next = shiftMonth(viewYear, viewMonth, delta);
    viewYear = next.year;
    viewMonth = next.month;
  }

  function goToday() {
    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
  }
</script>

<section class="ml-log" aria-label="Media log">
  {#if visibleEvents.length === 0}
    <p class="ml-log-empty">Nothing public yet.</p>
  {:else}
    <MediaCalendar
      year={viewYear}
      month={viewMonth}
      events={visibleEvents}
      {media}
      today={todayKey}
      maxDay={todayKey || latestKey}
      onprev={() => stepMonth(-1)}
      onnext={() => stepMonth(1)}
      ontoday={goToday}
      onselectmedia={(_day, item) => openDetails?.(item)}
    />
  {/if}
</section>

<style>
  .ml-log {
    margin-top: 8px;
  }

  .ml-log-empty {
    color: oklch(0.6363 0.0133 286.02);
    text-align: center;
    padding: 64px 0;
    font-style: italic;
    border-top: 1px solid oklch(1 0 0 / 0.08);
  }
</style>
