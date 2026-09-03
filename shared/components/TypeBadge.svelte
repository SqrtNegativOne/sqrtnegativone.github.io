<script lang="ts">
  import { icons } from '../icons';
  
  let { type, variant = 'badge', sizeClass = 'w-[14px] h-[14px]' } = $props<{ type: string, variant?: 'badge' | 'icon', sizeClass?: string }>();

  let iconHex = $derived(
    type === 'movie' ? 'oklch(0.7137 0.1434 254.62)' :
    type === 'show' ? 'oklch(0.7217 0.1767 305.5)' :
    type === 'game' ? 'oklch(0.8003 0.1821 151.71)' :
    type === 'book' ? 'oklch(0.8606 0.1731 91.94)' :
    'oklch(0.7107 0.0351 256.79)'
  );

  let badgeClass = $derived(
    type === 'game' ? 'bg-[oklch(0.5611_0.2236_295.48/0.85)]' :
    type === 'movie' ? 'bg-[oklch(0.5814_0.2349_27.99/0.85)]' :
    type === 'show' ? 'bg-[oklch(0.5645_0.1497_247.37/0.85)]' :
    type === 'book' ? 'bg-[oklch(0.6521_0.1322_81.57/0.85)]' :
    'bg-black/65'
  );
</script>

{#if variant === 'badge'}
  <span class="inline-block text-[9px] tracking-[0.12em] uppercase px-[7px] py-[3px] rounded-[3px] font-mono text-[oklch(0.9707_0.0027_286.35)] backdrop-blur-[4px] {badgeClass}">
    {type}
  </span>
{:else}
  <span class="{sizeClass} shrink-0 opacity-80 inline-flex [&>svg]:w-full [&>svg]:h-full" style="color: {iconHex}">
    {@html icons[`type-${type}`] || icons['type-default']}
  </span>
{/if}
