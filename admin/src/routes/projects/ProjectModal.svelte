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

  let { isEditing, item, close } = $props<{
    isEditing: boolean;
    item: ProjectFormItem;
    close: () => void;
  }>();

  let currentItem = $state({ ...item });
  let fileInput: HTMLInputElement | undefined = $state();

  function handlePaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (const clipboardItem of items) {
      if (clipboardItem.type.indexOf('image') === 0) {
        const file = clipboardItem.getAsFile();
        if (file && fileInput) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
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
      
      close();
      await invalidateAll();
    } catch (err) {
      console.error(err);
      alert('Error saving project');
    }
  }
</script>

<svelte:window onpaste={handlePaste} />

<div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
  <div class="bg-[oklch(0.2795_0.0368_260.03)] border border-[oklch(0.3717_0.0392_257.29)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
    <div class="p-6 border-b border-[oklch(0.3717_0.0392_257.29)] flex justify-between items-center">
      <h2 class="text-xl font-semibold text-white">{isEditing ? 'Edit Project' : 'Add New Project'}</h2>
      <button aria-label="Close modal" onclick={close} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white">
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
        <button type="button" onclick={close} class="btn-secondary">Cancel</button>
        <button type="submit" class="btn-primary">Save Project</button>
      </div>
    </form>
  </div>
</div>
