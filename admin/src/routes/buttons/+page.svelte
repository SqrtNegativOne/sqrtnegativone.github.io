<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { readData, writeData } from '$lib/db';
  import { notificationState } from '$lib/notificationState.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import EmptyState from '$lib/EmptyState.svelte';
  import Modal from '$lib/Modal.svelte';
  import { filterAndSortItems, type FilterRule, type SortRule, type FilterProperty } from '$lib/searchUtils';
  import { buttonLabel } from '../../../../shared/utils/buttonLabel';
  import type { ButtonItem } from './+page';

  let { data } = $props();

  const emptyButton = (): ButtonItem => ({ url: '', image: '' });

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let currentItem: ButtonItem = $state(emptyButton());
  let originalItem: ButtonItem = $state(emptyButton());
  let isDirty = $derived(JSON.stringify(currentItem) !== JSON.stringify(originalItem));
  let previewError = $state(false);

  let searchQuery = $state('');
  let filters = $state<FilterRule[]>([]);
  let sorts = $state<SortRule[]>([]);

  const filterProperties: FilterProperty[] = [
    { value: 'url', label: 'URL', type: 'text' }
  ];

  let filteredButtons = $derived(
    filterAndSortItems<ButtonItem>({
      items: data.buttons || [],
      searchQuery,
      searchFields: ['url'],
      filters,
      sorts
    })
  );

  let urlInput: HTMLInputElement | undefined = $state();
  $effect(() => {
    if (isModalOpen) urlInput?.focus();
  });

  // Reset the broken-image state whenever the previewed image URL changes.
  $effect(() => {
    currentItem.image;
    previewError = false;
  });

  function openNew() {
    isEditing = false;
    currentItem = emptyButton();
    originalItem = { ...currentItem };
    isModalOpen = true;
  }

  function openEdit(item: ButtonItem) {
    isEditing = true;
    currentItem = { ...item };
    originalItem = { ...currentItem };
    isModalOpen = true;
  }

  async function handleSave(e: SubmitEvent) {
    e.preventDefault();
    if (!currentItem.url.trim()) {
      notificationState.error('URL is required', { title: 'Validation Error' });
      return;
    }
    if (!currentItem.image.trim()) {
      notificationState.error('Image is required', { title: 'Validation Error' });
      return;
    }

    const newItem: ButtonItem = {
      url: currentItem.url.trim(),
      image: currentItem.image.trim()
    };

    const items = (await readData<ButtonItem>('buttons')).unwrapOr([] as ButtonItem[]);

    // The URL is the identity, so it must stay unique within the list.
    const duplicate = items.some((i) => i.url === newItem.url && i.url !== originalItem.url);
    if (duplicate) {
      notificationState.error('A button with this URL already exists', { title: 'Duplicate URL' });
      return;
    }

    if (!isEditing) {
      items.push(newItem);
    } else {
      const idx = items.findIndex((i) => i.url === originalItem.url);
      if (idx !== -1) {
        items[idx] = newItem;
      } else {
        items.push(newItem);
      }
    }

    const res = await writeData('buttons', items);
    if (res.isErr()) {
      notificationState.error(res.error.message, { title: 'Failed to save button' });
      return;
    }
    notificationState.success(`Saved button "${buttonLabel(newItem.url)}" successfully!`, { title: 'Button Saved' });
    isModalOpen = false;
    await invalidateAll();
  }

  async function handleDelete(url: string) {
    if (!confirm('Are you sure?')) return;
    let items = (await readData<ButtonItem>('buttons')).unwrapOr([] as ButtonItem[]);
    items = items.filter((i) => i.url !== url);
    const writeRes = await writeData('buttons', items);
    if (writeRes.isErr()) {
      notificationState.error(writeRes.error.message, { title: 'Failed to delete button' });
      return;
    }
    notificationState.success(`Deleted button "${buttonLabel(url)}"`, { title: 'Button Deleted' });
    await invalidateAll();
  }

  async function handleMove(url: string, direction: 'up' | 'down') {
    const items = (await readData<ButtonItem>('buttons')).unwrapOr([] as ButtonItem[]);
    const idx = items.findIndex((i) => i.url === url);
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

    const writeRes = await writeData('buttons', items);
    if (writeRes.isErr()) {
      notificationState.error(writeRes.error.message, { title: 'Failed to reorder button' });
      return;
    }
    await invalidateAll();
  }
</script>

<svelte:head>
  <title>Manage Buttons | Admin</title>
</svelte:head>

