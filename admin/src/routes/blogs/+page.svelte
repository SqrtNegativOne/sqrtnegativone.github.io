<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { invoke } from '@tauri-apps/api/core';
  import { getRepoRoot } from '$lib/db';
  import { ResultAsync } from 'neverthrow';
  import { notificationState } from '$lib/notificationState.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import EmptyState from '$lib/EmptyState.svelte';
  import { filterAndSortItems, type FilterRule, type SortRule, type FilterProperty } from '$lib/searchUtils';
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
  
  let searchQuery = $state('');
  let filters = $state<FilterRule[]>([]);
  let sorts = $state<SortRule[]>([]);

  let filterProperties = $derived<FilterProperty[]>([
    { value: 'title', label: 'Title', type: 'text' },
    { value: 'date', label: 'Date', type: 'text' },
    {
      value: 'font',
      label: 'Font',
      type: 'select',
      options: (data.fonts || []).map((f: { name: string }) => ({ value: f.name, label: f.name }))
    }
  ]);

  let filteredPosts = $derived(
    filterAndSortItems<BlogItem>({
      items: data.posts || [],
      searchQuery,
      searchFields: ['title', 'description', 'id', 'tags'],
      filters,
      sorts
    })
  );
  
  let currentItem: BlogFormItem = $state({
    id: '', title: '', date: '', description: '', content: '', tags: '', font: 'IBM Plex Sans'
  });

  function openNew(initialTitle = '') {
    isEditing = false;
    const today = new Date().toISOString().split('T')[0];
    currentItem = {
      id: '', title: initialTitle, date: today, description: '', content: '', tags: 'post', font: 'IBM Plex Sans'
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
      notificationState.error(errorMsg, { title: 'Delete Failed' });
      return;
    }
    
    const root = rootRes.value;
    const filepath = `${root}/blog/posts/${id}`;
    const unlinkRes = await ResultAsync.fromPromise(invoke('unlink', { path: filepath }), e => String(e));
    if (unlinkRes.isErr()) {
      errorMsg = unlinkRes.error || 'Could not delete file';
      notificationState.error(errorMsg, { title: 'Delete Failed' });
      return;
    }
    
    notificationState.success(`Blog post "${id}" deleted successfully!`, { title: 'Post Deleted' });
    await invalidateAll();
  }
</script>

<svelte:head>
  <title>Manage Blogs | Admin</title>
</svelte:head>

<div class="space-y-6">
  <SearchBar
    bind:value={searchQuery}
    bind:filters
    bind:sorts
    properties={filterProperties}
    totalCount={data.posts?.length || 0}
    filteredCount={filteredPosts.length}
    onnew={openNew}
  />

  {#if errorMsg}
    <div class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded">
      {errorMsg}
    </div>
  {/if}

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
    {#each filteredPosts as item (item.id)}
      <BlogCard {item} {openEdit} {handleDelete} />
    {/each}
  </div>
  {#if filteredPosts.length === 0}
    <EmptyState
      title={searchQuery || filters.length > 0 ? "No matching blog posts" : "No blog posts found"}
      message={searchQuery || filters.length > 0 ? "Try adjusting your search query or filters." : "You haven't written any posts yet. Start by creating your first blog post!"}
      actionLabel={searchQuery || filters.length > 0 ? undefined : "New Post"}
      onaction={searchQuery || filters.length > 0 ? undefined : openNew}
    />
  {/if}
</div>

{#if isModalOpen}
  <BlogModal {isEditing} item={currentItem} fonts={data.fonts} close={() => isModalOpen = false} />
{/if}
