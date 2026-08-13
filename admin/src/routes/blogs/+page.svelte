<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { invoke } from '@tauri-apps/api/core';
  import { getRepoRoot } from '$lib/db';
  import { ResultAsync, ok, err, type Result } from 'neverthrow';

  interface BlogItem {
    id: string; title: string; date: string; description: string; content: string; tags?: string[];
  }

  interface BlogFormItem {
    id: string; title: string; date: string; description: string; content: string; tags: string;
  }

  let { data } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let errorMsg = $state('');
  
  let currentItem: BlogFormItem = $state({
    id: '', title: '', date: '', description: '', content: '', tags: ''
  });

  let fileInput: HTMLInputElement | undefined = $state();
  let uploadStatus = $state('');

  async function uploadImage(file: File): Promise<Result<string, string>> {
    const bufferRes = await ResultAsync.fromPromise(file.arrayBuffer(), e => String(e));
    if (bufferRes.isErr()) return err(bufferRes.error);
    const buffer = bufferRes.value;
    
    let ext = file.name.split('.').pop();
    if (!ext || ext === 'blob' || ext === 'image') {
       if (file.type === 'image/jpeg') ext = 'jpg';
       else if (file.type === 'image/webp') ext = 'webp';
       else ext = 'png';
    }
    
    const fileName = `blog-${Date.now()}.${ext}`;
    
    const rootRes = await ResultAsync.fromPromise(getRepoRoot(), e => String(e));
    if (rootRes.isErr()) return err(rootRes.error);
    const root = rootRes.value;
    
    const imagesDir = `${root}/static/blog-images`;
    const filepath = `${imagesDir}/${fileName}`;
    
    await ResultAsync.fromPromise(invoke('mkdir', { path: imagesDir, recursive: true }), e => String(e));
    
    const writeRes = await ResultAsync.fromPromise(invoke('write_file_binary', { path: filepath, content: Array.from(new Uint8Array(buffer)) }), e => String(e));
    if (writeRes.isErr()) return err(writeRes.error);
    
    return ok(`/blog-images/${fileName}`);
  }

  function insertTextAtCursor(text: string) {
    const textarea = document.getElementById('post-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    currentItem.content = 
      currentItem.content.substring(0, start) + 
      text + 
      currentItem.content.substring(end);
      
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 10);
  }

  async function handlePaste(e: ClipboardEvent) {
    if (!isModalOpen) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          uploadStatus = 'Uploading image...';
          const uploadRes = await uploadImage(file);
          if (uploadRes.isOk()) {
            insertTextAtCursor(`![image](${uploadRes.value})`);
            uploadStatus = '';
          } else {
            uploadStatus = uploadRes.error || 'Image upload failed';
          }
        }
      }
    }
  }

  async function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    
    uploadStatus = 'Uploading image...';
    for (let i = 0; i < target.files.length; i++) {
      const file = target.files[i];
      const uploadRes = await uploadImage(file);
      if (uploadRes.isOk()) {
        insertTextAtCursor(`![image](${uploadRes.value})\n`);
        uploadStatus = '';
      } else {
        uploadStatus = uploadRes.error || 'Image upload failed';
        break;
      }
    }
    
    if (fileInput) fileInput.value = '';
  }

  function openNew() {
    isEditing = false;
    const today = new Date().toISOString().split('T')[0];
    currentItem = {
      id: '', title: '', date: today, description: '', content: '', tags: 'post'
    };
    isModalOpen = true;
  }

  function openEdit(item: BlogItem) {
    isEditing = true;
    currentItem = { ...item, tags: item.tags ? item.tags.join(', ') : '' };
    isModalOpen = true;
  }

  function createMarkdown(title: string, date: string, description: string, tags: string, content: string) {
    let tagsFrontmatter = '';
    if (tags.trim()) {
      const tagsArray = tags.split(',').map(t => `"${t.trim()}"`).filter(t => t !== '""');
      if (tagsArray.length > 0) {
        tagsFrontmatter = `\ntags: [${tagsArray.join(', ')}]`;
      }
    }
    return `---
title: "${title}"
date: ${date}
description: "${description}"${tagsFrontmatter}
---

${content}
`;
  }

  async function handleSave(e: Event) {
    e.preventDefault();
    errorMsg = '';
    
    let { id, title, date, description, tags, content } = currentItem;
    const isNew = !isEditing;

    
    if (!id || !title || !date) {
      errorMsg = 'ID, Title, and Date are required';
      return;
    }
    
    if (!id.endsWith('.md')) id += '.md';
    
    const rootRes = await ResultAsync.fromPromise(getRepoRoot(), e => String(e));
    if (rootRes.isErr()) {
      errorMsg = rootRes.error;
      return;
    }
    const root = rootRes.value;
    const filepath = `${root}/blog/posts/${id}`;
    
    if (isNew) {
      const accessRes = await ResultAsync.fromPromise(invoke<boolean>('access', { path: filepath }), e => String(e));
      if (accessRes.isErr()) {
        errorMsg = accessRes.error;
        return;
      }
      if (accessRes.value) {
        errorMsg = 'Blog post ID already exists';
        return;
      }
    }
    
    const fileContent = createMarkdown(title, date, description, tags, content);
    const writeRes = await ResultAsync.fromPromise(invoke('write_file', { path: filepath, content: fileContent }), e => String(e));
    if (writeRes.isErr()) {
      errorMsg = writeRes.error || 'Failed to save blog post';
      return;
    }
    
    isModalOpen = false;
    await invalidateAll();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    errorMsg = '';
    
    const rootRes = await ResultAsync.fromPromise(getRepoRoot(), e => String(e));
    if (rootRes.isErr()) {
      errorMsg = rootRes.error;
      return;
    }
    
    const root = rootRes.value;
    const filepath = `${root}/blog/posts/${id}`;
    const unlinkRes = await ResultAsync.fromPromise(invoke('unlink', { path: filepath }), e => String(e));
    if (unlinkRes.isErr()) {
      errorMsg = unlinkRes.error || 'Could not delete file';
      return;
    }
    
    await invalidateAll();
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
        <div class="flex flex-wrap gap-2 mb-4">
          {#if item.tags && item.tags.length > 0}
            {#each item.tags as tag (tag)}
              <span class="px-2 py-0.5 bg-[oklch(0.3717_0.0392_257.29)]/50 text-[oklch(0.9842_0.0034_247.86)] text-[10px] rounded border border-[oklch(0.3717_0.0392_257.29)]">{tag}</span>
            {/each}
          {:else}
            <span class="px-2 py-0.5 bg-[oklch(0.3717_0.0392_257.29)]/20 text-[oklch(0.7107_0.0351_256.79)] text-[10px] rounded border border-[oklch(0.3717_0.0392_257.29)]/30">untagged</span>
          {/if}
        </div>
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
          
          <div class="space-y-2 md:col-span-2">
            <label for="post-tags" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Tags (comma separated)</label>
            <input id="post-tags" type="text" name="tags" bind:value={currentItem.tags} class="input-field" placeholder="post, afterdark" />
          </div>
        </div>
        
        <div class="space-y-2 flex-1 flex flex-col">
          <div class="flex justify-between items-end">
            <label for="post-content" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Markdown Content</label>
            {#if uploadStatus}
              <span class="text-xs text-blue-400 font-medium animate-pulse">{uploadStatus}</span>
            {/if}
          </div>
          <div class="flex flex-col flex-1 relative border border-[oklch(0.3717_0.0392_257.29)] rounded-lg focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all bg-black/20">
            <textarea id="post-content" name="content" bind:value={currentItem.content} onpaste={handlePaste} class="w-full bg-transparent text-white placeholder-[oklch(0.7107_0.0351_256.79)] p-4 flex-1 min-h-[300px] font-mono text-sm resize-none focus:outline-none" required placeholder="Write your post content here... You can paste images directly!"></textarea>
            <div class="bg-[oklch(0.2077_0.0398_265.75)] p-2 flex justify-between items-center rounded-b-lg border-t border-[oklch(0.3717_0.0392_257.29)]">
              <span class="text-xs text-[oklch(0.7107_0.0351_256.79)] hidden sm:inline-block">Paste images directly or select:</span>
              <input type="file" accept="image/*" multiple bind:this={fileInput} onchange={handleFileSelect} class="text-xs text-[oklch(0.7107_0.0351_256.79)] file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer" />
            </div>
          </div>
        </div>
        
        <div class="mt-8 flex justify-end space-x-4 pt-4 border-t border-[oklch(0.3717_0.0392_257.29)]">
          <button type="button" onclick={() => isModalOpen = false} class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save Post</button>
        </div>
      </form>
    </div>
  </div>
{/if}
