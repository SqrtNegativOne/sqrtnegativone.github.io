<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { readData, writeData } from '$lib/db';
  import { notificationState } from '$lib/notificationState.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import EmptyState from '$lib/EmptyState.svelte';
  import Modal from '$lib/Modal.svelte';
  import { filterAndSortItems, type FilterRule, type SortRule, type FilterProperty } from '$lib/searchUtils';
  import type { SocialItem } from './+page';

  let { data } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let currentItem: SocialItem = $state({
    id: '', name: '', url: '', icon: ''
  });

  let searchQuery = $state('');
  let filters = $state<FilterRule[]>([]);
  let sorts = $state<SortRule[]>([]);

  const filterProperties: FilterProperty[] = [
    { value: 'name', label: 'Name', type: 'text' },
    { value: 'url', label: 'URL', type: 'text' }
  ];

  let filteredSocials = $derived(
    filterAndSortItems<SocialItem>({
      items: data.socials || [],
      searchQuery,
      searchFields: ['name', 'id', 'url'],
      filters,
      sorts
    })
  );

  let nameInput: HTMLInputElement | undefined = $state();
  $effect(() => {
    if (isModalOpen) nameInput?.focus();
  });

  function openNew(initialName = '') {
    isEditing = false;
    currentItem = { id: '', name: initialName, url: '', icon: '' };
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
  <SearchBar
    bind:value={searchQuery}
    bind:filters
    bind:sorts
    properties={filterProperties}
    totalCount={data.socials?.length || 0}
    filteredCount={filteredSocials.length}
    onnew={openNew}
  />

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each filteredSocials as item (item.id)}
      <div class="card p-4 flex flex-col group relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex items-center space-x-4 mb-4 relative">
          <div class="w-12 h-12 bg-[oklch(0.1603_0.0059_285.89)] rounded border border-[oklch(0.2739_0.0055_286.03)] flex items-center justify-center text-white p-2">
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
        <div class="mt-auto flex justify-between items-center border-t border-[oklch(0.2739_0.0055_286.03)] pt-3 relative">
          <div class="flex items-center space-x-1">
            <button onclick={() => handleMove(item.id, 'up')} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 rounded hover:bg-white/5 transition-colors cursor-pointer" title="Move Up">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
            </button>
            <button onclick={() => handleMove(item.id, 'down')} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 rounded hover:bg-white/5 transition-colors cursor-pointer" title="Move Down">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
          <div class="flex space-x-2">
            <button onclick={() => openEdit(item)} class="text-blue-400 hover:text-blue-300 text-sm px-2.5 py-1 rounded bg-blue-500/10 cursor-pointer">Edit</button>
            <button onclick={() => handleDelete(item.id)} class="text-red-400 hover:text-red-300 text-sm px-2.5 py-1 rounded bg-red-500/10 cursor-pointer">Delete</button>
          </div>
        </div>
      </div>
    {/each}
  </div>
  {#if filteredSocials.length === 0}
    <EmptyState
      title={searchQuery || filters.length > 0 ? "No matching socials" : "No socials found"}
      message={searchQuery || filters.length > 0 ? "Try adjusting your search query or filters." : "Add links to your social profiles and online presence."}
      actionLabel={searchQuery || filters.length > 0 ? undefined : "New Social"}
      onaction={searchQuery || filters.length > 0 ? undefined : openNew}
    />
  {/if}
</div>

{#if isModalOpen}
  <Modal
    title={isEditing ? 'Edit Social' : 'New Social'}
    maxWidth="md"
    onclose={() => isModalOpen = false}
  >
    <form id="social-form" onsubmit={handleSave} class="space-y-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-[oklch(0.60_0.02_256.79)]" for="social-id">ID (Unique)</label>
        <input type="text" id="social-id" bind:value={currentItem.id} readonly={isEditing} class="input-field {isEditing ? 'opacity-50 cursor-not-allowed' : ''}" required />
      </div>
      
      <div class="space-y-2">
        <label class="block text-sm font-medium text-[oklch(0.60_0.02_256.79)]" for="social-name">Name</label>
        <input type="text" id="social-name" bind:this={nameInput} bind:value={currentItem.name} class="input-field" required />
      </div>
      
      <div class="space-y-2">
        <label class="block text-sm font-medium text-[oklch(0.60_0.02_256.79)]" for="social-url">URL</label>
        <input type="url" id="social-url" bind:value={currentItem.url} class="input-field" required />
      </div>
      
      <div class="space-y-2">
        <label class="block text-sm font-medium text-[oklch(0.60_0.02_256.79)]" for="social-icon">Icon (Raw SVG)</label>
        <textarea id="social-icon" bind:value={currentItem.icon} rows="4" class="input-field resize-none font-mono text-xs"></textarea>
      </div>
    </form>

    {#snippet footer()}
      <button type="button" onclick={() => isModalOpen = false} class="btn-secondary">Cancel</button>
      <button type="submit" form="social-form" class="btn-primary">Save Social</button>
    {/snippet}
  </Modal>
{/if}
