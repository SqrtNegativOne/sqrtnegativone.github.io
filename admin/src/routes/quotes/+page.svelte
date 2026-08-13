<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { getRepoRoot } from '$lib/db';
  import { invoke } from '@tauri-apps/api/core';
  import QuoteCard from './QuoteCard.svelte';
  import QuoteModal from './QuoteModal.svelte';

  interface QuoteItem {
    id: string; quote: string; source: string; link: string; tags: string[];
  }

  let { data } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  
  let currentQuote: QuoteItem = $state({
    id: '',
    quote: '',
    source: '',
    link: '',
    tags: [] as string[]
  });
  
  let tagsInput = $state('');

  function openNew() {
    isEditing = false;
    currentQuote = { id: '', quote: '', source: '', link: '', tags: [] };
    tagsInput = '';
    isModalOpen = true;
  }

  function openEdit(q: QuoteItem) {
    isEditing = true;
    currentQuote = { ...q };
    tagsInput = q.tags.join(', ');
    isModalOpen = true;
  }

  async function readQuotes() {
    try {
      const root = await getRepoRoot();
      const content = await invoke<string>('read_file', { path: `${root}/static/quotes/quotes.json` });
      return JSON.parse(content);
    } catch (e) {
      return [];
    }
  }

  async function writeQuotes(quotes: any[]) {
    const root = await getRepoRoot();
    await invoke('write_file', { path: `${root}/static/quotes/quotes.json`, content: JSON.stringify(quotes, null, 2) });
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    try {
      let quotes = await readQuotes();
      quotes = quotes.filter((q: any) => q.id !== id);
      await writeQuotes(quotes);
      await invalidateAll();
    } catch (e) {
      console.error(e);
      alert('Failed to delete quote');
    }
  }
</script>

<svelte:head>
  <title>Manage Quotes | Admin</title>
</svelte:head>

<div class="space-y-6 max-w-7xl mx-auto">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 class="text-3xl font-bold text-white tracking-tight">Quotes</h1>
      <p class="text-[oklch(0.7107_0.0351_256.79)] mt-2">Manage your collection of quotes.</p>
    </div>
    <button onclick={openNew} class="btn-primary flex items-center shadow-lg hover:shadow-xl transition-all">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      Add Quote
    </button>
  </div>


  <!-- Google Keep Masonry Layout -->
  <div class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
    {#each data.quotes as q (q.id)}
      <QuoteCard item={q} {openEdit} {handleDelete} />
    {/each}
  </div>
  
  {#if data.quotes.length === 0}
    <div class="card p-12 text-center text-[oklch(0.7107_0.0351_256.79)] border-dashed border-2">
      <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
      <p class="text-lg">No quotes found. Add some to get started!</p>
    </div>
  {/if}
</div>

{#if isModalOpen}
  <QuoteModal {isEditing} item={currentQuote} tagsStr={tagsInput} close={() => isModalOpen = false} />
{/if}
