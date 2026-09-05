<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { readData, writeData } from '$lib/db';
  import { notificationState } from '$lib/notificationState.svelte';
  import type { SocialItem } from './+page';

  let { data } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let currentItem: SocialItem = $state({
    id: '', name: '', url: '', icon: ''
  });

  function openNew() {
    isEditing = false;
    currentItem = { id: '', name: '', url: '', icon: '' };
    isModalOpen = true;
  }

  function openEdit(item: SocialItem) {
    isEditing = true;
    currentItem = { ...item };
    isModalOpen = true;
  }

  async function handleSave(e: SubmitEvent) {
    e.preventDefault();
    if (!currentItem.id || !currentItem.name) {
      notificationState.error('ID and Name are required', { title: 'Validation Error' });
      return;
    }

    const items = (await readData<SocialItem>('socials.json')).unwrapOr([] as SocialItem[]);
    const newItem = { ...currentItem };
    
    if (!isEditing) {
      if (items.some(i => i.id === newItem.id)) {
        notificationState.error('Social ID already exists', { title: 'Duplicate ID' });
        return;
      }
      items.push(newItem);
    } else {
      const idx = items.findIndex(i => i.id === newItem.id);
      if (idx !== -1) {
        items[idx] = newItem;
      } else {
        items.push(newItem);
      }
    }
    
    const res = await writeData('socials.json', items);
    if (res.isErr()) {
      notificationState.error(res.error.message, { title: 'Failed to save social data' });
      return;
    }
    notificationState.success(`Saved social "${newItem.name}" successfully!`, { title: 'Social Saved' });
    isModalOpen = false;
    await invalidateAll();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return;
    let items = (await readData<SocialItem>('socials.json')).unwrapOr([] as SocialItem[]);
    items = items.filter(i => i.id !== id);
    const writeRes = await writeData('socials.json', items);
    if (writeRes.isErr()) {
      notificationState.error(writeRes.error.message, { title: 'Failed to delete social' });
      return;
    }
    notificationState.success(`Deleted social "${id}"`, { title: 'Social Deleted' });
    await invalidateAll();
  }

  async function handleMove(id: string, direction: 'up' | 'down') {
    const items = (await readData<SocialItem>('socials.json')).unwrapOr([] as SocialItem[]);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return;
    
    if (direction === 'up' && idx > 0) {
      const temp = items[idx - 1];
      items[idx - 1] = items[idx];
      items[idx] = temp;
    } else if (direction === 'down' && idx < items.length - 1) {
      const temp = items[idx + 1];
      items[idx + 1] = items[idx];
      items[idx] = temp;
    }
    
    const writeRes = await writeData('socials.json', items);
    if (writeRes.isErr()) {
      notificationState.error(writeRes.error.message, { title: 'Failed to reorder social' });
      return;
    }
    await invalidateAll();
  }
</script>

<svelte:head>
  <title>Manage Socials | Admin</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-white tracking-tight">Socials</h1>
      <p class="text-[oklch(0.7107_0.0351_256.79)] mt-2">Manage your social media links and icons.</p>
    </div>
    <button onclick={openNew} class="btn-primary flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      Add Social
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each data.socials as item (item.id)}
      <div class="card p-4 flex flex-col group relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex items-center space-x-4 mb-4 relative">
          <div class="w-12 h-12 bg-[oklch(0.2077_0.0398_265.75)] rounded-lg border border-[oklch(0.3717_0.0392_257.29)] flex items-center justify-center text-white p-2">
            {#if item.icon}
              {@html item.icon}
            {:else}
              <span class="text-xl font-bold text-[oklch(0.7107_0.0351_256.79)]">{item.name.charAt(0)}</span>
            {/if}
          </div>
          <div>
            <h3 class="font-medium text-white">{item.name}</h3>
            <p class="text-xs text-[oklch(0.7107_0.0351_256.79)] truncate w-48">{item.url || 'No URL'}</p>
          </div>
        </div>
        <div class="mt-auto flex justify-between items-center border-t border-[oklch(0.3717_0.0392_257.29)] pt-3 relative">
          <div class="flex items-center space-x-1">
            <button onclick={() => handleMove(item.id, 'up')} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 rounded hover:bg-[oklch(0.3717_0.0392_257.29)]/50 transition-colors" title="Move Up">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
            </button>
            <button onclick={() => handleMove(item.id, 'down')} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 rounded hover:bg-[oklch(0.3717_0.0392_257.29)]/50 transition-colors" title="Move Down">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
          <div class="flex space-x-2">
            <button onclick={() => openEdit(item)} class="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 rounded bg-blue-500/10">Edit</button>
            <button onclick={() => handleDelete(item.id)} class="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded bg-red-500/10">Delete</button>
          </div>
        </div>
      </div>
    {/each}
  </div>
  {#if data.socials.length === 0}
    <div class="card p-8 text-center text-[oklch(0.7107_0.0351_256.79)]">No socials found. Add some!</div>
  {/if}
</div>

{#if isModalOpen}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-[oklch(0.2795_0.0368_260.03)] border border-[oklch(0.3717_0.0392_257.29)] rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
      <div class="p-6 border-b border-[oklch(0.3717_0.0392_257.29)] flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">{isEditing ? 'Edit Social' : 'Add New Social'}</h2>
        <button onclick={() => isModalOpen = false} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white" title="Close Modal">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <form onsubmit={handleSave} class="flex-1 overflow-y-auto p-6 space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]" for="social-id">ID (Unique)</label>
          <input type="text" id="social-id" bind:value={currentItem.id} readonly={isEditing} class="input-field {isEditing ? 'opacity-50 cursor-not-allowed' : ''}" required />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]" for="social-name">Name</label>
          <input type="text" id="social-name" bind:value={currentItem.name} class="input-field" required />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]" for="social-url">URL</label>
          <input type="url" id="social-url" bind:value={currentItem.url} class="input-field" required />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]" for="social-icon">Icon (Raw SVG)</label>
          <textarea id="social-icon" bind:value={currentItem.icon} rows="4" class="input-field resize-none font-mono text-xs"></textarea>
        </div>
        
        <div class="mt-8 flex justify-end space-x-4 pt-4 border-t border-[oklch(0.3717_0.0392_257.29)]">
          <button type="button" onclick={() => isModalOpen = false} class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save Social</button>
        </div>
      </form>
    </div>
  </div>
{/if}
