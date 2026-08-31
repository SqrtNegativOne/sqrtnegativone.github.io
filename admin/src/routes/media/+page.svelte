<script lang="ts">
  import MediaTable from './components/MediaTable.svelte';
  import EditModal from './components/EditModal.svelte';
  import SearchModal from './components/SearchModal.svelte';
  import FilterSort from '../../../../shared/components/FilterSort.svelte';
  import { MediaState, type MediaItem, type SearchResult } from './mediaState.svelte';

  let { data } = $props();
  const state = new MediaState();
  $effect(() => {
    state.data = data;
  });

</script>

<svelte:head>
  <title>Manage Media | Admin</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold text-white">Media Library</h1>
    <button onclick={() => state.openNew()} class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow transition-colors flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      Add Media
    </button>
  </div>

  <div class="bg-[oklch(0.2795_0.0368_260.03)] border border-[oklch(0.3717_0.0392_257.29)] rounded-xl shadow-lg mb-8 p-4 flex flex-col md:flex-row gap-4">
    <div class="flex-1 flex gap-4">
      <input type="text" bind:value={state.searchQuery} placeholder="Search media by title or ID..." class="input-field w-full" />
      <div class="h-10">
        <FilterSort bind:filters={state.filters} bind:sorts={state.sorts} />
      </div>
    </div>
  </div>

  {#if state.errorMsg}
    <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
      {state.errorMsg}
    </div>
  {/if}

  <MediaTable filteredMedia={state.filteredMedia} openEdit={(item: MediaItem) => state.openEdit(item)} />
</div>

<EditModal 
  bind:isModalOpen={state.isModalOpen}
  isEditing={state.isEditing}
  bind:currentItem={state.currentItem}
  isSearching={state.isSearching}
  isSaving={state.isSaving}
  searchError={state.searchError}
  handleSearch={() => state.handleSearch()}
  handlePaste={(e: ClipboardEvent) => state.handlePaste(e)}
  handleRatingKeydown={(e: KeyboardEvent) => state.handleRatingKeydown(e)}
  handleSave={(e: Event) => state.handleSave(e)}
  handleDelete={(id: string) => state.handleDelete(id)}
/>

<SearchModal 
  bind:isSearchModalOpen={state.isSearchModalOpen}
  searchResults={state.searchResults}
  selectSearchResult={(r: SearchResult) => state.selectSearchResult(r)}
/>
