<script lang="ts">
  import { ResultAsync, err, ok } from 'neverthrow';
  import MediaTable from './components/MediaTable.svelte';
  import EditModal from './components/EditModal.svelte';
  import SearchModal from './components/SearchModal.svelte';
  import FilterSort from '../../../../shared/components/FilterSort.svelte';
  import { applyFilters, applySorts } from '../../../../shared/utils/mediaFilters';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  import mediaProperties from '../../../../static/media-properties.json';

  interface MediaItem {
    id: string; type: string; rating: number; status: string;
    title: string; tagline: string; description: string; notes: string; poster_image: string; private_notes: string;
  }
  
  interface SearchResult { title?: string; tagline?: string; description?: string; coverUrl?: string; }

  let { data, form } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let currentItem: MediaItem = $state({
    id: '', type: 'movie', rating: 4, status: 'wishlist',
    title: '', tagline: '', description: '', notes: '', poster_image: '', private_notes: ''
  });
  let isSearching = $state(false);
  let isSearchModalOpen = $state(false);
  let searchResults: SearchResult[] = $state([]);

  let searchQuery = $state("");
  let filters: { property: string, operator: string, value: any }[] = $state([]);
  let sorts: { property: string, direction: 'asc' | 'desc' }[] = $state([{ property: 'title', direction: 'asc' }]);

  let filteredMedia = $derived(
    applySorts(applyFilters(data.media, filters, searchQuery), sorts)
  );

  function openNew() {
    isEditing = false;
    currentItem = { 
      id: '', type: 'movie', rating: 4, status: 'wishlist',
      title: '', tagline: '', description: '', notes: '', poster_image: '', private_notes: ''
    };
    isModalOpen = true;
  }

  function openEdit(item: MediaItem) {
    isEditing = true;
    currentItem = { ...item };
    isModalOpen = true;
  }

  async function handleSearch() {
    if (!currentItem.title || !currentItem.type) return;
    isSearching = true;
    
    const searchResult = await ResultAsync.fromPromise(
      fetch(`/media/search?type=${currentItem.type}&query=${encodeURIComponent(currentItem.title)}`, {
        signal: AbortSignal.timeout(10000)
      }),
      (e) => {
        const error = e as Error;
        return (error.name === 'TimeoutError' || error.name === 'AbortError') 
          ? new Error("Search timed out. Please try again.") 
          : new Error("Error searching metadata");
      }
    ).andThen((res) => {
      return ResultAsync.fromPromise(
        res.json(),
        () => new Error("Failed to parse response")
      ).andThen((data: any) => {
        if (!res.ok) {
          return err(new Error(`Search failed: ${data.error || 'Not found'}`));
        }
        if (Array.isArray(data) && data.length > 0) {
          return ok(data as SearchResult[]);
        }
        return err(new Error('No results found.'));
      });
    });

    searchResult.match(
      (data) => {
        searchResults = data;
        isSearchModalOpen = true;
      },
      (error) => {
        alert(error.message);
      }
    );

    isSearching = false;
  }

  function selectSearchResult(data: SearchResult) {
    if (data.title) currentItem.title = data.title;
    const descParts = [];
    if (data.tagline) descParts.push(data.tagline);
    if (data.description) descParts.push(data.description);
    if (descParts.length > 0) currentItem.description = descParts.join('\n\n');
    if (data.coverUrl) currentItem.poster_image = data.coverUrl;
    
    if (!currentItem.id && data.title) {
      currentItem.id = data.title.toLowerCase().replace(/[^a-z0-9_-]/g, "_").replace(/_+/g, "_");
    }
    isSearchModalOpen = false;
  }

  function handlePaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = (e) => {
          currentItem.poster_image = e.target?.result as string;
        };
        reader.readAsDataURL(file);
        e.preventDefault();
        break;
      }
    }
  }

  function handleRatingKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentItem.rating = Math.min(7, Math.floor((currentItem.rating || 4) + 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentItem.rating = Math.max(1, Math.ceil((currentItem.rating || 4) - 1));
    }
  }
</script>

<svelte:head>
  <title>Manage Media | Admin</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold text-white">Media Library</h1>
    <button onclick={openNew} class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow transition-colors flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      Add Media
    </button>
  </div>

  <div class="bg-[oklch(0.2795_0.0368_260.03)] border border-[oklch(0.3717_0.0392_257.29)] rounded-xl shadow-lg mb-8 p-4 flex flex-col md:flex-row gap-4">
    <div class="flex-1 flex gap-4">
      <input type="text" bind:value={searchQuery} placeholder="Search media by title or ID..." class="input-field w-full" />
      <div class="h-10">
        <FilterSort bind:filters bind:sorts />
      </div>
    </div>
  </div>

  {#if form?.error}
    <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
      {form.error}
    </div>
  {/if}

  <MediaTable {filteredMedia} {openEdit} />
</div>

<EditModal 
  bind:isModalOpen 
  {isEditing} 
  bind:currentItem 
  {isSearching} 
  {handleSearch} 
  {handlePaste} 
  {handleRatingKeydown} 
/>

<SearchModal 
  bind:isSearchModalOpen 
  {searchResults} 
  {selectSearchResult} 
/>
