<script lang="ts">
  import { onMount } from 'svelte';
  import EditModal from './components/EditModal.svelte';
  import SearchModal from './components/SearchModal.svelte';
  import MediaLogTab from './MediaLogTab.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import FullPoster from '$lib/FullPoster.svelte';
  import { assetState } from '$lib/assetState.svelte';
  import MediaInfo from '../../../../shared/components/MediaInfo.svelte';
  import MediaGallery from '../../../../shared/components/MediaGallery.svelte';
  import MediaTable from '../../../../shared/components/MediaTable.svelte';
  import MediaViewToggle from '../../../../shared/components/MediaViewToggle.svelte';
  import { groupMediaByType, type MediaViewMode } from '../../../../shared/lib/mediaLibrary';
  import mediaProperties from '../../../../site/static/media/media-properties.json';
  import { MediaState, type MediaItem, type SearchResult } from './mediaState.svelte';
  import { mediaLogState } from './mediaLogState.svelte';

  let { data } = $props();
  const media = new MediaState();
  $effect(() => {
    media.data = data;
  });

  let tab = $state<'library' | 'log'>('library');
  let logTargetId = $state<string | null>(null);
  let fullPosterUrl: string | null = $state(null);
  let viewMode = $state<MediaViewMode>('gallery');

  onMount(() => {
    void mediaLogState.load();
  });

  const groups = $derived(groupMediaByType(media.filteredMedia));

  const allTags = $derived(
    Array.from(new Set((data.media || []).flatMap((m: MediaItem) => m.tags || []))).sort()
  );

  const filterProperties = $derived([
    { value: 'type', label: 'Type', type: 'select' as const, options: mediaProperties.types },
    { value: 'status', label: 'Status', type: 'select' as const, options: mediaProperties.statuses },
    { value: 'tags', label: 'Tag', type: 'select' as const, options: allTags.map((t) => ({ value: t, label: t })) },
    { value: 'rating', label: 'Rating', type: 'number' as const },
    { value: 'title', label: 'Title', type: 'text' as const }
  ]);

  const resolveAsset = (url: string) => assetState.resolve(url);
</script>

<svelte:head>
  <title>Manage Media | Admin</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="inline-flex items-center gap-1 rounded-lg border border-[oklch(0.2739_0.0055_286.03)] bg-white/[0.02] p-1">
      <button
        type="button"
        onclick={() => tab = 'library'}
        class="rounded px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors {tab === 'library'
          ? 'bg-blue-500/15 text-blue-300'
          : 'text-[oklch(0.7107_0.0351_256.79)] hover:bg-white/5'}"
      >
        Library
      </button>
      <button
        type="button"
        onclick={() => tab = 'log'}
        class="rounded px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors {tab === 'log'
          ? 'bg-blue-500/15 text-blue-300'
          : 'text-[oklch(0.7107_0.0351_256.79)] hover:bg-white/5'}"
      >
        Log
      </button>
    </div>
    <MediaInfo />
  </div>

  {#if tab === 'library'}
    <div class="flex items-start gap-3">
      <div class="flex-1 min-w-0">
        <SearchBar
          bind:value={media.searchQuery}
          bind:filters={media.filters}
          bind:sorts={media.sorts}
          properties={filterProperties}
          totalCount={data.media?.length || 0}
          filteredCount={media.filteredMedia.length}
          onnew={(q) => media.openNew(q)}
        />
      </div>
      <MediaViewToggle bind:viewMode storageKey="admin-media-view-mode" />
    </div>

    {#if media.errorMsg}
      <div class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded">
        {media.errorMsg}
      </div>
    {/if}

    {#if media.filteredMedia.length === 0}
      <div class="card p-8 text-center text-[oklch(0.7107_0.0351_256.79)]">
        No media found matching your filters.
      </div>
    {:else if viewMode === 'gallery'}
      <MediaGallery
        groups={groups}
        openDetails={(item: MediaItem) => media.openEdit(item)}
        {resolveAsset}
      />
    {:else}
      <MediaTable
        groups={groups}
        sorts={media.sorts}
        toggleSort={(column: string) => media.toggleSort(column)}
        openDetails={(item: MediaItem) => media.openEdit(item)}
        openFullPoster={(url: string) => fullPosterUrl = url}
        {resolveAsset}
      />
    {/if}
  {:else}
    <MediaLogTab
      media={data.media || []}
      initialMediaId={logTargetId}
      onInitialConsumed={() => logTargetId = null}
      onOpenItem={(item: MediaItem) => {
        tab = 'library';
        media.openEdit(item);
      }}
    />
  {/if}
</div>

<EditModal
  bind:isModalOpen={media.isModalOpen}
  isEditing={media.isEditing}
  bind:currentItem={media.currentItem}
  existingItems={data.media || []}
  history={mediaLogState.groupFor(media.currentItem.id)}
  isSearching={media.isSearching}
  isSaving={media.isSaving}
  dirty={media.isDirty}
  isSearchModalOpen={media.isSearchModalOpen}
  searchError={media.searchError}
  handleSearch={() => media.handleSearch()}
  handlePaste={(e: ClipboardEvent) => media.handlePaste(e)}
  handleSave={(e: Event) => media.handleSave(e)}
  handleDelete={(id: string) => media.handleDelete(id)}
  onOpenExisting={(item: MediaItem) => media.openEdit(item)}
  onOpenPoster={(url: string) => fullPosterUrl = url}
  onOpenLog={() => {
    logTargetId = media.currentItem.id || null;
    media.isModalOpen = false;
    tab = 'log';
  }}
/>

<SearchModal
  bind:isSearchModalOpen={media.isSearchModalOpen}
  searchResults={media.searchResults}
  selectSearchResult={(r: SearchResult) => media.selectSearchResult(r)}
/>

{#if fullPosterUrl}
  <FullPoster url={fullPosterUrl} onclose={() => fullPosterUrl = null} />
{/if}