<div class="space-y-6">
  <SearchBar
    bind:value={searchQuery}
    bind:filters
    bind:sorts
    properties={filterProperties}
    totalCount={data.buttons?.length || 0}
    filteredCount={filteredButtons.length}
    onnew={openNew}
  />

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each filteredButtons as item (item.url)}
      {@const label = buttonLabel(item.url)}
      <div class="card p-4 flex flex-col group relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex items-center gap-4 mb-4 relative">
          <div class="w-[88px] h-[31px] shrink-0 bg-[oklch(0.1603_0.0059_285.89)] rounded border border-[oklch(0.2739_0.0055_286.03)] flex items-center justify-center overflow-hidden">
            {#if item.image}
              <img src={item.image} alt={label} class="w-[88px] h-[31px] object-contain [image-rendering:pixelated]" />
            {:else}
              <span class="text-[10px] text-[oklch(0.7107_0.0351_256.79)]">No image</span>
            {/if}
          </div>
          <div class="min-w-0">
            <h3 class="font-medium text-white truncate">{label}</h3>
            <p class="text-xs text-[oklch(0.7107_0.0351_256.79)] truncate">{item.url}</p>
          </div>
        </div>
        <div class="mt-auto flex justify-between items-center border-t border-[oklch(0.2739_0.0055_286.03)] pt-3 relative">
          <div class="flex items-center space-x-1">
            <button onclick={() => handleMove(item.url, 'up')} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 rounded hover:bg-white/5 transition-colors cursor-pointer" title="Move Up">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
            </button>
            <button onclick={() => handleMove(item.url, 'down')} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 rounded hover:bg-white/5 transition-colors cursor-pointer" title="Move Down">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
          <div class="flex space-x-2">
            <button onclick={() => openEdit(item)} class="text-blue-400 hover:text-blue-300 text-sm px-2.5 py-1 rounded bg-blue-500/10 cursor-pointer">Edit</button>
            <button onclick={() => handleDelete(item.url)} class="text-red-400 hover:text-red-300 text-sm px-2.5 py-1 rounded bg-red-500/10 cursor-pointer">Delete</button>
          </div>
        </div>
      </div>
    {/each}
  </div>
  {#if filteredButtons.length === 0}
    <EmptyState
      title={searchQuery || filters.length > 0 ? "No matching buttons" : "No buttons found"}
      message={searchQuery || filters.length > 0 ? "Try adjusting your search query or filters." : "Add 88x31 link buttons to display on the contact page."}
      actionLabel={searchQuery || filters.length > 0 ? undefined : "New Button"}
      onaction={searchQuery || filters.length > 0 ? undefined : openNew}
    />
  {/if}
</div>

{#if isModalOpen}
  <Modal
    title={isEditing ? 'Edit Button' : 'New Button'}
    maxWidth="md"
    dirty={isDirty}
    onclose={() => isModalOpen = false}
  >
    <form id="button-form" onsubmit={handleSave} class="space-y-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-[oklch(0.60_0.02_256.79)]" for="button-url">URL</label>
        <input type="url" id="button-url" bind:this={urlInput} bind:value={currentItem.url} class="input-field" required />
        <p class="text-xs text-[oklch(0.60_0.02_256.79)]">The link target and the button's identity in this list.</p>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-[oklch(0.60_0.02_256.79)]" for="button-image">Image URL</label>
        <input type="text" id="button-image" bind:value={currentItem.image} class="input-field" placeholder="https://example.com/button.gif" required />
        <p class="text-xs text-[oklch(0.60_0.02_256.79)]">Should be an 88x31 image (gif, png, or webp).</p>
      </div>

      <div class="space-y-2">
        <span class="block text-sm font-medium text-[oklch(0.60_0.02_256.79)]">Preview</span>
        <div class="w-[88px] h-[31px] bg-[oklch(0.1603_0.0059_285.89)] rounded border border-[oklch(0.2739_0.0055_286.03)] flex items-center justify-center overflow-hidden">
          {#if currentItem.image && !previewError}
            <img src={currentItem.image} alt="Preview" class="w-[88px] h-[31px] object-contain [image-rendering:pixelated]" onerror={() => previewError = true} />
          {:else}
            <span class="text-[10px] text-[oklch(0.7107_0.0351_256.79)]">{previewError ? 'Could not load' : 'No image'}</span>
          {/if}
        </div>
      </div>
    </form>

    {#snippet footer()}
      <button type="button" onclick={() => isModalOpen = false} class="btn-secondary">Cancel</button>
      <button type="submit" form="button-form" class="btn-primary">Save Button</button>
    {/snippet}
  </Modal>
{/if}
