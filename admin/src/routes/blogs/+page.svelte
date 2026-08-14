<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { invoke } from '@tauri-apps/api/core';
  import { getRepoRoot } from '$lib/db';
  import { ResultAsync } from 'neverthrow';
  import BlogCard from './BlogCard.svelte';
  import BlogModal from './BlogModal.svelte';

  interface BlogItem {
    id: string; title: string; date: string; description: string; content: string; tags?: string[]; font?: string;
  }

  interface BlogFormItem {
    id: string; title: string; date: string; description: string; content: string; tags: string; font: string;
  }

  let { data } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let errorMsg = $state('');
  
  let currentItem: BlogFormItem = $state({
    id: '', title: '', date: '', description: '', content: '', tags: '', font: 'IBM Plex Sans'
  });

  function openNew() {
    isEditing = false;
    const today = new Date().toISOString().split('T')[0];
    currentItem = {
      id: '', title: '', date: today, description: '', content: '', tags: 'post', font: 'IBM Plex Sans'
    };
    isModalOpen = true;
  }

  function openEdit(item: BlogItem) {
    isEditing = true;
    currentItem = { ...item, tags: item.tags ? item.tags.join(', ') : '', font: item.font || 'IBM Plex Sans' };
    isModalOpen = true;
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
      <BlogCard {item} {openEdit} {handleDelete} />
    {/each}
  </div>
  {#if data.posts.length === 0}
    <div class="card p-8 text-center text-[oklch(0.7107_0.0351_256.79)]">No blog posts found. Add some!</div>
  {/if}
</div>

{#if isModalOpen}
  <BlogModal {isEditing} item={currentItem} fonts={data.fonts} close={() => isModalOpen = false} />
{/if}
