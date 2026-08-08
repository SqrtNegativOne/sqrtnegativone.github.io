<script lang="ts">
  import MediaTable from './components/MediaTable.svelte';
  import EditModal from './components/EditModal.svelte';
  import SearchModal from './components/SearchModal.svelte';

  let { data, form } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let currentItem: any = $state({
    id: '', type: 'movie', rating: 1, status: 'wishlist',
    title: '', subtitle: '', description: '', poster_image: '', private_notes: ''
  });
  let isSearching = $state(false);
  let isSearchModalOpen = $state(false);
  let searchResults: any[] = $state([]);

  let searchQuery = $state("");
  let typeFilter = $state("all");
  let statusFilter = $state("all");
  let sortOrder = $state("title-asc");

  let filteredMedia = $derived(
    data.media.filter((item: any) => {
      if (searchQuery && !item.title?.toLowerCase().includes(searchQuery.toLowerCase()) && !item.id?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      return true;
    }).sort((a: any, b: any) => {
      if (sortOrder === "title-asc") return (a.title || "").localeCompare(b.title || "");
      if (sortOrder === "title-desc") return (b.title || "").localeCompare(a.title || "");
      if (sortOrder === "rating-desc") return (b.rating || 0) - (a.rating || 0);
      if (sortOrder === "rating-asc") return (a.rating || 0) - (b.rating || 0);
      return 0;
    })
  );

  function openNew() {
    isEditing = false;
    currentItem = { 
      id: '', type: 'movie', rating: 1, status: 'wishlist',
      title: '', subtitle: '', description: '', poster_image: '', private_notes: ''
    };
    isModalOpen = true;
  }

  function openEdit(item: any) {
    isEditing = true;
    currentItem = { ...item };
    isModalOpen = true;
  }

  async function handleSearch() {
    if (!currentItem.title || !currentItem.type) return;
    isSearching = true;
    try {
      const res = await fetch(`/media/search?type=${currentItem.type}&query=${encodeURIComponent(currentItem.title)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          searchResults = data;
          isSearchModalOpen = true;
        } else {
          alert('No results found.');
        }
      } else {
        const err = await res.json();
        alert(`Search failed: ${err.error || 'Not found'}`);
      }
    } catch (err) {
      alert("Error searching metadata");
    } finally {
      isSearching = false;
    }
  }

  function selectSearchResult(data: any) {
    if (data.title) currentItem.title = data.title;
    if (data.subtitle) currentItem.subtitle = data.subtitle;
    if (data.description) currentItem.description = data.description;
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
      currentItem.rating = Math.min(7, Math.floor((currentItem.rating || 1) + 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentItem.rating = Math.max(1, Math.ceil((currentItem.rating || 1) - 1));
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
    <div class="flex-1">
      <input type="text" bind:value={searchQuery} placeholder="Search media by title or ID..." class="input-field w-full" />
    </div>
    <div class="flex gap-4">
      <select bind:value={typeFilter} class="input-field">
        <option value="all">All Types</option>
        <option value="book">Books</option>
        <option value="movie">Movies</option>
        <option value="show">Shows</option>
        <option value="game">Games</option>
      </select>
      <select bind:value={statusFilter} class="input-field">
        <option value="all">All Statuses</option>
        <option value="finished">Finished</option>
        <option value="dropped">Dropped</option>
        <option value="shelved">Shelved</option>
        <option value="wishlist">Wishlist</option>
        <option value="rewishlist">Rewishlist</option>
        <option value="next up">Next Up</option>
        <option value="consuming">Consuming</option>
      </select>
      <select bind:value={sortOrder} class="input-field">
        <option value="title-asc">Title (A-Z)</option>
        <option value="title-desc">Title (Z-A)</option>
        <option value="rating-desc">Rating (High to Low)</option>
        <option value="rating-asc">Rating (Low to High)</option>
      </select>
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
