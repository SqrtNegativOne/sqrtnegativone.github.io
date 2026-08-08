<script lang="ts">
  import { enhance } from '$app/forms';

  let { isModalOpen = $bindable(), isEditing, currentItem = $bindable(), isSearching, handleSearch, handlePaste, handleRatingKeydown } = $props();
</script>

{#if isModalOpen}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-[#1e293b] border border-[#334155] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
      <div class="p-6 border-b border-[#334155] flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">{isEditing ? 'Edit Media' : 'Add New Media'}</h2>
        <button aria-label="Close modal" onclick={() => isModalOpen = false} class="text-[#94a3b8] hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-6 flex flex-col">
        <form id="save-media-form" method="POST" action="?/save" use:enhance={() => {
          return async ({ result, update }) => {
            if (result.type === 'success') {
              isModalOpen = false;
            }
            update();
          };
        }}>
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

          <div class="space-y-2 md:col-span-2">
            <label for="media-private" class="flex justify-between items-end block text-sm font-medium text-[#94a3b8]">
              <span class="flex items-center text-amber-500/80"><svg class="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Private Notes</span>
            </label>
            <textarea id="media-private" name="private_notes" bind:value={currentItem.private_notes} class="input-field min-h-[100px] resize-y border-amber-500/30 focus:border-amber-500 focus:ring-amber-500/20" placeholder="These notes are encrypted securely and never exposed publicly..."></textarea>
          </div>
          
          <div class="space-y-2">
            <label for="media-status" class="block text-sm font-medium text-[#94a3b8]">Status</label>
            <select id="media-status" name="status" bind:value={currentItem.status} class="input-field">
              <option value="finished">Finished</option>
              <option value="dropped">Dropped</option>
              <option value="shelved">Shelved</option>
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
        </form>
        
        <div class="mt-8 flex justify-between items-center pt-4 border-t border-[#334155]">
          <div>
            {#if isEditing}
              <!-- For action="?/delete", it will target the current route action which is +page.server.ts ?/delete -->
              <form method="POST" action="?/delete" use:enhance class="m-0">
                <input type="hidden" name="id" value={currentItem.id} />
                <button type="submit" class="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-all" onclick={(e) => !confirm('Are you sure you want to delete this media item?') && e.preventDefault()}>
                  Delete
                </button>
              </form>
            {/if}
          </div>
          <div class="flex space-x-4">
            <button type="button" onclick={() => isModalOpen = false} class="btn-secondary">Cancel</button>
            <button type="submit" form="save-media-form" class="btn-primary">Save Media</button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
