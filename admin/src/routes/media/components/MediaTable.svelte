<script lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  import { icons } from '../../../../../src/lib/icons';
  import StatusBadge from '../../../../../shared/components/StatusBadge.svelte';
  import RatingChart from '../../../../../shared/components/RatingChart.svelte';
  import TypeBadge from '../../../../../shared/components/TypeBadge.svelte';
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
            <div class="w-12 h-16 bg-[oklch(0.2795_0.0368_260.03)] rounded overflow-hidden flex items-center justify-center shrink-0 border border-[oklch(0.3717_0.0392_257.29)]">
              <img 
                src={item.poster_image || `/media-posters/${item.type}_${item.id}.jpg`} 
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
            {#if item.tagline}
              <div class="text-sm text-[oklch(0.7107_0.0351_256.79)]">{item.tagline}</div>
            {/if}
          </td>
          <td class="p-4">
            <RatingChart rating={item.rating} />
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
