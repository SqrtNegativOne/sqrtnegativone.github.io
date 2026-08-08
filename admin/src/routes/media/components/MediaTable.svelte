<script lang="ts">
  import { icons } from '../../../../../src/lib/icons';
  let { filteredMedia, openEdit } = $props();
</script>

{#snippet typeBadge(type: string)}
  {#if type === 'book'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 capitalize">
      <span class="w-3.5 h-3.5 mr-1 inline-flex [&>svg]:w-full [&>svg]:h-full">{@html icons['type-book']}</span>
      {type}
    </span>
  {:else if type === 'movie'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20 capitalize">
      <span class="w-3.5 h-3.5 mr-1 inline-flex [&>svg]:w-full [&>svg]:h-full">{@html icons['type-movie']}</span>
      {type}
    </span>
  {:else if type === 'show'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 capitalize">
      <span class="w-3.5 h-3.5 mr-1 inline-flex [&>svg]:w-full [&>svg]:h-full">{@html icons['type-show']}</span>
      {type}
    </span>
  {:else if type === 'game'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
      <span class="w-3.5 h-3.5 mr-1 inline-flex [&>svg]:w-full [&>svg]:h-full">{@html icons['type-game']}</span>
      {type}
    </span>
  {:else}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20 capitalize">
      {type}
    </span>
  {/if}
{/snippet}

{#snippet statusBadge(status: string)}
  {#if status === 'finished'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
      <span class="w-3.5 h-3.5 mr-1 inline-flex [&>svg]:w-full [&>svg]:h-full">{@html icons['status-finished']}</span>
      {status}
    </span>
  {:else if status === 'dropped'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 capitalize">
      <span class="w-3.5 h-3.5 mr-1 inline-flex [&>svg]:w-full [&>svg]:h-full">{@html icons['status-dropped']}</span>
      {status}
    </span>
  {:else if status === 'shelved'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20 capitalize">
      <span class="w-3.5 h-3.5 mr-1 inline-flex [&>svg]:w-full [&>svg]:h-full">{@html icons['status-shelved']}</span>
      {status}
    </span>
  {:else if status === 'wishlist'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
      <span class="w-3.5 h-3.5 mr-1 inline-flex [&>svg]:w-full [&>svg]:h-full">{@html icons['status-wishlist']}</span>
      {status}
    </span>
  {:else if status === 'rewishlist'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 capitalize">
      <span class="w-3.5 h-3.5 mr-1 inline-flex [&>svg]:w-full [&>svg]:h-full">{@html icons['status-rewishlist']}</span>
      {status}
    </span>
  {:else if status === 'next up'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 capitalize">
      <span class="w-3.5 h-3.5 mr-1 inline-flex [&>svg]:w-full [&>svg]:h-full">{@html icons['status-next-up']}</span>
      {status}
    </span>
  {:else if status === 'consuming'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 capitalize">
      <span class="w-3.5 h-3.5 mr-1 inline-flex [&>svg]:w-full [&>svg]:h-full">{@html icons['status-consuming']}</span>
      {status}
    </span>
  {:else}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20 capitalize">
      {status}
    </span>
  {/if}
{/snippet}

{#snippet ratingDisplay(rating: number)}
  {@const percent = (rating / 7) * 100}
  {@const colorClass = rating >= 6 ? 'text-emerald-400' : rating >= 4 ? 'text-blue-400' : rating >= 2 ? 'text-amber-400' : 'text-red-400'}
  {@const bgClass = rating >= 6 ? 'text-emerald-500/20' : rating >= 4 ? 'text-blue-500/20' : rating >= 2 ? 'text-amber-500/20' : 'text-red-500/20'}
  
  <div class="flex items-center gap-2">
    <div class="relative w-5 h-5 flex items-center justify-center shrink-0">
      <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path class="{bgClass}" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        <path class="{colorClass}" stroke-width="3" stroke-dasharray="{percent}, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
      </svg>
    </div>
    <span class="font-medium {colorClass}">{rating}</span>
  </div>
{/snippet}

<div class="card overflow-x-auto">
  <table class="w-full text-left border-collapse">
    <thead>
      <tr class="bg-[#0f172a] border-b border-[#334155] text-[#94a3b8] text-sm uppercase tracking-wider">
        <th class="p-4 font-medium w-16">Poster</th>
        <th class="p-4 font-medium">Title</th>
        <th class="p-4 font-medium w-24">Type</th>
        <th class="p-4 font-medium w-32">Status</th>
        <th class="p-4 font-medium w-24">Rating</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-[#334155]">
      {#each filteredMedia as item}
        <tr 
          class="hover:bg-[#1e293b]/70 cursor-pointer transition-colors group"
          onclick={() => openEdit(item)}
          onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && openEdit(item)}
          tabindex="0"
        >
          <td class="p-4">
            <div class="w-12 h-16 bg-[#1e293b] rounded overflow-hidden flex items-center justify-center shrink-0 border border-[#334155]">
              <img 
                src={item.poster_image || `/media-posters/${item.type}_${item.id}.jpg`} 
                alt="Poster"
                class="w-full h-full object-cover"
                onerror={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'}
              />
            </div>
          </td>
          <td class="p-4">
            <div class="font-medium text-white">{item.title || item.id}</div>
            {#if item.subtitle}
              <div class="text-sm text-[#94a3b8]">{item.subtitle}</div>
            {/if}
          </td>
          <td class="p-4">
            {@render typeBadge(item.type)}
          </td>
          <td class="p-4">
            {@render statusBadge(item.status)}
          </td>
          <td class="p-4">
            {@render ratingDisplay(item.rating)}
          </td>
        </tr>
      {/each}
      {#if filteredMedia.length === 0}
        <tr>
          <td colspan="5" class="p-8 text-center text-[#94a3b8]">No media found matching your filters.</td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>
