<script lang="ts">
  let { item, handleMove, openEdit, handleDelete } = $props();
</script>

<div class="card flex flex-col md:flex-row group relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
  <div class="w-full md:w-48 h-48 md:h-auto bg-[oklch(0.2077_0.0398_265.75)] shrink-0 border-b md:border-b-0 md:border-r border-[oklch(0.3717_0.0392_257.29)] relative overflow-hidden">
    {#if item.image}
      <img src={item.image} alt={item.name} class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500" />
    {:else}
      <div class="w-full h-full flex items-center justify-center text-[oklch(0.7107_0.0351_256.79)]">No Image</div>
    {/if}
    {#if item.private}
      <div class="absolute top-2 right-2 bg-rose-500/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur shadow-lg">Private</div>
    {/if}
  </div>
  
  <div class="p-6 flex-1 flex flex-col relative">
    <div class="flex justify-between items-start mb-2">
      <h3 class="text-xl font-semibold text-white">{item.name}</h3>
    </div>
    <p class="text-[oklch(0.7107_0.0351_256.79)] text-sm mb-4 line-clamp-2">{item.description}</p>
    
    <div class="flex flex-wrap gap-2 mb-4 mt-auto">
      {#each item.tags as tag (tag)}
        <span class="px-2 py-1 bg-[oklch(0.3717_0.0392_257.29)]/50 text-[oklch(0.9842_0.0034_247.86)] text-xs rounded-md border border-[oklch(0.3717_0.0392_257.29)]">{tag}</span>
      {/each}
    </div>
    
    <div class="flex justify-between items-center pt-4 border-t border-[oklch(0.3717_0.0392_257.29)]/50">
      <div class="flex space-x-3">
        {#if item.github}
<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
          <a href={item.github} target="_blank" class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white transition-colors" title="GitHub"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path></svg></a>
        {/if}
        {#if item.url}
<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
          <a href={item.url} target="_blank" class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white transition-colors" title="External Link"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>
        {/if}
      </div>
      <div class="flex space-x-2 items-center">
        <div class="flex items-center space-x-1 mr-2 border-r border-[oklch(0.3717_0.0392_257.29)] pr-3">
          <button type="button" onclick={() => handleMove(item.id, 'up')} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 rounded hover:bg-[oklch(0.3717_0.0392_257.29)]/50 transition-colors" title="Move Up">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
          </button>
          <button type="button" onclick={() => handleMove(item.id, 'down')} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 rounded hover:bg-[oklch(0.3717_0.0392_257.29)]/50 transition-colors" title="Move Down">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        </div>
        <button onclick={() => openEdit(item)} class="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded bg-blue-500/10 font-medium">Edit</button>
        <button type="button" class="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded bg-red-500/10 font-medium" onclick={() => handleDelete(item.id)}>Delete</button>
      </div>
    </div>
  </div>
</div>
