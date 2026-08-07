<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let currentItem = $state({
    id: '', name: '', url: '', icon: ''
  });

  function openNew() {
    isEditing = false;
    currentItem = { id: '', name: '', url: '', icon: '' };
    isModalOpen = true;
  }

  function openEdit(item: any) {
    isEditing = true;
    currentItem = { ...item };
    isModalOpen = true;
  }
</script>

<svelte:head>
  <title>Manage Socials | Admin</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-white tracking-tight">Socials</h1>
      <p class="text-[#94a3b8] mt-2">Manage your social media links and icons.</p>
    </div>
    <button onclick={openNew} class="btn-primary flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      Add Social
    </button>
  </div>

  {#if form?.error}
    <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
      {form.error}
    </div>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each data.socials as item}
      <div class="card p-4 flex flex-col group relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex items-center space-x-4 mb-4 relative">
          <div class="w-12 h-12 bg-[#0f172a] rounded-lg border border-[#334155] flex items-center justify-center text-white p-2">
            {#if item.icon}
              {@html item.icon}
            {:else}
              <span class="text-xl font-bold text-[#94a3b8]">{item.name.charAt(0)}</span>
            {/if}
          </div>
          <div>
            <h3 class="font-medium text-white">{item.name}</h3>
            <p class="text-xs text-[#94a3b8] truncate w-48">{item.url || 'No URL'}</p>
          </div>
        </div>
        <div class="mt-auto flex justify-between items-center border-t border-[#334155] pt-3 relative">
          <form method="POST" action="?/move" use:enhance class="flex items-center space-x-1">
            <input type="hidden" name="id" value={item.id} />
            <button type="submit" name="direction" value="up" class="text-[#94a3b8] hover:text-white p-1 rounded hover:bg-[#334155]/50 transition-colors" title="Move Up">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
            </button>
            <button type="submit" name="direction" value="down" class="text-[#94a3b8] hover:text-white p-1 rounded hover:bg-[#334155]/50 transition-colors" title="Move Down">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </form>
          <div class="flex space-x-2">
            <button onclick={() => openEdit(item)} class="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 rounded bg-blue-500/10">Edit</button>
            <form method="POST" action="?/delete" use:enhance class="inline">
              <input type="hidden" name="id" value={item.id} />
              <button type="submit" class="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded bg-red-500/10" onclick={(e) => !confirm('Are you sure?') && e.preventDefault()}>Delete</button>
            </form>
          </div>
        </div>
      </div>
    {/each}
  </div>
  {#if data.socials.length === 0}
    <div class="card p-8 text-center text-[#94a3b8]">No socials found. Add some!</div>
  {/if}
</div>

{#if isModalOpen}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-[#1e293b] border border-[#334155] rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
      <div class="p-6 border-b border-[#334155] flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">{isEditing ? 'Edit Social' : 'Add New Social'}</h2>
        <button onclick={() => isModalOpen = false} class="text-[#94a3b8] hover:text-white" title="Close Modal">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <form method="POST" action="?/save" use:enhance={() => {
        return async ({ result, update }) => {
          if (result.type === 'success') {
            isModalOpen = false;
          }
          update();
        };
      }} class="flex-1 overflow-y-auto p-6 space-y-4">
        <input type="hidden" name="isNew" value={(!isEditing).toString()} />
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#94a3b8]" for="social-id">ID (Unique)</label>
          <input type="text" id="social-id" name="id" bind:value={currentItem.id} readonly={isEditing} class="input-field {isEditing ? 'opacity-50 cursor-not-allowed' : ''}" required />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#94a3b8]" for="social-name">Name</label>
          <input type="text" id="social-name" name="name" bind:value={currentItem.name} class="input-field" required />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#94a3b8]" for="social-url">URL</label>
          <input type="url" id="social-url" name="url" bind:value={currentItem.url} class="input-field" required />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#94a3b8]" for="social-icon">Icon (Raw SVG)</label>
          <textarea id="social-icon" name="icon" bind:value={currentItem.icon} rows="4" class="input-field resize-none font-mono text-xs"></textarea>
        </div>
        
        <div class="mt-8 flex justify-end space-x-4 pt-4 border-t border-[#334155]">
          <button type="button" onclick={() => isModalOpen = false} class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save Social</button>
        </div>
      </form>
    </div>
  </div>
{/if}
