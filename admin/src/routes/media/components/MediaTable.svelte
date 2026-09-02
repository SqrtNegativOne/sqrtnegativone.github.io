<script lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  import { icons } from '../../../../../src/lib/icons';
  import StatusBadge from '../../../../../shared/components/StatusBadge.svelte';
  import RatingChart from '../../../../../shared/components/RatingChart.svelte';
  import TypeBadge from '../../../../../shared/components/TypeBadge.svelte';
  import { getPosterUrl } from '../../../../../src/lib/utils';
  import { assetState } from '$lib/assetState.svelte';
  let { filteredMedia, openEdit } = $props();
</script>






<div class="card overflow-x-auto">
  <table class="w-full text-left border-collapse">
    <thead>
      <tr class="bg-[oklch(0.2077_0.0398_265.75)] border-b border-[oklch(0.3717_0.0392_257.29)] text-[oklch(0.7107_0.0351_256.79)] text-sm uppercase tracking-wider">
        <th class="p-4 font-medium w-16">Poster</th>
        <th class="p-4 font-medium">Title</th>
        <th class="p-4 font-medium w-24">Rating</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-[oklch(0.3717_0.0392_257.29)]">
      {#each filteredMedia as item (item.id)}
        <tr 
          class="hover:bg-[oklch(0.2795_0.0368_260.03)]/70 cursor-pointer transition-colors group"
          onclick={() => openEdit(item)}
          onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && openEdit(item)}
          tabindex="0"
        >
          <td class="p-4">
            <div class="w-12 h-16 bg-[oklch(0.2795_0.0368_260.03)] overflow-hidden flex items-center justify-center shrink-0 border border-[oklch(0.3717_0.0392_257.29)]">
              <img 
                src={assetState.resolve(item.poster_image ? getPosterUrl(item.poster_image) : `/media/media-posters/${item.type}_${item.id}.jpg`)} 
                alt="Poster"
                class="w-full h-full object-cover"
                onerror={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'}
              />
            </div>
          </td>
          <td class="p-4">
            <div class="font-medium text-white flex items-center gap-2">
              {item.title || item.id}
              <TypeBadge type={item.type} variant="icon" />
              <StatusBadge status={item.status} />
            </div>
            {#if item.author || item.publisher || item.tagline || item.notes}
              <div class="text-sm text-[oklch(0.7107_0.0351_256.79)] flex flex-col items-start gap-0.5 mt-1">
                {#if item.author || item.publisher}
                  <span class="truncate font-medium text-[oklch(0.8_0.03_256)]">{[item.author, item.publisher].filter(Boolean).join(' • ')}</span>
                {/if}
                {#if item.tagline || item.notes}
                  <div class="flex items-center gap-1.5 w-full">
                    {#if item.tagline}
                      <span class="truncate italic">{item.tagline}</span>
                    {/if}
                    {#if item.notes}
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-70 shrink-0"><title>Has notes</title><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>
                    {/if}
                  </div>
                {/if}
              </div>
            {/if}
          </td>
          <td class="p-4">
            <RatingChart rating={item.rating} expected={['wishlist', 'next up', 'waiting for'].includes(item.status)} />
          </td>
        </tr>
      {/each}
      {#if filteredMedia.length === 0}
        <tr>
          <td colspan="3" class="p-8 text-center text-[oklch(0.7107_0.0351_256.79)]">No media found matching your filters.</td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>
