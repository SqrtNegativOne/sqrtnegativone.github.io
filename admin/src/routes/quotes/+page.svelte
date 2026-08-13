<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { getRepoRoot } from '$lib/db';
  import { invoke } from '@tauri-apps/api/core';

  interface QuoteItem {
    id: string; quote: string; source: string; link: string; tags: string[];
  }

  let { data } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  
  let currentQuote: QuoteItem = $state({
    id: '',
    quote: '',
    source: '',
    link: '',
    tags: [] as string[]
  });
  
  let tagsInput = $state('');
  let importUrl = $state('');
  let isFetching = $state(false);

  async function fetchQuote() {
    if (!importUrl) return;
    isFetching = true;
    try {
      const res = await fetch('/api/parse-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.quote) currentQuote.quote = data.quote;
        if (data.source) currentQuote.source = data.source;
        if (data.link) currentQuote.link = data.link;
        importUrl = '';
      } else {
        alert('Failed to parse quote from URL');
      }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert('Error parsing quote URL');
    } finally {
      isFetching = false;
    }
  }

  function openNew() {
    isEditing = false;
    currentQuote = { id: '', quote: '', source: '', link: '', tags: [] };
    tagsInput = '';
    importUrl = '';
    isFetching = false;
    isModalOpen = true;
  }

  function openEdit(q: QuoteItem) {
    isEditing = true;
    currentQuote = { ...q };
    tagsInput = q.tags.join(', ');
    importUrl = '';
    isFetching = false;
    isModalOpen = true;
  }

  async function readQuotes() {
    try {
      const root = await getRepoRoot();
      const content = await invoke<string>('read_file', { path: `${root}/static/quotes/quotes.json` });
      return JSON.parse(content);
    } catch (e) {
      return [];
    }
  }

  async function writeQuotes(quotes: any[]) {
    const root = await getRepoRoot();
    await invoke('write_file', { path: `${root}/static/quotes/quotes.json`, content: JSON.stringify(quotes, null, 2) });
  }

  async function handleSave(e: Event) {
    e.preventDefault();
    const isNew = !isEditing;
    const id = currentQuote.id;
    const quote = (currentQuote.quote || '').trim();
    const source = (currentQuote.source || '').trim();
    const link = (currentQuote.link || '').trim();
    const tagsStr = tagsInput || '';
    
    const tags = Array.from(new Set(tagsStr.split(',').map(t => t.trim()).filter(t => t)));

    if (!quote) {
      alert('Quote cannot be empty');
      return;
    }

    try {
      const quotes = await readQuotes();
      
      if (isNew) {
        quotes.push({ id: crypto.randomUUID(), quote, source, link, tags });
      } else {
        const index = quotes.findIndex((q: any) => q.id === id);
        if (index !== -1) {
          quotes[index] = { id, quote, source, link, tags };
        } else {
          alert('Original quote not found');
          return;
        }
      }
      
      await writeQuotes(quotes);
      isModalOpen = false;
      await invalidateAll();
    } catch (e) {
      console.error(e);
      alert('Failed to save quote');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    try {
      let quotes = await readQuotes();
      quotes = quotes.filter((q: any) => q.id !== id);
      await writeQuotes(quotes);
      await invalidateAll();
    } catch (e) {
      console.error(e);
      alert('Failed to delete quote');
    }
  }
</script>

<svelte:head>
  <title>Manage Quotes | Admin</title>
</svelte:head>

<div class="space-y-6 max-w-7xl mx-auto">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 class="text-3xl font-bold text-white tracking-tight">Quotes</h1>
      <p class="text-[oklch(0.7107_0.0351_256.79)] mt-2">Manage your collection of quotes.</p>
    </div>
    <button onclick={openNew} class="btn-primary flex items-center shadow-lg hover:shadow-xl transition-all">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      Add Quote
    </button>
  </div>


  <!-- Google Keep Masonry Layout -->
  <div class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
    {#each data.quotes as q (q.id)}
      <div 
        class="card !rounded-lg p-5 group relative break-inside-avoid border border-[oklch(0.3717_0.0392_257.29)] hover:border-[oklch(0.7107_0.0351_256.79)] transition-colors cursor-pointer flex flex-col gap-3"
        onclick={() => openEdit(q)}
        onkeydown={(e) => e.key === 'Enter' && openEdit(q)}
        role="button"
        tabindex="0"
      >
        <p class="text-white text-base whitespace-pre-wrap leading-relaxed">{q.quote}</p>
        
        {#if q.source || q.link}
          <div class="text-sm text-[oklch(0.7107_0.0351_256.79)] border-t border-[oklch(0.3717_0.0392_257.29)] pt-2 mt-2">
            {#if q.source}
              <span class="font-medium">{q.source}</span>
            {/if}
            {#if q.source && q.link}
              <span class="mx-1">•</span>
            {/if}
            {#if q.link}
<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
              <a href={q.link} target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline inline-flex items-center" onclick={(e) => e.stopPropagation()}>
                Link
                <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            {/if}
          </div>
        {/if}
        
        {#if q.tags && q.tags.length > 0}
          <div class="flex flex-wrap gap-1.5 mt-auto pt-2">
            {#each q.tags as tag (tag)}
              <span class="text-xs px-2 py-0.5 rounded-full bg-[oklch(0.3717_0.0392_257.29)] text-[oklch(0.9_0.03_256.79)] border border-[oklch(0.4_0.04_257)]">{tag}</span>
            {/each}
          </div>
        {/if}

        <!-- Hover Actions -->
        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="inline" onclick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              class="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors shadow-sm" 
              onclick={() => handleDelete(q.id)}
              aria-label="Delete quote"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>
  
  {#if data.quotes.length === 0}
    <div class="card p-12 text-center text-[oklch(0.7107_0.0351_256.79)] border-dashed border-2">
      <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
      <p class="text-lg">No quotes found. Add some to get started!</p>
    </div>
  {/if}
</div>

{#if isModalOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onclick={() => isModalOpen = false}>
    <div 
      class="bg-[oklch(0.2795_0.0368_260.03)] border border-[oklch(0.3717_0.0392_257.29)] rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" 
      onclick={(e) => e.stopPropagation()}
    >
      <form onsubmit={handleSave} class="flex flex-col">
        <input type="hidden" name="isNew" value={(!isEditing).toString()} />
        {#if isEditing}
          <input type="hidden" name="id" value={currentQuote.id} />
        {/if}
        
        <div class="p-6 space-y-4">
          <div class="flex gap-2 pb-2 border-b border-[oklch(0.3717_0.0392_257.29)]">
            <input 
              type="url" 
              bind:value={importUrl} 
              placeholder="Paste a link to import (Twitter, Bluesky, Goodreads...)" 
              class="input-field flex-1 text-sm bg-black/20" 
              onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), fetchQuote())}
            />
            <button 
              type="button" 
              onclick={fetchQuote} 
              disabled={isFetching || !importUrl} 
              class="px-4 py-2 text-sm font-medium bg-[oklch(0.2_0.03_260)] hover:bg-[oklch(0.3_0.03_260)] border border-[oklch(0.3717_0.0392_257.29)] rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isFetching}
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Fetching...
              {:else}
                Import
              {/if}
            </button>
          </div>

          <div>
            <textarea 
              name="quote" 
              bind:value={currentQuote.quote} 
              rows="4" 
              class="w-full bg-transparent border-none text-white text-xl focus:ring-0 resize-none placeholder-[oklch(0.7107_0.0351_256.79)]" 
              required 
              placeholder="Take a note..."
            ></textarea>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="source" class="block text-xs font-medium text-[oklch(0.7107_0.0351_256.79)] mb-1 uppercase tracking-wider">Source</label>
              <input type="text" id="source" name="source" bind:value={currentQuote.source} class="input-field w-full text-sm" placeholder="e.g. John Doe, Book Title" />
            </div>
            <div>
              <label for="link" class="block text-xs font-medium text-[oklch(0.7107_0.0351_256.79)] mb-1 uppercase tracking-wider">Link</label>
              <input type="url" id="link" name="link" bind:value={currentQuote.link} class="input-field w-full text-sm" placeholder="https://..." />
            </div>
          </div>
          
          <div>
            <label for="tags" class="block text-xs font-medium text-[oklch(0.7107_0.0351_256.79)] mb-1 uppercase tracking-wider">Tags (comma separated)</label>
            <input type="text" id="tags" name="tags" bind:value={tagsInput} class="input-field w-full text-sm" placeholder="e.g. prefix, afterdark, funny" />
          </div>
        </div>
        
        <div class="px-6 py-3 flex justify-end space-x-3 bg-[oklch(0.2_0.03_260)] border-t border-[oklch(0.3717_0.0392_257.29)]">
          <button type="button" onclick={() => isModalOpen = false} class="px-4 py-2 text-sm font-medium text-[oklch(0.7107_0.0351_256.79)] hover:text-white transition-colors">Close</button>
          <button type="submit" class="px-4 py-2 text-sm font-medium text-[oklch(0.9_0.03_256)] bg-[oklch(0.3717_0.0392_257.29)] hover:bg-[oklch(0.4717_0.0392_257.29)] rounded-lg transition-colors">Save</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .card {
    page-break-inside: avoid;
    break-inside: avoid;
  }
</style>
