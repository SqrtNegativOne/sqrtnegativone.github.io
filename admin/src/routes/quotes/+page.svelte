<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { readData, writeData } from '$lib/db';
  import { notificationState } from '$lib/notificationState.svelte';
  import PageHeader from '$lib/PageHeader.svelte';
  import EmptyState from '$lib/EmptyState.svelte';
  import SearchInput from '$lib/SearchInput.svelte';
  import QuoteCard from './QuoteCard.svelte';
  import QuoteModal from './QuoteModal.svelte';

  import type { QuoteItem } from '../../../../shared/types';

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

  let searchQuery = $state('');
  let selectedTag = $state('');

  let filteredQuotes = $derived((data.quotes || []).filter((q: QuoteItem) => {
    const s = searchQuery.toLowerCase();
    const matchesSearch = s === '' || 
      q.quote?.toLowerCase().includes(s) || 
      q.source?.toLowerCase().includes(s);
    
    const matchesTag = selectedTag === '' || (q.tags && q.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  }));

  let allTags = $derived(Array.from(new Set((data.quotes || []).flatMap((q: QuoteItem) => q.tags || []))).sort());

  function openNew() {
    isEditing = false;
    currentQuote = { id: '', quote: '', source: '', link: '', tags: [] };
    tagsInput = '';
    isModalOpen = true;
  }

  function openEdit(q: QuoteItem) {
    isEditing = true;
    currentQuote = { ...q };
    tagsInput = q.tags?.join(', ') || '';
    isModalOpen = true;
  }

  function readQuotes() {
    return readData<QuoteItem>('quotes');
  }

  function writeQuotes(quotes: any[]) {
    return writeData('quotes', quotes);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    
    const readRes = await readQuotes();
    const quotes = readRes.unwrapOr([]).filter((q: any) => q.id !== id);
    
    const writeRes = await writeQuotes(quotes);
    if (writeRes.isErr()) {
      notificationState.error(writeRes.error.message, { title: 'Failed to delete quote' });
      return;
    }

    notificationState.success('Quote deleted successfully', { title: 'Quote Deleted' });
    await invalidateAll();
  }
</script>

<svelte:head>
  <title>Manage Quotes | Admin</title>
</svelte:head>

<div class="space-y-6">
  <PageHeader title="Quotes" actionLabel="New Quote" onaction={openNew} />

  <div class="flex flex-col sm:flex-row gap-4 bg-[oklch(0.2103_0.0059_285.89)] p-4 rounded-xl border border-[oklch(0.2739_0.0055_286.03)] shadow-sm">
    <SearchInput
      bind:value={searchQuery}
      placeholder="Search quotes or sources..."
    />
    
    <div class="sm:w-48 relative">
      <select bind:value={selectedTag} class="input-field appearance-none pr-8 text-sm">
        <option value="">All Tags</option>
        {#each allTags as tag (tag)}
          <option value={tag}>{tag}</option>
        {/each}
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[oklch(0.7107_0.0351_256.79)]">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>

  {#if searchQuery !== '' || selectedTag !== ''}
    <div class="text-sm text-[oklch(0.7107_0.0351_256.79)]">
      Showing {filteredQuotes.length} {filteredQuotes.length === 1 ? 'quote' : 'quotes'}
      {#if selectedTag} matching tag <span class="text-white font-medium">"{selectedTag}"</span>{/if}
      {#if searchQuery}{#if selectedTag} and{/if} matching search <span class="text-white font-medium">"{searchQuery}"</span>{/if}
    </div>
  {/if}

  <!-- Google Keep Masonry Layout -->
  <div class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
    {#each filteredQuotes as q (q.id)}
      <QuoteCard item={q} {openEdit} {handleDelete} />
    {/each}
  </div>
  
  {#if filteredQuotes.length === 0}
    <EmptyState
      title={searchQuery || selectedTag ? 'No matching quotes' : 'No quotes found'}
      message={searchQuery || selectedTag ? 'Try adjusting your search query or tag filter.' : 'Start collecting quotes and memorable thoughts.'}
      actionLabel={searchQuery || selectedTag ? undefined : 'New Quote'}
      onaction={searchQuery || selectedTag ? undefined : openNew}
    />
  {/if}
</div>

{#if isModalOpen}
  <QuoteModal {isEditing} item={currentQuote} tagsStr={tagsInput} close={() => isModalOpen = false} />
{/if}
