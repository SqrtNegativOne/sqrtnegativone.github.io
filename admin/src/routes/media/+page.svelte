<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let currentItem: any = $state({
    id: '', type: 'movie', rating: 1, status: 'wishlist',
    title: '', subtitle: '', description: '', poster_image: ''
  });
  let isSearching = $state(false);

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
      title: '', subtitle: '', description: '', poster_image: ''
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
        if (data.title) currentItem.title = data.title;
        if (data.subtitle) currentItem.subtitle = data.subtitle;
        if (data.description) currentItem.description = data.description;
        if (data.coverUrl) currentItem.poster_image = data.coverUrl;
        
        if (!currentItem.id && data.title) {
          currentItem.id = data.title.toLowerCase().replace(/[^a-z0-9_-]/g, "_").replace(/_+/g, "_");
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

    <div class="bg-[#1e293b] border border-[#334155] rounded-xl shadow-lg mb-8 p-4 flex flex-col md:flex-row gap-4">
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
          <option value="abandoned">Abandoned</option>
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

  <div class="card overflow-x-auto">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-[#0f172a] border-b border-[#334155] text-[#94a3b8] text-sm uppercase tracking-wider">
          <th class="p-4 font-medium w-16">Poster</th>
          <th class="p-4 font-medium">Title</th>
          <th class="p-4 font-medium">Type</th>
          <th class="p-4 font-medium">Status</th>
          <th class="p-4 font-medium">Rating</th>
          <th class="p-4 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[#334155]">
        {#each filteredMedia as item}
          <tr class="hover:bg-[#0f172a]/50 transition-colors group">
            <td class="p-4">
              <div class="w-12 h-16 bg-[#1e293b] rounded overflow-hidden flex items-center justify-center shrink-0 border border-[#334155]">
                <img 
                  src={item.poster_image || `/media-posters/${item.type}_${item.id}.jpg`} 
                  alt="Poster"
                  class="w-full h-full object-cover"
                  onerror={(e) => e.currentTarget.style.display = 'none'}
                />
              </div>
            </td>
            <td class="p-4">
              <div class="font-medium text-white">{item.title || item.id}</div>
              {#if item.subtitle}
                <div class="text-sm text-[#94a3b8]">{item.subtitle}</div>
              {/if}
            </td>
            <td class="p-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                {item.type}
              </span>
            </td>
            <td class="p-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                {item.status}
              </span>
            </td>
            <td class="p-4 text-[#94a3b8]">
              {item.rating} / 7
            </td>
            <td class="p-4 text-right space-x-2">
              <button onclick={() => openEdit(item)} class="text-blue-400 hover:text-blue-300">Edit</button>
              <form method="POST" action="?/delete" use:enhance class="inline">
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" class="text-red-400 hover:text-red-300" onclick={(e) => !confirm('Are you sure?') && e.preventDefault()}>Delete</button>
              </form>
            </td>
          </tr>
        {/each}
        {#if filteredMedia.length === 0}
          <tr>
            <td colspan="6" class="p-8 text-center text-[#94a3b8]">No media found matching your filters.</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>

{#if isModalOpen}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-[#1e293b] border border-[#334155] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
      <div class="p-6 border-b border-[#334155] flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">{isEditing ? 'Edit Media' : 'Add New Media'}</h2>
        <button aria-label="Close modal" onclick={() => isModalOpen = false} class="text-[#94a3b8] hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <form method="POST" action="?/save" use:enhance={() => {
        return async ({ result, update }) => {
          if (result.type === 'success') {
            isModalOpen = false;
          }
          update();
        };
      }} class="flex-1 overflow-y-auto p-6">
        <input type="hidden" name="isNew" value={(!isEditing).toString()} />
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label for="media-id" class="block text-sm font-medium text-[#94a3b8]">ID (Unique)</label>
            <input id="media-id" type="text" name="id" bind:value={currentItem.id} readonly={isEditing} class="input-field {isEditing ? 'opacity-50 cursor-not-allowed' : ''}" required />
          </div>
          
          <div class="space-y-2">
            <label for="media-type" class="block text-sm font-medium text-[#94a3b8]">Type</label>
            <select id="media-type" name="type" bind:value={currentItem.type} class="input-field">
              <option value="book">Book</option>
              <option value="movie">Movie</option>
              <option value="show">Show</option>
              <option value="game">Game</option>
            </select>
          </div>
          
          <div class="space-y-2">
            <label for="media-title" class="flex justify-between items-end block text-sm font-medium text-[#94a3b8]">
              <span>Title</span>
              <button type="button" onclick={handleSearch} disabled={isSearching || !currentItem.title} class="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50">
                {isSearching ? 'Searching...' : 'Search Metadata'}
              </button>
            </label>
            <input id="media-title" type="text" name="title" bind:value={currentItem.title} class="input-field" required />
          </div>
          
          <div class="space-y-2 md:col-span-2">
            <label for="media-subtitle" class="block text-sm font-medium text-[#94a3b8]">Subtitle (Optional)</label>
            <input id="media-subtitle" type="text" name="subtitle" bind:value={currentItem.subtitle} class="input-field" placeholder="e.g. Director, Author, or Tagline" />
          </div>

          <div class="space-y-2 md:col-span-2">
            <label for="media-desc" class="block text-sm font-medium text-[#94a3b8]">Description</label>
            <textarea id="media-desc" name="description" bind:value={currentItem.description} class="input-field min-h-[100px] resize-y" placeholder="Extended description..."></textarea>
          </div>
          
          <div class="space-y-2">
            <label for="media-status" class="block text-sm font-medium text-[#94a3b8]">Status</label>
            <select id="media-status" name="status" bind:value={currentItem.status} class="input-field">
              <option value="finished">Finished</option>
              <option value="abandoned">Abandoned</option>
              <option value="wishlist">Wishlist</option>
              <option value="rewishlist">Rewishlist</option>
              <option value="next up">Next Up</option>
              <option value="consuming">Consuming</option>
            </select>
          </div>
          
          <div class="space-y-2">
            <label for="media-rating" class="block text-sm font-medium text-[#94a3b8]">Rating (1-7)</label>
            <input id="media-rating" type="number" step="0.1" min="1" max="7" name="rating" bind:value={currentItem.rating} onkeydown={handleRatingKeydown} class="input-field" required />
          </div>


          
          <div class="space-y-2">
            <label for="media-poster" class="block text-sm font-medium text-[#94a3b8]">Poster Image URL</label>
            <input id="media-poster" type="text" name="poster_image" bind:value={currentItem.poster_image} onpaste={handlePaste} placeholder="URL or paste image here..." class="input-field" />
          </div>
        </div>
        
        <div class="mt-8 flex justify-end space-x-4 pt-4 border-t border-[#334155]">
          <button type="button" onclick={() => isModalOpen = false} class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save Media</button>
        </div>
      </form>
    </div>
  </div>
{/if}
