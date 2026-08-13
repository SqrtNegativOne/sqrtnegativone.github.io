<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { invoke } from '@tauri-apps/api/core';
  import { getRepoRoot } from '$lib/db';

  interface BlogItem {
    id: string; title: string; date: string; description: string; content: string;
  }

  let { data } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let errorMsg = $state('');
  
  let currentItem: BlogItem = $state({
    id: '', title: '', date: '', description: '', content: ''
  });

  function openNew() {
    isEditing = false;
    const today = new Date().toISOString().split('T')[0];
    currentItem = {
      id: '', title: '', date: today, description: '', content: ''
    };
    isModalOpen = true;
  }

  function openEdit(item: BlogItem) {
    isEditing = true;
    currentItem = { ...item };
    isModalOpen = true;
  }

  function createMarkdown(title: string, date: string, description: string, content: string) {
    return `---
title: "${title}"
date: ${date}
description: "${description}"
---

${content}
`;
  }

  async function handleSave(e: Event) {
    e.preventDefault();
    errorMsg = '';
    
    let { id, title, date, description, content } = currentItem;
    const isNew = !isEditing;
    
    if (!id || !title || !date) {
      errorMsg = 'ID, Title, and Date are required';
      return;
    }
    
    if (!id.endsWith('.md')) id += '.md';
    
    try {
      const root = await getRepoRoot();
      const filepath = `${root}/blog/posts/${id}`;
      
      if (isNew) {
        try {
          await invoke('access', { path: filepath });
          errorMsg = 'Blog post ID already exists';
          return;
        } catch {
          // File does not exist, good to proceed
        }
      }
      
      const fileContent = createMarkdown(title, date, description, content);
      await invoke('write_file', { path: filepath, content: fileContent });
      
      isModalOpen = false;
      await invalidateAll();
    } catch (err: any) {
      errorMsg = err.message || 'Failed to save blog post';
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    errorMsg = '';
    
    try {
      const root = await getRepoRoot();
      const filepath = `${root}/blog/posts/${id}`;
      await invoke('unlink', { path: filepath });
      await invalidateAll();
    } catch (err: any) {
      errorMsg = err.message || 'Could not delete file';
    }
  }
</script>

<svelte:head>
  <title>Manage Blogs | Admin</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-white tracking-tight">Blogs</h1>
      <p class="text-[oklch(0.7107_0.0351_256.79)] mt-2">Manage your blog posts.</p>
    </div>
    <button onclick={openNew} class="btn-primary flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      Add Blog Post
    </button>
  </div>

  {#if errorMsg}
    <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
      {errorMsg}
    </div>
  {/if}

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
    {#each data.posts as item (item.id)}
      <div class="card flex flex-col group relative overflow-hidden p-6">
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-xl font-semibold text-white">{item.title}</h3>
          <span class="text-xs text-[oklch(0.7107_0.0351_256.79)] whitespace-nowrap ml-4 mt-1">{item.date}</span>
        </div>
        <p class="text-[oklch(0.7107_0.0351_256.79)] text-sm mb-4 line-clamp-2">{item.description}</p>
        <div class="text-xs font-mono text-[oklch(0.3717_0.0392_257.29)] mb-4">{item.id}</div>
        
        <div class="flex justify-end items-center pt-4 border-t border-[oklch(0.3717_0.0392_257.29)]/50 mt-auto">
          <div class="flex space-x-2 items-center">
            <button onclick={() => openEdit(item)} class="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded bg-blue-500/10 font-medium">Edit</button>
            <button class="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded bg-red-500/10 font-medium" onclick={() => handleDelete(item.id)}>Delete</button>
          </div>
        </div>
      </div>
    {/each}
  </div>
  {#if data.posts.length === 0}
    <div class="card p-8 text-center text-[oklch(0.7107_0.0351_256.79)]">No blog posts found. Add some!</div>
  {/if}
</div>

{#if isModalOpen}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-[oklch(0.2795_0.0368_260.03)] border border-[oklch(0.3717_0.0392_257.29)] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
      <div class="p-6 border-b border-[oklch(0.3717_0.0392_257.29)] flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">{isEditing ? 'Edit Blog Post' : 'Add New Blog Post'}</h2>
        <button aria-label="Close modal" onclick={() => isModalOpen = false} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <form onsubmit={handleSave} class="flex-1 overflow-y-auto p-6 flex flex-col">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-2">
            <label for="post-id" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Filename (.md)</label>
            <input id="post-id" type="text" name="id" bind:value={currentItem.id} readonly={isEditing} class="input-field {isEditing ? 'opacity-50 cursor-not-allowed' : ''}" required placeholder="my-post.md" />
          </div>
          
          <div class="space-y-2">
            <label for="post-date" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Date</label>
            <input id="post-date" type="text" name="date" bind:value={currentItem.date} class="input-field" required placeholder="YYYY-MM-DD" />
          </div>
          
          <div class="space-y-2 md:col-span-2">
            <label for="post-title" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Title</label>
            <input id="post-title" type="text" name="title" bind:value={currentItem.title} class="input-field" required />
          </div>
          
          <div class="space-y-2 md:col-span-2">
            <label for="post-desc" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Description</label>
            <textarea id="post-desc" name="description" bind:value={currentItem.description} rows="2" class="input-field resize-none"></textarea>
          </div>
        </div>
        
        <div class="space-y-2 flex-1 flex flex-col">
          <label for="post-content" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Markdown Content</label>
          <textarea id="post-content" name="content" bind:value={currentItem.content} class="input-field flex-1 min-h-[300px] font-mono text-sm" required></textarea>
        </div>
        
        <div class="mt-8 flex justify-end space-x-4 pt-4 border-t border-[oklch(0.3717_0.0392_257.29)]">
          <button type="button" onclick={() => isModalOpen = false} class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save Post</button>
        </div>
      </form>
    </div>
  </div>
{/if}
