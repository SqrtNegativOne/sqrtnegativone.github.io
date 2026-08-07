<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let currentItem = $state({
    id: '', type: 'movie', rating: 0, status: 'wishlist',
    title: '', subtitle: '', year: new Date().getFullYear(), poster_image: ''
  });

  function openNew() {
    isEditing = false;
    currentItem = {
      id: '', type: 'movie', rating: 0, status: 'wishlist',
      title: '', subtitle: '', year: new Date().getFullYear(), poster_image: ''
    };
    isModalOpen = true;
  }

  function openEdit(item: any) {
    isEditing = true;
    currentItem = { ...item };
    isModalOpen = true;
  }
</script>

<svelte:head>
  <title>Manage Media | Admin</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-white tracking-tight">Media</h1>
      <p class="text-[#94a3b8] mt-2">Manage your books, movies, shows, and games.</p>
    </div>
    <button onclick={openNew} class="btn-primary flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      Add Media
    </button>
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
        {#each data.media as item}
          <tr class="hover:bg-[#334155]/30 transition-colors">
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
                <div class="text-sm text-[#94a3b8]">{item.subtitle} ({item.year || '?'})</div>
              {:else if item.year}
                <div class="text-sm text-[#94a3b8]">{item.year}</div>
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
        {#if data.media.length === 0}
          <tr>
            <td colspan="6" class="p-8 text-center text-[#94a3b8]">No media found. Add some!</td>
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
        <button onclick={() => isModalOpen = false} class="text-[#94a3b8] hover:text-white">
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
            <label class="block text-sm font-medium text-[#94a3b8]">ID (Unique)</label>
            <input type="text" name="id" bind:value={currentItem.id} readonly={isEditing} class="input-field {isEditing ? 'opacity-50 cursor-not-allowed' : ''}" required />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-[#94a3b8]">Type</label>
            <select name="type" bind:value={currentItem.type} class="input-field">
              <option value="book">Book</option>
              <option value="movie">Movie</option>
              <option value="show">Show</option>
              <option value="game">Game</option>
            </select>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-[#94a3b8]">Title</label>
            <input type="text" name="title" bind:value={currentItem.title} class="input-field" required />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-[#94a3b8]">Subtitle</label>
            <input type="text" name="subtitle" bind:value={currentItem.subtitle} class="input-field" />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-[#94a3b8]">Status</label>
            <select name="status" bind:value={currentItem.status} class="input-field">
              <option value="finished">Finished</option>
              <option value="abandoned">Abandoned</option>
              <option value="wishlist">Wishlist</option>
              <option value="rewishlist">Rewishlist</option>
              <option value="next up">Next Up</option>
              <option value="consuming">Consuming</option>
            </select>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-[#94a3b8]">Rating (0-7)</label>
            <input type="number" step="0.1" min="0" max="7" name="rating" bind:value={currentItem.rating} class="input-field" required />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-[#94a3b8]">Year</label>
            <input type="number" name="year" bind:value={currentItem.year} class="input-field" required />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-[#94a3b8]">Poster Image URL</label>
            <input type="text" name="poster_image" bind:value={currentItem.poster_image} class="input-field" />
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
