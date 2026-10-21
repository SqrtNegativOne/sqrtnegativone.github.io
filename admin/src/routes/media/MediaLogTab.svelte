<script lang="ts">
  import { onMount } from 'svelte';
  import { invalidateAll } from '$app/navigation';
  import { assetState } from '$lib/assetState.svelte';
  import MediaCalendar from '../../../../shared/components/MediaCalendar.svelte';
  import { shiftMonth, todayStamp } from '../../../../shared/lib/mediaLog';
  import type { MediaItem } from '../../../../shared/types';
  import { mediaLogState } from './mediaLogState.svelte';
  import LogEntryModal from './components/LogEntryModal.svelte';

  interface Props {
    media?: MediaItem[];
    onOpenItem?: (item: MediaItem) => void;
    /** Preselect an item when arriving from the EditModal's "Log an entry" link. */
    initialMediaId?: string | null;
    onInitialConsumed?: () => void;
  }

  let { media = [], onOpenItem, initialMediaId = null, onInitialConsumed }: Props = $props();

  const initialNow = new Date();
  const today = todayStamp(initialNow);
  let viewYear = $state(initialNow.getFullYear());
  let viewMonth = $state(initialNow.getMonth());
  let selectedDay = $state<string | null>(today);

  let logOpen = $state(false);
  let logDate = $state(today);
  let logMediaId = $state<string | null>(null);
  let lastInitial = $state<string | null>(null);

  const itemById = $derived(new Map(media.map((item) => [item.id, item])));
  const calendarEvents = $derived(
    mediaLogState.events.filter((event) => itemById.has(event.media_id))
  );

  $effect(() => {
    if (!initialMediaId) {
      lastInitial = null;
      return;
    }
    if (initialMediaId === lastInitial) return;
    const item = media.find((entry) => entry.id === initialMediaId);
    if (!item) return;
    lastInitial = initialMediaId;
    openForMedia(item);
    onInitialConsumed?.();
  });

  function stepMonth(delta: number) {
    const next = shiftMonth(viewYear, viewMonth, delta);
    viewYear = next.year;
    viewMonth = next.month;
  }

  function goToMonth(day: string) {
    viewYear = Number(day.slice(0, 4));
    viewMonth = Number(day.slice(5, 7)) - 1;
  }

  function jumpToToday() {
    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
    selectedDay = todayStamp(now);
  }

  /** A cell opens the capture modal for that date. */
  function openForDay(day: string) {
    selectedDay = day;
    logDate = day;
    logMediaId = null;
    logOpen = true;
  }

  /** A poster opens the media editor instead. */
  function openForPoster(item: MediaItem) {
    onOpenItem?.(item);
  }

  function openForMedia(item: MediaItem) {
    logDate = selectedDay ?? today;
    logMediaId = item.id;
    logOpen = true;
  }

  function handleSaved(day: string) {
    selectedDay = day;
    goToMonth(day);
    void invalidateAll();
  }

  /** Ctrl+N: a log entry for today, from anywhere on the tab. */
  function handleKeydown(e: KeyboardEvent) {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    if (e.key !== 'n' && e.key !== 'N') return;
    if (logOpen || document.querySelector('[aria-modal="true"]')) return;
    e.preventDefault();
    logDate = today;
    logMediaId = null;
    logOpen = true;
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="card p-5">
  <MediaCalendar
    year={viewYear}
    month={viewMonth}
    events={calendarEvents}
    {media}
    today={today}
    {selectedDay}
    maxDay={today}
    resolveAsset={(url: string) => assetState.resolve(url)}
    onprev={() => stepMonth(-1)}
    onnext={() => stepMonth(1)}
    ontoday={jumpToToday}
    onselectday={openForDay}
    onselectmedia={(_day, item) => openForPoster(item)}
  />
</div>

<LogEntryModal
  bind:open={logOpen}
  {media}
  date={logDate}
  initialMediaId={logMediaId}
  onsaved={handleSaved}
/>
