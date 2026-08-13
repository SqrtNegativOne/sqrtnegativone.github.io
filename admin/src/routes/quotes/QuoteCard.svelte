<script lang="ts">
  let { item, openEdit, handleDelete } = $props();
</script>

<div 
  class="card !rounded-lg p-5 group relative break-inside-avoid border border-[oklch(0.3717_0.0392_257.29)] hover:border-[oklch(0.7107_0.0351_256.79)] transition-colors cursor-pointer flex flex-col gap-3"
  onclick={() => openEdit(item)}
  onkeydown={(e) => e.key === 'Enter' && openEdit(item)}
  role="button"
  tabindex="0"
>
  <p class="text-white text-base whitespace-pre-wrap leading-relaxed">{item.quote}</p>
  
  {#if item.source || item.link}
    <div class="text-sm text-[oklch(0.7107_0.0351_256.79)] border-t border-[oklch(0.3717_0.0392_257.29)] pt-2 mt-2">
      {#if item.source}
        <span class="font-medium">{item.source}</span>
      {/if}
      {#if item.source && item.link}
        <span class="mx-1">•</span>
      {/if}
      {#if item.link}
<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a href={item.link} target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline inline-flex items-center" onclick={(e) => e.stopPropagation()}>
          Link
          <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
      {/if}
    </div>
  {/if}
  
  {#if item.tags && item.tags.length > 0}
    <div class="flex flex-wrap gap-1.5 mt-auto pt-2">
      {#each item.tags as tag (tag)}
        <span class="text-xs px-2 py-0.5 rounded-full bg-[oklch(0.3717_0.0392_257.29)] text-[oklch(0.9_0.03_256.79)] border border-[oklch(0.4_0.04_257)]">{tag}</span>
      {/each}
    </div>
  {/if}

  <!-- Hover Actions -->
  <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="inline" onclick={(e) => e.stopPropagation()}>
      <button 
        type="button" 
        class="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors shadow-sm" 
        onclick={() => handleDelete(item.id)}
        aria-label="Delete quote"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
      </button>
    </div>
  </div>
</div>
