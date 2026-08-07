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

{#snippet typeBadge(type)}
  {#if type === 'book'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
      {type}
    </span>
  {:else if type === 'movie'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>
      {type}
    </span>
  {:else if type === 'show'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
      {type}
    </span>
  {:else if type === 'game'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
      {type}
    </span>
  {:else}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20 capitalize">
      {type}
    </span>
  {/if}
{/snippet}

{#snippet statusBadge(status)}
  {#if status === 'finished'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      {status}
    </span>
  {:else if status === 'abandoned'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      {status}
    </span>
  {:else if status === 'wishlist'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
      {status}
    </span>
  {:else if status === 'rewishlist'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
      {status}
    </span>
  {:else if status === 'next up'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      {status}
    </span>
  {:else if status === 'consuming'}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 capitalize">
      <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
      {status}
    </span>
  {:else}
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20 capitalize">
      {status}
    </span>
  {/if}
{/snippet}

{#snippet ratingDisplay(rating)}
  {@const percent = (rating / 7) * 100}
  {@const colorClass = rating >= 6 ? 'text-emerald-400' : rating >= 4 ? 'text-blue-400' : rating >= 2 ? 'text-amber-400' : 'text-red-400'}
  {@const bgClass = rating >= 6 ? 'text-emerald-500/20' : rating >= 4 ? 'text-blue-500/20' : rating >= 2 ? 'text-amber-500/20' : 'text-red-500/20'}
  
  <div class="flex items-center gap-2">
    <div class="relative w-5 h-5 flex items-center justify-center shrink-0">
      <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path class="{bgClass}" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        <path class="{colorClass}" stroke-width="3" stroke-dasharray="{percent}, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
      </svg>
    </div>
    <span class="font-medium {colorClass}">{rating}</span>
  </div>
{/snippet}

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
          <th class="p-4 font-medium w-24">Type</th>
          <th class="p-4 font-medium w-32">Status</th>
          <th class="p-4 font-medium w-24">Rating</th>
          <th class="p-4 font-medium text-right w-24">Actions</th>
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
              {@render typeBadge(item.type)}
            </td>
            <td class="p-4">
              {@render statusBadge(item.status)}
            </td>
            <td class="p-4">
              {@render ratingDisplay(item.rating)}
            </td>
            <td class="p-4">
              <div class="flex justify-end items-center gap-2">
                <button title="Edit" onclick={() => openEdit(item)} class="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-md transition-all" aria-label="Edit">
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <form method="POST" action="?/delete" use:enhance class="inline-flex m-0">
                  <input type="hidden" name="id" value={item.id} />
                  <button title="Delete" type="submit" class="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-all" aria-label="Delete" onclick={(e) => !confirm('Are you sure?') && e.preventDefault()}>
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </form>
              </div>
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
