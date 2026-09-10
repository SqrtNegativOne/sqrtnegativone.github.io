<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ResultAsync } from 'neverthrow';
  import { safeUrlParse } from '$lib/utils';
  import { readData, writeData } from '$lib/db';
  import { notificationState } from '$lib/notificationState.svelte';
  import Modal from '$lib/Modal.svelte';
  import { findQuoteProvider, quoteProviders } from './providers';

  import type { QuoteItem } from '../../../../shared/types';

  let { isEditing, item, tagsStr, close } = $props<{
    isEditing: boolean;
    item: QuoteItem;
    tagsStr: string;
    close: () => void;
  }>();

  // svelte-ignore state_referenced_locally
  let currentQuote = $state({ ...item });
  // svelte-ignore state_referenced_locally
  let tagsInput = $state(tagsStr);
  let importUrl = $state('');
  let isFetching = $state(false);
  let quoteInput: HTMLTextAreaElement | undefined = $state();

  onMount(() => quoteInput?.focus());

  async function fetchQuote() {
    if (!importUrl) return;
    isFetching = true;
    
    const parsedUrlRes = safeUrlParse(importUrl);
    if (parsedUrlRes.isErr()) {
      notificationState.error(parsedUrlRes.error.message, { title: 'Invalid URL' });
      isFetching = false;
      return;
    }
    
    const parsedUrl = parsedUrlRes.value;
    const provider = findQuoteProvider(parsedUrl);
    
    if (!provider) {
      const supported = quoteProviders.map((p) => p.name).join(', ');
      notificationState.error(`Unsupported URL. Please provide a link from: ${supported}.`, { title: 'Unsupported Domain' });
      isFetching = false;
      return;
    }

    const fetchResult = await provider.fetch(parsedUrl);
    
    if (fetchResult.isErr()) {
      console.error(fetchResult.error);
      notificationState.error(fetchResult.error.message, { title: 'Failed to import quote' });
      isFetching = false;
      return;
    }

    const result = fetchResult.value;
    if (result.quote || result.source) {
      currentQuote.quote = result.quote;
      currentQuote.source = result.source;
      currentQuote.link = importUrl;
      importUrl = '';
      notificationState.success('Quote imported successfully!', { title: 'Import Successful' });
    } else {
      notificationState.error(`Failed to extract quote or source from ${importUrl}. The page might not have standard metadata tags.`, { title: 'Extraction Failed' });
    }
    
    isFetching = false;
  }

  function readQuotes(): ResultAsync<any[], Error> {
    return readData('quotes');
  }

  function writeQuotes(quotes: any[]): ResultAsync<void, Error> {
    return writeData('quotes', quotes);
  }

  async function handleSave(e: Event) {
    e.preventDefault();
    const isNew = !isEditing;
    const id = currentQuote.id;
    const quote = (currentQuote.quote || '').trim();
    const source = (currentQuote.source || '').trim();
    const link = (currentQuote.link || '').trim();
    const tagsStrParsed = tagsInput || '';
    
    const tags = Array.from(new Set(tagsStrParsed.split(',').map((t: string) => t.trim()).filter((t: string) => t)));

    if (!quote) {
      notificationState.error('Quote cannot be empty', { title: 'Validation Error' });
      return;
    }

    const quotesRes = await readQuotes();
    const quotes = quotesRes.isOk() ? quotesRes.value : [];
    
    if (isNew) {
      quotes.push({ id: crypto.randomUUID(), quote, source, link, tags });
    } else {
      const index = quotes.findIndex((q: any) => q.id === id);
      if (index !== -1) {
        quotes[index] = { id, quote, source, link, tags };
      } else {
        notificationState.error('Original quote not found', { title: 'Save Failed' });
        return;
      }
    }
    
    const writeRes = await writeQuotes(quotes);
    if (writeRes.isErr()) {
      console.error(writeRes.error);
      notificationState.error(writeRes.error.message, { title: 'Failed to save quote' });
      return;
    }
    
    notificationState.success('Quote saved successfully!', { title: 'Quote Saved' });
    close();
    
    const invalidateRes = await ResultAsync.fromPromise(invalidateAll(), (e: unknown) => new Error(String(e)));
    if (invalidateRes.isErr()) {
      console.error(invalidateRes.error);
    }
  }
</script>

<Modal
  title={isEditing ? 'Edit Quote' : 'New Quote'}
  maxWidth="2xl"
  onclose={close}
>
  <form id="quote-form" onsubmit={handleSave} class="space-y-4">
    <input type="hidden" name="isNew" value={(!isEditing).toString()} />
    {#if isEditing}
      <input type="hidden" name="id" value={currentQuote.id} />
    {/if}
    
    <div class="flex gap-2 pb-2 border-b border-[oklch(0.2739_0.0055_286.03)]">
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
        class="btn-secondary text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {#if isFetching}
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        {:else}
          Import
        {/if}
      </button>
    </div>

    <div>
      <textarea 
        name="quote" 
        bind:this={quoteInput}
        bind:value={currentQuote.quote} 
        rows="4" 
        class="w-full bg-transparent border-none text-white text-xl focus:ring-0 resize-none placeholder-[oklch(0.60_0.02_256.79)]" 
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
  </form>

  {#snippet footer()}
    <button type="button" onclick={close} class="btn-secondary">Cancel</button>
    <button type="submit" form="quote-form" class="btn-primary">Save Quote</button>
  {/snippet}
</Modal>
