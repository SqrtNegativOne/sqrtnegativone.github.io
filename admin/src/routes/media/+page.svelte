<script lang="ts">
  import { ResultAsync, err, ok } from 'neverthrow';
  import { invalidateAll } from '$app/navigation';
  import { invoke } from '@tauri-apps/api/core';
  import { getRepoRoot, readData, writeData } from '$lib/db';
  import MediaTable from './components/MediaTable.svelte';
  import EditModal from './components/EditModal.svelte';
  import SearchModal from './components/SearchModal.svelte';
  import FilterSort from '../../../../shared/components/FilterSort.svelte';
  import { applyFilters, applySorts } from '../../../../shared/utils/mediaFilters';
  import mediaProperties from '../../../../static/media-properties.json';

  interface MediaItem {
    id: string; type: string; rating: number; status: string;
    title: string; tagline: string; description: string; notes: string; poster_image: string; private_notes: string;
  }
  
  interface SearchResult { title?: string; tagline?: string; description?: string; coverUrl?: string; }

  let { data } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let errorMsg = $state('');
  
  let currentItem: MediaItem = $state({
    id: '', type: 'movie', rating: 4, status: 'wishlist',
    title: '', tagline: '', description: '', notes: '', poster_image: '', private_notes: ''
  });
  let isSearching = $state(false);
  let searchError = $state('');
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
    errorMsg = '';
    currentItem = { 
      id: '', type: 'movie', rating: 4, status: 'wishlist',
      title: '', tagline: '', description: '', notes: '', poster_image: '', private_notes: ''
    };
    isModalOpen = true;
  }

  function openEdit(item: MediaItem) {
    isEditing = true;
    errorMsg = '';
    currentItem = { ...item };
    isModalOpen = true;
  }

  async function handleSearch() {
    if (!currentItem.title || !currentItem.type) return;
    isSearching = true;
    searchError = '';
    
    try {
      const root = await getRepoRoot();
      const envText = await invoke<string>('read_file', { path: root + '/.env' });
      const tokenMatch = envText.match(/TMDB_READ_ACCESS_TOKEN=(.*)/);
      const token = tokenMatch ? tokenMatch[1].trim() : '';

      const isMovie = currentItem.type === 'movie';
      const typeStr = isMovie ? 'movie' : 'tv';
      
      const searchRes = await fetch(`https://api.themoviedb.org/3/search/${typeStr}?query=${encodeURIComponent(currentItem.title)}&include_adult=false&language=en-US&page=1`, {
        signal: AbortSignal.timeout(10000),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!searchRes.ok) {
        throw new Error(`Search failed: ${searchRes.statusText}`);
      }

      const resData = await searchRes.json();
      if (resData.results && resData.results.length > 0) {
        searchResults = resData.results.map((r: any) => ({
          title: isMovie ? r.title : r.name,
          tagline: '', 
          description: r.overview,
          coverUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : ''
        }));
        isSearchModalOpen = true;
      } else {
        throw new Error('No results found.');
      }
    } catch (err: any) {
      searchError = err.message || 'Error searching metadata';
    } finally {
      isSearching = false;
    }
  }

  function selectSearchResult(result: SearchResult) {
    if (result.title) currentItem.title = result.title;
    const descParts = [];
    if (result.tagline) descParts.push(result.tagline);
    if (result.description) descParts.push(result.description);
    if (descParts.length > 0) currentItem.description = descParts.join('\n\n');
    if (result.coverUrl) currentItem.poster_image = result.coverUrl;
    
    if (!currentItem.id && result.title) {
      currentItem.id = result.title.toLowerCase().replace(/[^a-z0-9_-]/g, "_").replace(/_+/g, "_");
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

  // --- SAVE / DELETE LOGIC ---
  async function handleSave(e: Event) {
    e.preventDefault();
    errorMsg = '';
    let { id, type, rating, status, title, tagline, description, notes, poster_image, private_notes } = currentItem;
    
    if (!id || !title) {
      errorMsg = 'ID and Title are required';
      return;
    }

    try {
      const root = await getRepoRoot();
      const safeId = id.replace(/[^A-Za-z0-9_-]/g, "_");
      const postersDir = `${root}/static/media-posters`;
      const isNew = !isEditing;

      try {
        await invoke('mkdir', { path: postersDir, recursive: true });
      } catch {
        // Assume exists or ignore
      }

      if (poster_image.startsWith('data:image/')) {
        const matches = poster_image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const base64Data = matches[2].replace(/ /g, '+');
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
          }
          const filename = `${type}_${safeId}.jpg`;
          const filepath = `${postersDir}/${filename}`;
          
          await invoke('write_file_binary', { path: filepath, content: Array.from(bytes) });
          poster_image = `/media-posters/${filename}`;
        }
      } else if (poster_image.startsWith('http://') || poster_image.startsWith('https://')) {
        const res = await fetch(poster_image);
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          const filename = `${type}_${safeId}.jpg`;
          const filepath = `${postersDir}/${filename}`;
          await invoke('write_file_binary', { path: filepath, content: Array.from(bytes) });
          poster_image = `/media-posters/${filename}`;
        }
      }

      // Update media.json
      let items = (await readData<MediaItem>('media.json')).unwrapOr([] as any[]);
      
      const newItem: MediaItem = { id, type, rating, status, title, tagline, description, notes, private_notes, poster_image };
      
      if (isNew) {
        if (items.some(i => i.id === id)) {
          errorMsg = 'ID already exists';
          return;
        }
        items.push(newItem);
      } else {
        const idx = items.findIndex(i => i.id === id);
        if (idx !== -1) items[idx] = newItem;
        else items.push(newItem);
      }
      
      await writeData('media.json', items);

      // Update media-private.json
      let pNotes = (await readData<{id: string, notes: string}>('media-private.json')).unwrapOr([] as any[]);
      if (!Array.isArray(pNotes)) pNotes = [];

      if (private_notes && private_notes.trim()) {
        const pIdx = pNotes.findIndex(n => n.id === id);
        if (pIdx !== -1) {
             pNotes[pIdx].notes = private_notes;
        } else {
             pNotes.push({ id, notes: private_notes });
        }
      } else {
        pNotes = pNotes.filter(n => n.id !== id);
      }
      await writeData('media-private.json', pNotes);

      isModalOpen = false;
      await invalidateAll();
    } catch (err: any) {
      errorMsg = err.message || 'Failed to save media data';
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this media item?')) return;
    errorMsg = '';
    
    try {
      let items = (await readData<MediaItem>('media.json')).unwrapOr([] as any[]);
      items = items.filter(i => i.id !== id);
      await writeData('media.json', items);

      let pNotes = (await readData<{id: string, notes: string}>('media-private.json')).unwrapOr([] as any[]);
      if (Array.isArray(pNotes)) {
          pNotes = pNotes.filter(n => n.id !== id);
          await writeData('media-private.json', pNotes);
      }
      
      isModalOpen = false;
      await invalidateAll();
    } catch (err: any) {
      errorMsg = err.message || 'Could not delete item';
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

  {#if errorMsg}
    <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
      {errorMsg}
    </div>
  {/if}

  <MediaTable {filteredMedia} {openEdit} />
</div>

<EditModal 
  bind:isModalOpen 
  {isEditing} 
  bind:currentItem 
  {isSearching} 
  {searchError}
  {handleSearch} 
  {handlePaste} 
  {handleRatingKeydown}
  {handleSave}
  {handleDelete}
/>

<SearchModal 
  bind:isSearchModalOpen 
  {searchResults} 
  {selectSearchResult} 
/>
