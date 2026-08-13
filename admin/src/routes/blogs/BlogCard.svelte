<script lang="ts">
  let { item, openEdit, handleDelete } = $props();
</script>

<div class="card flex flex-col group relative overflow-hidden p-6">
  <div class="flex justify-between items-start mb-2">
    <h3 class="text-xl font-semibold text-white">{item.title}</h3>
    <span class="text-xs text-[oklch(0.7107_0.0351_256.79)] whitespace-nowrap ml-4 mt-1">{item.date}</span>
  </div>
  <p class="text-[oklch(0.7107_0.0351_256.79)] text-sm mb-4 line-clamp-2">{item.description}</p>
  <div class="flex flex-wrap gap-2 mb-4">
    {#if item.tags && item.tags.length > 0}
      {#each item.tags as tag (tag)}
        <span class="px-2 py-0.5 bg-[oklch(0.3717_0.0392_257.29)]/50 text-[oklch(0.9842_0.0034_247.86)] text-[10px] rounded border border-[oklch(0.3717_0.0392_257.29)]">{tag}</span>
      {/each}
    {:else}
      <span class="px-2 py-0.5 bg-[oklch(0.3717_0.0392_257.29)]/20 text-[oklch(0.7107_0.0351_256.79)] text-[10px] rounded border border-[oklch(0.3717_0.0392_257.29)]/30">untagged</span>
    {/if}
  </div>
  <div class="text-xs font-mono text-[oklch(0.3717_0.0392_257.29)] mb-4">{item.id}</div>
  
  <div class="flex justify-end items-center pt-4 border-t border-[oklch(0.3717_0.0392_257.29)]/50 mt-auto">
    <div class="flex space-x-2 items-center">
      <button onclick={() => openEdit(item)} class="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded bg-blue-500/10 font-medium">Edit</button>
      <button class="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded bg-red-500/10 font-medium" onclick={() => handleDelete(item.id)}>Delete</button>
    </div>
  </div>
</div>
