<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { readData, writeData, getRepoRoot } from '$lib/db';
  import { invoke } from '@tauri-apps/api/core';

  interface ProjectItem {
    id: string; name: string; description: string; tags: string[]; github?: string | null; url?: string | null; image?: string | null; private?: boolean;
  }
  
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
  let fileInput: HTMLInputElement | undefined = $state();

  function handlePaste(e: ClipboardEvent) {
    if (!isModalOpen) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        if (file && fileInput) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
          // Pre-fill the text field to indicate it will be handled
          currentItem.image = `(Auto-named on save)`;
        }
      }
    }
  }

  async function handleSave(e: Event) {
    e.preventDefault();
    const id = currentItem.id;
    const name = currentItem.name;
    const description = currentItem.description;
    const tagsStr = currentItem.tags;
    const github = currentItem.github;
    const url = currentItem.url;
    let image = currentItem.image;
    const isPrivate = currentItem.private;
    const isNew = !isEditing;
    
    if (!id || !name) {
      alert('ID and Name are required');
      return;
    }

    try {
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const imageFile = fileInput.files[0];
        const buffer = await imageFile.arrayBuffer();
        
        let ext = imageFile.name.split('.').pop();
        if (!ext || ext === 'blob' || ext === 'image') {
           if (imageFile.type === 'image/jpeg') ext = 'jpg';
           else if (imageFile.type === 'image/webp') ext = 'webp';
           else ext = 'png';
        }
        
        const safeId = id.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${safeId}-${Date.now()}.${ext}`;
        
        const repoRoot = await getRepoRoot();
        const filepath = `${repoRoot}/static/projects/${fileName}`;
        
        await invoke('write_file_binary', { path: filepath, content: Array.from(new Uint8Array(buffer)) });
        image = `/projects/${fileName}`;
      }

      const itemsRes = await readData<ProjectItem>('projects.json');
      const items = itemsRes.unwrapOr([] as any[]);
      
      const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
      
      const newItem: ProjectItem = { 
        id, 
        name, 
        description, 
        tags, 
        github: github || null, 
        url: url || null, 
        image: image !== '(Auto-named on save)' ? image : '',
        private: isPrivate
      };
      
      if (!isPrivate) {
        delete newItem.private;
      }
      
      if (isNew) {
        if (items.some(i => i.id === id)) {
          alert('Project ID already exists');
          return;
        }
        items.push(newItem);
      } else {
        const idx = items.findIndex(i => i.id === id);
        if (idx !== -1) {
          items[idx] = newItem;
        } else {
          items.push(newItem);
        }
      }
      
      const writeRes = await writeData('projects.json', items);
      if (writeRes.isErr()) {
        alert('Failed to write project data');
        return;
      }
      
      isModalOpen = false;
      await invalidateAll();
    } catch (err) {
      console.error(err);
      alert('Error saving project');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    const itemsRes = await readData<ProjectItem>('projects.json');
    let items = itemsRes.unwrapOr([] as any[]);
    items = items.filter(i => i.id !== id);
    
    const writeRes = await writeData('projects.json', items);
    if (writeRes.isErr()) {
      alert('Failed to delete project data');
      return;
    }
    
    await invalidateAll();
  }

  async function handleMove(id: string, direction: 'up' | 'down') {
    const itemsRes = await readData<ProjectItem>('projects.json');
    const items = itemsRes.unwrapOr([] as any[]);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) {
      alert('Project not found');
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
      alert('Failed to update project data');
      return;
    }
    
    await invalidateAll();
  }
</script>

<svelte:window onpaste={handlePaste} />

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
    {/each}
  </div>
  {#if data.projects.length === 0}
    <div class="card p-8 text-center text-[oklch(0.7107_0.0351_256.79)]">No projects found. Add some!</div>
  {/if}
</div>

{#if isModalOpen}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-[oklch(0.2795_0.0368_260.03)] border border-[oklch(0.3717_0.0392_257.29)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
      <div class="p-6 border-b border-[oklch(0.3717_0.0392_257.29)] flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">{isEditing ? 'Edit Project' : 'Add New Project'}</h2>
        <button aria-label="Close modal" onclick={() => isModalOpen = false} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <form onsubmit={handleSave} class="flex-1 overflow-y-auto p-6">
        <input type="hidden" name="isNew" value={(!isEditing).toString()} />
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label for="project-id" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">ID (Unique)</label>
            <input id="project-id" type="text" name="id" bind:value={currentItem.id} readonly={isEditing} class="input-field {isEditing ? 'opacity-50 cursor-not-allowed' : ''}" required />
          </div>
          
          <div class="space-y-2">
            <label for="project-name" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Name</label>
            <input id="project-name" type="text" name="name" bind:value={currentItem.name} class="input-field" required />
          </div>
          
          <div class="space-y-2 md:col-span-2">
            <label for="project-desc" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Description</label>
            <textarea id="project-desc" name="description" bind:value={currentItem.description} rows="3" class="input-field resize-none"></textarea>
          </div>
          
          <div class="space-y-2 md:col-span-2">
            <label for="project-tags" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Tags (comma separated)</label>
            <input id="project-tags" type="text" name="tags" bind:value={currentItem.tags} class="input-field" placeholder="React, Node.js, Tailwind" />
          </div>
          
          <div class="space-y-2">
            <label for="project-github" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">GitHub URL</label>
            <input id="project-github" type="text" name="github" bind:value={currentItem.github} class="input-field" />
          </div>
          
          <div class="space-y-2">
            <label for="project-url" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Website URL</label>
            <input id="project-url" type="text" name="url" bind:value={currentItem.url} class="input-field" />
          </div>
          
          <div class="space-y-2">
            <label for="project-image" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Image (Paste anywhere to upload)</label>
            <input id="project-image" type="file" name="imageFile" bind:this={fileInput} accept="image/*" class="w-full text-sm text-[oklch(0.7107_0.0351_256.79)] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20" />
            <label for="project-image-text" class="sr-only">Image path</label>
            <input id="project-image-text" type="text" name="image" bind:value={currentItem.image} class="input-field mt-2" placeholder="/projects/image.png" />
          </div>
          
          <div class="space-y-2 flex items-center pt-8">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" name="private" value="true" checked={currentItem.private} class="w-5 h-5 rounded border-[oklch(0.3717_0.0392_257.29)] bg-[oklch(0.2077_0.0398_265.75)] text-blue-500 focus:ring-blue-500 focus:ring-offset-[oklch(0.2795_0.0368_260.03)]" />
              <span class="text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Private Project</span>
            </label>
          </div>
        </div>
        
        <div class="mt-8 flex justify-end space-x-4 pt-4 border-t border-[oklch(0.3717_0.0392_257.29)]">
          <button type="button" onclick={() => isModalOpen = false} class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save Project</button>
        </div>
      </form>
    </div>
  </div>
{/if}
