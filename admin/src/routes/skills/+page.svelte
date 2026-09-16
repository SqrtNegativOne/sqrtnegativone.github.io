<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { readData, writeData } from '$lib/db';
  import { assetState } from '$lib/assetState.svelte';
  import { notificationState } from '$lib/notificationState.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import EmptyState from '$lib/EmptyState.svelte';
  import Modal from '$lib/Modal.svelte';
  import { filterAndSortItems, type FilterRule, type SortRule, type FilterProperty } from '$lib/searchUtils';
  import type { SkillItem } from './+page';

  interface SkillFormItem extends SkillItem {
    originalName: string;
  }

  let { data } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let currentItem: SkillFormItem = $state({
    name: '', icon: '', logo: '', mono: false, originalName: '', hidden: false
  });
  let originalItem: { name: string; icon: string; logo: string; mono: boolean } = $state({
    name: '', icon: '', logo: '', mono: false
  });
  let isDirty = $derived(
    currentItem.name !== originalItem.name ||
      currentItem.icon !== originalItem.icon ||
      currentItem.logo !== originalItem.logo ||
      currentItem.mono !== originalItem.mono
  );

  let searchQuery = $state('');
  let filters = $state<FilterRule[]>([]);
  let sorts = $state<SortRule[]>([]);

  const filterProperties: FilterProperty[] = [
    { value: 'name', label: 'Name', type: 'text' }
  ];

  let filteredSkills = $derived(
    filterAndSortItems<SkillItem>({
      items: data.skills || [],
      searchQuery,
      searchFields: ['name'],
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
    currentItem = { name: initialName, icon: '', logo: '', mono: false, originalName: '', hidden: false };
    originalItem = { name: initialName, icon: '', logo: '', mono: false };
    isModalOpen = true;
  }

  function openEdit(item: SkillItem) {
    isEditing = true;
    currentItem = { ...item, originalName: item.name };
    originalItem = { name: item.name, icon: item.icon || '', logo: item.logo || '', mono: !!item.mono };
    isModalOpen = true;
  }

  async function handleSave(e: SubmitEvent) {
    e.preventDefault();
    if (!currentItem.name) {
      notificationState.error('Name is required', { title: 'Validation Error' });
      return;
    }
    const items = (await readData<SkillItem>('skills.json')).unwrapOr([] as SkillItem[]);
    const newItem = {
      name: currentItem.name,
      icon: currentItem.icon || '',
      logo: currentItem.logo || '',
      ...(currentItem.mono ? { mono: true } : {}),
      ...(currentItem.hidden ? { hidden: true } : {})
    };
    
    if (!isEditing) {
      if (items.some(i => i.name === newItem.name)) {
        notificationState.error('Skill name already exists', { title: 'Duplicate Skill' });
        return;
      }
      items.push(newItem);
    } else {
      const idx = items.findIndex(i => i.name === currentItem.originalName);
      if (idx !== -1) {
        items[idx] = newItem;
      } else {
        items.push(newItem);
      }
    }
    
    const res = await writeData('skills.json', items);
    if (res.isErr()) {
      notificationState.error(res.error.message, { title: 'Failed to save skill' });
      return;
    }
    notificationState.success(`Saved skill "${newItem.name}" successfully!`, { title: 'Skill Saved' });
    isModalOpen = false;
    await invalidateAll();
  }

  async function handleDelete(name: string) {
    if (!confirm('Are you sure?')) return;
    let items = (await readData<SkillItem>('skills.json')).unwrapOr([] as SkillItem[]);
    items = items.filter(i => i.name !== name);
    const writeRes = await writeData('skills.json', items);
    if (writeRes.isErr()) {
      notificationState.error(writeRes.error.message, { title: 'Failed to delete skill' });
      return;
    }
    notificationState.success(`Deleted skill "${name}"`, { title: 'Skill Deleted' });
    await invalidateAll();
  }

  async function handleMove(name: string, direction: 'up' | 'down') {
    const items = (await readData<SkillItem>('skills.json')).unwrapOr([] as SkillItem[]);
    const idx = items.findIndex(i => i.name === name);
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

    const writeRes = await writeData('skills.json', items);
    if (writeRes.isErr()) {
      notificationState.error(writeRes.error.message, { title: 'Failed to reorder skill' });
      return;
    }
    await invalidateAll();
  }
</script>

<svelte:head>
  <title>Manage Skills | Admin</title>
</svelte:head>

<div class="space-y-6">
  <SearchBar
    bind:value={searchQuery}
    bind:filters
    bind:sorts
    properties={filterProperties}
    totalCount={data.skills?.length || 0}
    filteredCount={filteredSkills.length}
    onnew={openNew}
  />

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {#each filteredSkills as item (item.name)}
      <div class="card p-4 flex flex-col group relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex items-center space-x-4 mb-4 relative">
          <div class="w-12 h-12 bg-[oklch(0.1603_0.0059_285.89)] rounded border border-[oklch(0.2739_0.0055_286.03)] flex items-center justify-center overflow-hidden">
            {#if item.icon}
              <i class="{item.icon} text-2xl text-white"></i>
            {:else if item.logo}
              <span
                class="skill-logo w-8 h-8 text-white"
                style="-webkit-mask-image: url({assetState.resolve(item.logo)}); mask-image: url({assetState.resolve(item.logo)});"
                aria-hidden="true"
              ></span>
            {:else}
              <span class="text-xl font-bold text-[oklch(0.7107_0.0351_256.79)]">{item.name.charAt(0)}</span>
            {/if}
          </div>
          <div>
            <h3 class="font-medium text-white">{item.name}</h3>
          </div>
        </div>
        <div class="mt-auto flex justify-between items-center border-t border-[oklch(0.2739_0.0055_286.03)] pt-3 relative">
          <div class="flex items-center space-x-1">
            <button onclick={() => handleMove(item.name, 'up')} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 rounded hover:bg-white/5 transition-colors cursor-pointer" title="Move Up">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
            </button>
            <button onclick={() => handleMove(item.name, 'down')} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 rounded hover:bg-white/5 transition-colors cursor-pointer" title="Move Down">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
          <div class="flex space-x-2">
            <button onclick={() => openEdit(item)} class="text-blue-400 hover:text-blue-300 text-sm px-2.5 py-1 rounded bg-blue-500/10 cursor-pointer">Edit</button>
            <button onclick={() => handleDelete(item.name)} class="text-red-400 hover:text-red-300 text-sm px-2.5 py-1 rounded bg-red-500/10 cursor-pointer">Delete</button>
          </div>
        </div>
      </div>
    {/each}
  </div>
  {#if filteredSkills.length === 0}
    <EmptyState
      title={searchQuery || filters.length > 0 ? "No matching skills" : "No skills found"}
      message={searchQuery || filters.length > 0 ? "Try adjusting your search query." : "Add technologies and tools to your tech stack."}
      actionLabel={searchQuery || filters.length > 0 ? undefined : "New Skill"}
      onaction={searchQuery || filters.length > 0 ? undefined : openNew}
    />
  {/if}
</div>

{#if isModalOpen}
  <Modal
    title={isEditing ? 'Edit Skill' : 'New Skill'}
    maxWidth="md"
    dirty={isDirty}
    onclose={() => isModalOpen = false}
  >
    <form id="skill-form" onsubmit={handleSave} class="space-y-4">
      <div class="space-y-2">
        <label for="skill-name" class="block text-sm font-medium text-[oklch(0.60_0.02_256.79)]">Name</label>
        <input id="skill-name" type="text" bind:this={nameInput} bind:value={currentItem.name} class="input-field" required />
      </div>

      <div class="space-y-2">
        <label for="skill-logo" class="block text-sm font-medium text-[oklch(0.60_0.02_256.79)]">Logo Path</label>
        <input id="skill-logo" type="text" bind:value={currentItem.logo} class="input-field" />
      </div>

      <label class="flex items-center gap-2 text-sm font-medium text-[oklch(0.60_0.02_256.79)]">
        <input type="checkbox" bind:checked={currentItem.mono} />
        Monochrome (theme-colored silhouette)
      </label>
    </form>

    {#snippet footer()}
      <button type="button" onclick={() => isModalOpen = false} class="btn-secondary">Cancel</button>
      <button type="submit" form="skill-form" class="btn-primary">Save Skill</button>
    {/snippet}
  </Modal>
{/if}

<style>
  /* Render skill logos as theme-colored silhouettes, matching the CV site,
     so brand-colored / plain-black SVGs look consistent on the dark UI. */
  .skill-logo {
    display: inline-block;
    background-color: currentColor;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
    -webkit-mask-size: contain;
    mask-size: contain;
  }
</style>
