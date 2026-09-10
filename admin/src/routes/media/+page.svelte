<script lang="ts">
  import MediaTable from './components/MediaTable.svelte';
  import EditModal from './components/EditModal.svelte';
  import SearchModal from './components/SearchModal.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import FullPoster from '$lib/FullPoster.svelte';
  import mediaProperties from '../../../../static/media/media-properties.json';
  import { MediaState, type MediaItem, type SearchResult } from './mediaState.svelte';

  let { data } = $props();
  const media = new MediaState();
  $effect(() => {
    media.data = data;
  });

  let fullPosterUrl: string | null = $state(null);

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
    bind:value={media.searchQuery}
    bind:filters={media.filters}
    bind:sorts={media.sorts}
    properties={filterProperties}
    totalCount={data.media?.length || 0}
    filteredCount={media.filteredMedia.length}
    onnew={(q) => media.openNew(q)}
  />

  {#if media.errorMsg}
    <div class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded">
      {media.errorMsg}
    </div>
  {/if}

  <MediaTable
    filteredMedia={media.filteredMedia}
    openEdit={(item: MediaItem) => media.openEdit(item)}
    openFullPoster={(url: string) => fullPosterUrl = url}
  />
</div>

<EditModal 
  bind:isModalOpen={media.isModalOpen}
  isEditing={media.isEditing}
  bind:currentItem={media.currentItem}
  existingItems={data.media || []}
  isSearching={media.isSearching}
  isSaving={media.isSaving}
  searchError={media.searchError}
  handleSearch={() => media.handleSearch()}
  handlePaste={(e: ClipboardEvent) => media.handlePaste(e)}
  handleSave={(e: Event) => media.handleSave(e)}
  handleDelete={(id: string) => media.handleDelete(id)}
  onOpenExisting={(item: MediaItem) => media.openEdit(item)}
  onOpenPoster={(url: string) => fullPosterUrl = url}
/>

<SearchModal 
  bind:isSearchModalOpen={media.isSearchModalOpen}
  searchResults={media.searchResults}
  selectSearchResult={(r: SearchResult) => media.selectSearchResult(r)}
/>

{#if fullPosterUrl}
  <FullPoster url={fullPosterUrl} onclose={() => fullPosterUrl = null} />
{/if}
