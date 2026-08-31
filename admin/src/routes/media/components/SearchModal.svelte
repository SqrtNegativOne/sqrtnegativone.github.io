<script lang="ts">
  let { isSearchModalOpen = $bindable(), searchResults, selectSearchResult } = $props();

  function handleImageLoad(e: Event) {
    const img = e.currentTarget as HTMLImageElement;
    const parent = img.closest('.cover-container');
    if (parent) {
      const dimEl = parent.querySelector('.cover-dimensions');
      if (dimEl) {
        dimEl.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
      }
    }
  }
</script>

{#if isSearchModalOpen}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
    <div class="bg-[oklch(0.2795_0.0368_260.03)] border border-[oklch(0.3717_0.0392_257.29)] rounded-xl shadow-2xl w-[95vw] max-w-7xl flex flex-col overflow-hidden">
      <div class="p-6 border-b border-[oklch(0.3717_0.0392_257.29)] flex justify-between items-center shrink-0">
        <h2 class="text-xl font-semibold text-white">Select a match</h2>
        <button aria-label="Close modal" onclick={() => isSearchModalOpen = false} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div class="overflow-x-auto overflow-y-hidden p-6 flex gap-6">
        {#each searchResults as result, i (i)}
          <div 
            class="flex flex-col gap-2 p-3 rounded-lg border border-[oklch(0.3717_0.0392_257.29)] bg-[oklch(0.2077_0.0398_265.75)]/50 hover:bg-[oklch(0.2795_0.0368_260.03)] cursor-pointer transition-colors w-64 shrink-0 group"
            onclick={() => selectSearchResult(result)}
            onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectSearchResult(result)}
            tabindex="0"
            role="button"
          >
            {#if result.coverUrl}
              <div class="cover-container w-full shrink-0 flex flex-col gap-1 items-center">
                <div class="w-full aspect-[2/3] bg-[oklch(0.2795_0.0368_260.03)] rounded overflow-hidden">
                  <img src={result.coverUrl} alt="Cover" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onload={handleImageLoad} />
                </div>
                <div class="cover-dimensions text-[10px] text-[oklch(0.7107_0.0351_256.79)] whitespace-nowrap empty:hidden"></div>
              </div>
            {:else}
              <div class="w-full aspect-[2/3] bg-[oklch(0.2795_0.0368_260.03)] rounded flex items-center justify-center text-[oklch(0.7107_0.0351_256.79)] shrink-0 mb-2">
                No Cover
              </div>
            {/if}
            <div class="flex-1 flex flex-col min-w-0 mt-1">
              <h3 class="text-sm font-medium text-white truncate text-center" title={result.title}>{result.title}</h3>
              {#if result.author || result.publisher}
                <div class="text-[10px] text-blue-400 mt-1 truncate text-center" title={[result.author, result.publisher].filter(Boolean).join(' • ')}>
                  {[result.author, result.publisher].filter(Boolean).join(' • ')}
                </div>
              {/if}
              {#if result.tagline}
                <div class="text-[10px] text-[oklch(0.7107_0.0351_256.79)] italic mt-1 truncate text-center">{result.tagline}</div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}
