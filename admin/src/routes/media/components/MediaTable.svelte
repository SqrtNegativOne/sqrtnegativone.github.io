<script lang="ts">
  let { filteredMedia, openEdit } = $props();
</script>

{#snippet typeBadge(type: string)}
  {#if type === 'book'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
      {type}
    </span>
  {:else if type === 'movie'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>
      {type}
    </span>
  {:else if type === 'show'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
      {type}
    </span>
  {:else if type === 'game'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
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
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      {status}
    </span>
  {:else if status === 'abandoned'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      {status}
    </span>
  {:else if status === 'wishlist'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
      {status}
    </span>
  {:else if status === 'rewishlist'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
      {status}
    </span>
  {:else if status === 'next up'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      {status}
    </span>
  {:else if status === 'consuming'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
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
