<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { readData, writeData } from '$lib/db';
  import { notificationState } from '$lib/notificationState.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import EmptyState from '$lib/EmptyState.svelte';
  import { filterAndSortItems, type FilterRule, type SortRule, type FilterProperty } from '$lib/searchUtils';
  import ProjectCard from './ProjectCard.svelte';
  import ProjectModal from './ProjectModal.svelte';

  import type { ProjectItem } from '../../../../shared/types';
  
  interface ProjectFormItem {
    id: string; name: string; description: string; tags: string; github: string; url: string; image: string; private: boolean;
  }

  let { data } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  
  let searchQuery = $state('');
  let filters = $state<FilterRule[]>([]);
  let sorts = $state<SortRule[]>([]);

  const filterProperties: FilterProperty[] = [
    { value: 'name', label: 'Name', type: 'text' },
    { value: 'tags', label: 'Tag', type: 'text' }
  ];

  let filteredProjects = $derived(
    filterAndSortItems<ProjectItem>({
      items: data.projects || [],
      searchQuery,
      searchFields: ['name', 'description', 'id', 'tags'],
      filters,
      sorts
    })
  );

  let currentItem: ProjectFormItem = $state({
    id: '', name: '', description: '', tags: '', github: '', url: '', image: '', private: false
  });

  function openNew() {
    isEditing = false;
    currentItem = {
      id: '', name: '', description: '', tags: '', github: '', url: '', image: '', private: false
    };
    isModalOpen = true;
  }

  function openEdit(item: ProjectItem) {
    isEditing = true;
    currentItem = { 
      ...item, 
      tags: item.tags ? item.tags.join(', ') : '',
      github: item.github || '',
      url: item.url || '',
      image: item.image || '',
      private: !!item.private
    };
    isModalOpen = true;
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    const itemsRes = await readData<ProjectItem>('projects.json');
    let items = itemsRes.unwrapOr([] as any[]);
    items = items.filter(i => i.id !== id);
    
    const writeRes = await writeData('projects.json', items);
    if (writeRes.isErr()) {
      notificationState.error(writeRes.error.message, { title: 'Delete Failed' });
      return;
    }
    
    notificationState.success(`Project "${id}" deleted successfully`, { title: 'Project Deleted' });
    await invalidateAll();
  }

  async function handleMove(id: string, direction: 'up' | 'down') {
    const itemsRes = await readData<ProjectItem>('projects.json');
    const items = itemsRes.unwrapOr([] as any[]);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) {
      notificationState.error('Project not found', { title: 'Reorder Failed' });
      return;
    }
    
    if (direction === 'up' && idx > 0) {
      const temp = items[idx - 1];
      items[idx - 1] = items[idx];
      items[idx] = temp;
    } else if (direction === 'down' && idx < items.length - 1) {
      const temp = items[idx + 1];
      items[idx + 1] = items[idx];
      items[idx] = temp;
    }
    
    const writeRes = await writeData('projects.json', items);
    if (writeRes.isErr()) {
      notificationState.error(writeRes.error.message, { title: 'Reorder Failed' });
      return;
    }
    
    await invalidateAll();
  }
</script>

<svelte:head>
  <title>Manage Projects | Admin</title>
</svelte:head>

<div class="space-y-6">
  <SearchBar
    bind:value={searchQuery}
    bind:filters
    bind:sorts
    properties={filterProperties}
    onnew={openNew}
  />

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
    {#each filteredProjects as item (item.name)}
      <ProjectCard {item} {handleMove} {openEdit} {handleDelete} />
    {/each}
  </div>
  {#if filteredProjects.length === 0}
    <EmptyState
      title={searchQuery || filters.length > 0 ? "No matching projects" : "No projects found"}
      message={searchQuery || filters.length > 0 ? "Try adjusting your search query or filters." : "You haven't added any projects yet. Showcase your work by adding a project!"}
      actionLabel={searchQuery || filters.length > 0 ? undefined : "New Project"}
      onaction={searchQuery || filters.length > 0 ? undefined : openNew}
    />
  {/if}
</div>

{#if isModalOpen}
  <ProjectModal {isEditing} item={currentItem} close={() => isModalOpen = false} />
{/if}
