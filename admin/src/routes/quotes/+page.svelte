<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { readData, writeData } from '$lib/db';
  import { notificationState } from '$lib/notificationState.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import EmptyState from '$lib/EmptyState.svelte';
  import { filterAndSortItems, type FilterRule, type SortRule, type FilterProperty } from '$lib/searchUtils';
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
  let filters = $state<FilterRule[]>([]);
  let sorts = $state<SortRule[]>([]);

  let allTags = $derived(Array.from(new Set((data.quotes || []).flatMap((q: QuoteItem) => q.tags || []))).sort());

  let filterProperties = $derived<FilterProperty[]>([
    {
      value: 'tags',
      label: 'Tag',
      type: 'select',
      options: allTags.map((t: string) => ({ value: t, label: t }))
    },
    { value: 'source', label: 'Source', type: 'text' },
    { value: 'quote', label: 'Quote', type: 'text' }
  ]);

  let filteredQuotes = $derived(
    filterAndSortItems<QuoteItem>({
      items: data.quotes || [],
      searchQuery,
      searchFields: ['quote', 'source', 'tags'],
      filters,
      sorts
    })
  );

  function openNew(initialQuote = '') {
    isEditing = false;
    currentQuote = { id: '', quote: initialQuote, source: '', link: '', tags: [] };
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
  <SearchBar
    bind:value={searchQuery}
    bind:filters
    bind:sorts
    properties={filterProperties}
    totalCount={data.quotes?.length || 0}
    filteredCount={filteredQuotes.length}
    onnew={openNew}
  />

  <!-- Google Keep Masonry Layout -->
  <div class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
    {#each filteredQuotes as q (q.id)}
      <QuoteCard item={q} {openEdit} {handleDelete} />
    {/each}
  </div>
  
  {#if filteredQuotes.length === 0}
    <EmptyState
      title={searchQuery || filters.length > 0 ? 'No matching quotes' : 'No quotes found'}
      message={searchQuery || filters.length > 0 ? 'Try adjusting your search query or filters.' : 'Start collecting quotes and memorable thoughts.'}
      actionLabel={searchQuery || filters.length > 0 ? undefined : 'New Quote'}
      onaction={searchQuery || filters.length > 0 ? undefined : openNew}
    />
  {/if}
</div>

{#if isModalOpen}
  <QuoteModal {isEditing} item={currentQuote} tagsStr={tagsInput} close={() => isModalOpen = false} />
{/if}
