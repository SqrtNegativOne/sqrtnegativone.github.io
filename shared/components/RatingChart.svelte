<script lang="ts">
  let { rating }: { rating: number } = $props();
  let percent = $derived((rating / 7) * 100);
  let colorClass = $derived(rating >= 6 ? 'text-emerald-400' : rating >= 4 ? 'text-blue-400' : rating >= 2 ? 'text-amber-400' : 'text-red-400');
  let bgClass = $derived(rating >= 6 ? 'text-emerald-500/20' : rating >= 4 ? 'text-blue-500/20' : rating >= 2 ? 'text-amber-500/20' : 'text-red-500/20');
</script>

<div class="flex items-center gap-2">
  <div class="relative w-[22px] h-[22px] flex items-center justify-center shrink-0">
    <svg class="w-full h-full" viewBox="0 0 36 36">
      <g transform="rotate(-90 18 18)">
        <path class="{bgClass}" stroke-width="4" stroke="currentColor" fill="none" stroke-linecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        <path class="{colorClass}" stroke-width="4" stroke-dasharray="{percent}, 100" stroke="currentColor" fill="none" stroke-linecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
      </g>
    </svg>
  </div>
  <span class="font-medium font-mono text-[15px] {colorClass}">{rating}</span>
</div>
