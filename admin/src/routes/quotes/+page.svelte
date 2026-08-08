<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  
  let currentQuote = $state('');
  let originalQuote = $state('');

  function openNew() {
    isEditing = false;
    currentQuote = '';
    originalQuote = '';
    isModalOpen = true;
  }

  function openEdit(quote: string) {
    isEditing = true;
    currentQuote = quote;
    originalQuote = quote;
    isModalOpen = true;
  }
</script>

<svelte:head>
  <title>Manage Quotes | Admin</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-white tracking-tight">Quotes</h1>
      <p class="text-[oklch(0.7107 0.0351 256.79)] mt-2">Manage your collection of quotes.</p>
    </div>
    <button onclick={openNew} class="btn-primary flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      Add Quote
    </button>
  </div>

  {#if form?.error}
    <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
      {form.error}
    </div>
  {/if}

  <div class="grid grid-cols-1 gap-4">
    {#each data.quotes as quote}
      <div class="card p-6 flex flex-col md:flex-row md:justify-between md:items-center group relative overflow-hidden space-y-4 md:space-y-0">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        <p class="text-white text-lg font-medium relative z-10 flex-1 whitespace-pre-wrap">{quote}</p>
        
        <div class="flex space-x-2 md:ml-4 relative z-10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onclick={() => openEdit(quote)} class="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded bg-blue-500/10 font-medium">Edit</button>
          <form method="POST" action="?/delete" use:enhance class="inline">
            <input type="hidden" name="quote" value={quote} />
            <button type="submit" class="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded bg-red-500/10 font-medium" onclick={(e) => !confirm('Are you sure you want to delete this quote?') && e.preventDefault()}>Delete</button>
          </form>
        </div>
      </div>
    {/each}
  </div>
  
  {#if data.quotes.length === 0}
    <div class="card p-8 text-center text-[oklch(0.7107 0.0351 256.79)]">No quotes found. Add some!</div>
  {/if}
</div>

{#if isModalOpen}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-[oklch(0.2795 0.0368 260.03)] border border-[oklch(0.3717 0.0392 257.29)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
      <div class="p-6 border-b border-[oklch(0.3717 0.0392 257.29)] flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">{isEditing ? 'Edit Quote' : 'Add New Quote'}</h2>
        <button aria-label="Close modal" onclick={() => isModalOpen = false} class="text-[oklch(0.7107 0.0351 256.79)] hover:text-white">
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
        {#if isEditing}
          <input type="hidden" name="originalQuote" value={originalQuote} />
        {/if}
        
        <div class="space-y-4">
          <div class="space-y-2">
            <label for="quote-content" class="block text-sm font-medium text-[oklch(0.7107 0.0351 256.79)]">Quote Content</label>
            <textarea id="quote-content" name="quote" bind:value={currentQuote} rows="5" class="input-field resize-none w-full" required placeholder="Enter quote here..."></textarea>
          </div>
        </div>
        
        <div class="mt-8 flex justify-end space-x-4 pt-4 border-t border-[oklch(0.3717 0.0392 257.29)]">
          <button type="button" onclick={() => isModalOpen = false} class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save Quote</button>
        </div>
      </form>
    </div>
  </div>
{/if}
