<script lang="ts">
  import { icons } from '../../src/lib/icons';
  let { status } = $props<{ status: string }>();

  let color = $derived.by(() => {
    switch(status) {
      case 'finished': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'dropped': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'shelved': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'wishlist': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'rewishlist': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'next up': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'consuming': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'waiting for': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  });

  let icon = $derived(icons[`status-${status.replace(' ', '-')}`]);
</script>

<span class="group/status inline-flex items-center h-5.5 rounded-full text-xs font-medium border capitalize cursor-default px-1.5 transition-all {color}">
  {#if icon}
    <span class="w-3.5 h-3.5 inline-flex shrink-0 [&>svg]:w-full [&>svg]:h-full">{@html icon}</span>
  {/if}
  <span class="max-w-0 overflow-hidden whitespace-nowrap transition-[max-width,margin] duration-300 ease-in-out group-hover/status:max-w-[100px] {icon ? 'group-hover/status:ml-1.5' : ''}">{status}</span>
</span>
