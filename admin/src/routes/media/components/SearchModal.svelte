<script lang="ts">
  let { isSearchModalOpen = $bindable(), searchResults, selectSearchResult } = $props();
</script>

{#if isSearchModalOpen}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
    <div class="bg-[oklch(0.2795_0.0368_260.03)] border border-[oklch(0.3717_0.0392_257.29)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
      <div class="p-6 border-b border-[oklch(0.3717_0.0392_257.29)] flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">Select a match</h2>
        <button aria-label="Close modal" onclick={() => isSearchModalOpen = false} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        {#each searchResults as result, i (i)}
          <div 
            class="flex gap-4 p-4 rounded-lg border border-[oklch(0.3717_0.0392_257.29)] bg-[oklch(0.2077_0.0398_265.75)]/50 hover:bg-[oklch(0.2795_0.0368_260.03)] cursor-pointer transition-colors"
            onclick={() => selectSearchResult(result)}
            onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectSearchResult(result)}
            tabindex="0"
            role="button"
          >
            {#if result.coverUrl}
              <div class="w-16 h-24 bg-[oklch(0.2795_0.0368_260.03)] rounded overflow-hidden shrink-0">
                <img src={result.coverUrl} alt="Cover" class="w-full h-full object-cover" />
              </div>
            {/if}
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-medium text-white truncate">{result.title}</h3>
              {#if result.author || result.publisher}
                <div class="text-sm text-blue-400 mb-1">
                  {[result.author, result.publisher].filter(Boolean).join(' • ')}
                </div>
              {/if}
              {#if result.tagline}
                <div class="text-xs text-[oklch(0.7107_0.0351_256.79)] italic mb-1">{result.tagline}</div>
              {/if}
              {#if result.description}
                <p class="text-sm text-[oklch(0.7107_0.0351_256.79)] line-clamp-2">{result.description}</p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}
