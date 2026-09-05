<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { readData, writeData } from '$lib/db';
  import { notificationState } from '$lib/notificationState.svelte';
  import ProjectCard from './ProjectCard.svelte';
  import ProjectModal from './ProjectModal.svelte';

  import type { ProjectItem } from '../../../../shared/types';
  
  interface ProjectFormItem {
    id: string; name: string; description: string; tags: string; github: string; url: string; image: string; private: boolean;
  }

  let { data } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  
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
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-white tracking-tight">Projects</h1>
      <p class="text-[oklch(0.7107_0.0351_256.79)] mt-2">Manage your portfolio projects and apps.</p>
    </div>
    <button onclick={openNew} class="btn-primary flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      Add Project
    </button>
  </div>


  <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
    {#each data.projects as item (item.name)}
      <ProjectCard {item} {handleMove} {openEdit} {handleDelete} />
    {/each}
  </div>
  {#if data.projects.length === 0}
    <div class="card p-8 text-center text-[oklch(0.7107_0.0351_256.79)]">No projects found. Add some!</div>
  {/if}
</div>

{#if isModalOpen}
  <ProjectModal {isEditing} item={currentItem} close={() => isModalOpen = false} />
{/if}
