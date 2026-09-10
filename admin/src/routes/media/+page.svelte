<script lang="ts">
  import MediaTable from './components/MediaTable.svelte';
  import EditModal from './components/EditModal.svelte';
  import SearchModal from './components/SearchModal.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import mediaProperties from '../../../../static/media/media-properties.json';
  import { MediaState, type MediaItem, type SearchResult } from './mediaState.svelte';

  let { data } = $props();
  const state = new MediaState();
  $effect(() => {
    state.data = data;
  });

  const filterProperties = [
    { value: 'type', label: 'Type', type: 'select' as const, options: mediaProperties.types },
    { value: 'status', label: 'Status', type: 'select' as const, options: mediaProperties.statuses },
    { value: 'rating', label: 'Rating', type: 'number' as const },
    { value: 'title', label: 'Title', type: 'text' as const }
  ];
</script>

<svelte:head>
  <title>Manage Media | Admin</title>
</svelte:head>

<div class="space-y-6">
  <SearchBar
    bind:value={state.searchQuery}
    bind:filters={state.filters}
    bind:sorts={state.sorts}
    properties={filterProperties}
    totalCount={data.media?.length || 0}
    filteredCount={state.filteredMedia.length}
    onnew={() => state.openNew()}
  />

  {#if state.errorMsg}
    <div class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded">
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
  handleSave={(e: Event) => state.handleSave(e)}
  handleDelete={(id: string) => state.handleDelete(id)}
/>

<SearchModal 
  bind:isSearchModalOpen={state.isSearchModalOpen}
  searchResults={state.searchResults}
  selectSearchResult={(r: SearchResult) => state.selectSearchResult(r)}
/>
