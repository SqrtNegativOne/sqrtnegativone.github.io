<script lang="ts">
  import { onMount } from 'svelte';
  import { assetState } from '$lib/assetState.svelte';
  import RatingChart from '../../../../shared/components/RatingChart.svelte';
  import TypeBadge from '../../../../shared/components/TypeBadge.svelte';
  import { getPosterUrl } from '../../../../shared/utils/getPosterUrl';
  import type { MediaItem } from '../../../../shared/types';

  interface Props {
    media?: MediaItem[];
  }

  let { media = [] }: Props = $props();

  const RATINGS = [0, 1, 2, 3, 4, 5, 6];

  const pool = $derived.by(() => {
    const groups = new Map<string, MediaItem[]>();
    for (const item of media) {
      if (typeof item.rating !== 'number' || !Number.isFinite(item.rating)) continue;
      const list = groups.get(item.type) ?? [];
      list.push(item);
      groups.set(item.type, list);
    }
    return [...groups.values()].filter((list) => list.length >= 2);
  });

  const totalPairs = $derived(
    pool.reduce((sum, list) => sum + (list.length * (list.length - 1)) / 2, 0)
  );

  const used = new Set<string>();

  let pair = $state<[MediaItem, MediaItem] | null>(null);
  let guesses = $state<[number | null, number | null]>([null, null]);
  let revealed = $state(false);
  let round = $state(0);
  let error = $state(0);

  function pickPair() {
    if (pool.length === 0) {
      pair = null;
      return;
    }
    if (used.size >= totalPairs) used.clear();

    let chosen: [MediaItem, MediaItem] | null = null;
    for (let attempt = 0; attempt < 200 && !chosen; attempt++) {
      const list = pool[Math.floor(Math.random() * pool.length)];
      const a = list[Math.floor(Math.random() * list.length)];
      const b = list[Math.floor(Math.random() * list.length)];
      if (a.id === b.id) continue;
      const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
      if (used.has(key)) continue;
      used.add(key);
      chosen = [a, b];
    }

    if (!chosen) {
      used.clear();
      pickPair();
      return;
    }

    pair = chosen;
    guesses = [null, null];
    revealed = false;
  }

  function start() {
    round = 1;
    error = 0;
    used.clear();
    pickPair();
  }

  function next() {
    round += 1;
    pickPair();
  }

  function setGuess(index: number, value: number) {
    if (revealed) return;
    const nextGuesses: [number | null, number | null] = [guesses[0], guesses[1]];
    nextGuesses[index] = value;
    guesses = nextGuesses;
  }

  function reveal() {
    if (revealed || !pair || guesses[0] === null || guesses[1] === null) return;
    error += Math.abs(guesses[0] - (pair[0].rating as number));
    error += Math.abs(guesses[1] - (pair[1].rating as number));
    revealed = true;
  }

  function delta(index: number): number {
    if (!pair || guesses[index] === null) return 0;
    return Math.abs((guesses[index] as number) - (pair[index].rating as number));
  }

  function deltaLabel(index: number): string {
    const value = delta(index);
    return value === 0 ? 'exact' : `off by ${value}`;
  }

  function deltaClass(index: number): string {
    const value = delta(index);
    return value === 0 ? 'text-emerald-400' : value === 1 ? 'text-amber-400' : 'text-rose-400';
  }

  function poster(item: MediaItem): string {
    return assetState.resolve(item.poster_image ? getPosterUrl(item.poster_image) : '');
  }

  onMount(() => {
    if (pool.length > 0) start();
  });
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between gap-3">
    <div class="text-xs font-mono uppercase tracking-wider text-[oklch(0.7107_0.0351_256.79)]">
      {#if pair}Round {round}{:else}Normalize{/if}
    </div>
    {#if round > 0}
      <div class="text-xs font-mono uppercase tracking-wider text-[oklch(0.7107_0.0351_256.79)]">
        error <span class="text-white">{error}</span>
      </div>
    {/if}
  </div>

  {#if pool.length === 0}
    <div class="card p-8 text-center text-[oklch(0.7107_0.0351_256.79)]">
      Needs at least two rated items of the same type.
    </div>
  {:else if pair}
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {#each pair as item, i (item.id)}
        <div class="card overflow-hidden">
          <div class="aspect-[2/3] bg-black/40 relative">
            {#if item.poster_image}
              <img
                src={poster(item)}
                alt=""
                class="absolute inset-0 w-full h-full object-cover"
              />
            {:else}
              <div class="absolute inset-0 flex items-center justify-center text-xs text-[oklch(0.7107_0.0351_256.79)]">
                No poster
              </div>
            {/if}
            <div class="absolute top-2 left-2">
              <TypeBadge type={item.type} />
            </div>
          </div>

          <div class="p-3 space-y-3">
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-sm text-white leading-snug">{item.title}</h3>
              {#if revealed}
                <span class="shrink-0 text-[10px] font-mono uppercase {deltaClass(i)}">
                  {deltaLabel(i)}
                </span>
              {/if}
            </div>

            <div class="flex items-center gap-1">
              {#each RATINGS as value}
                <button
                  type="button"
                  disabled={revealed}
                  onclick={() => setGuess(i, value)}
                  class="flex-1 h-8 rounded border font-mono text-xs transition-colors {guesses[i] === value
                    ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                    : 'border-[oklch(0.2739_0.0055_286.03)] text-[oklch(0.7107_0.0351_256.79)] hover:bg-white/5'} disabled:opacity-40"
                >
                  {value}
                </button>
              {/each}
            </div>

            {#if revealed}
              <div class="flex items-center gap-2 pt-2 border-t border-[oklch(0.2739_0.0055_286.03)]">
                <RatingChart rating={item.rating} />
                <span class="text-xs font-mono text-[oklch(0.7107_0.0351_256.79)]">
                  actual <span class="text-white">{item.rating}</span>
                </span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <div class="flex justify-end">
      {#if revealed}
        <button type="button" class="btn-primary" onclick={next}>Next</button>
      {:else}
        <button
          type="button"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={guesses[0] === null || guesses[1] === null}
          onclick={reveal}
        >
          Reveal
        </button>
      {/if}
    </div>
  {/if}
</div>
