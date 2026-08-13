<script lang="ts">
  let { rating }: { rating: number } = $props();
  let percent = $derived((rating / 7) * 100);
  let colorClass = $derived(
    rating >= 7 ? 'text-[oklch(0.860_0.150_151.90)]' :
    rating >= 6.5 ? 'text-[oklch(0.830_0.155_143.11)]' :
    rating >= 6 ? 'text-[oklch(0.800_0.151_129.59)]' :
    rating >= 5.5 ? 'text-[oklch(0.770_0.138_124.73)]' :
    rating >= 5 ? 'text-[oklch(0.740_0.127_119.15)]' :
    rating >= 4.5 ? 'text-[oklch(0.710_0.115_106.32)]' :
    rating >= 4 ? 'text-[oklch(0.680_0.110_90.66)]' :
    rating >= 3.5 ? 'text-[oklch(0.650_0.117_75.82)]' :
    rating >= 3 ? 'text-[oklch(0.620_0.131_63.37)]' :
    rating >= 2.5 ? 'text-[oklch(0.590_0.150_48.38)]' :
    rating >= 2 ? 'text-[oklch(0.560_0.176_37.70)]' :
    rating >= 1.5 ? 'text-[oklch(0.530_0.192_32.18)]' :
    'text-[oklch(0.500_0.204_28.59)]'
  );
  let bgClass = $derived(
    rating >= 7 ? 'text-[oklch(0.860_0.150_151.90)]/20' :
    rating >= 6.5 ? 'text-[oklch(0.830_0.155_143.11)]/20' :
    rating >= 6 ? 'text-[oklch(0.800_0.151_129.59)]/20' :
    rating >= 5.5 ? 'text-[oklch(0.770_0.138_124.73)]/20' :
    rating >= 5 ? 'text-[oklch(0.740_0.127_119.15)]/20' :
    rating >= 4.5 ? 'text-[oklch(0.710_0.115_106.32)]/20' :
    rating >= 4 ? 'text-[oklch(0.680_0.110_90.66)]/20' :
    rating >= 3.5 ? 'text-[oklch(0.650_0.117_75.82)]/20' :
    rating >= 3 ? 'text-[oklch(0.620_0.131_63.37)]/20' :
    rating >= 2.5 ? 'text-[oklch(0.590_0.150_48.38)]/20' :
    rating >= 2 ? 'text-[oklch(0.560_0.176_37.70)]/20' :
    rating >= 1.5 ? 'text-[oklch(0.530_0.192_32.18)]/20' :
    'text-[oklch(0.500_0.204_28.59)]/20'
  );
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
