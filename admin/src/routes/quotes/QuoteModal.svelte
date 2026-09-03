<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { ResultAsync, okAsync, errAsync } from 'neverthrow';
  import { safeInvoke, safeJsonParse, safeUrlParse } from '$lib/utils';

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

  function fetchTwitterQuote(url: string): ResultAsync<{ quote: string; source: string }, Error> {
    const match = url.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/);
    if (!match) return errAsync(new Error("Invalid Twitter/X URL format. Expected a link to a specific post."));
    const [_, handle, id] = match;
    
    return safeInvoke<string>('fetch_url', { url: `https://api.fxtwitter.com/${handle}/status/${id}` })
      .andThen(safeJsonParse)
      .andThen((data: any) => {
        if (!data.tweet) return errAsync(new Error("Could not find tweet data."));
        return okAsync({
          quote: data.tweet.text,
          source: `${data.tweet.author.name} (@${data.tweet.author.screen_name})`
        });
      });
  }

  function fetchBlueskyQuote(url: string): ResultAsync<{ quote: string; source: string }, Error> {
    const match = url.match(/bsky\.app\/profile\/([^/]+)\/post\/([^/?#]+)/);
    if (!match) return errAsync(new Error("Invalid Bluesky URL format. Expected a link to a specific post."));
    const [_, handle, id] = match;
    
    return safeInvoke<string>('fetch_url', { url: `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${handle}` })
      .andThen(safeJsonParse)
      .andThen((profile: any) => {
        if (!profile.did) return errAsync(new Error("Could not find Bluesky user profile."));
        return safeInvoke<string>('fetch_url', { url: `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${profile.did}/app.bsky.feed.post/${id}` });
      })
      .andThen(safeJsonParse)
      .andThen((threadData: any) => {
        if (!threadData.thread?.post) return errAsync(new Error("Could not find Bluesky post."));
        const author = threadData.thread.post.author;
        return okAsync({
          quote: threadData.thread.post.record.text,
          source: `${author.displayName || author.handle} (@${author.handle})`
        });
      });
  }

  function fetchGoodreadsQuote(url: string): ResultAsync<{ quote: string; source: string }, Error> {
    return safeInvoke<string>('fetch_url', { url })
      .map(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
        const nameDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
        let quote = ogDesc || nameDesc || '';
        
        const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
        const titleText = doc.querySelector('title')?.textContent || '';
        const title = ogTitle || titleText;

        let source = title;
        const grMatch = title.match(/Quote by ([^:]+):/);
        if (grMatch)
          source = grMatch[1];
        
        if (quote.startsWith('“') && quote.endsWith('”'))
          quote = quote.substring(1, quote.length - 1);
        
        return { quote, source };
      });
  }

  async function fetchQuote() {
    if (!importUrl) return;
    isFetching = true;
    
    const parsedUrlRes = safeUrlParse(importUrl);
    if (parsedUrlRes.isErr()) {
      alert(`Error: ${parsedUrlRes.error.message}`);
      isFetching = false;
      return;
    }
    
    const parsedUrl = parsedUrlRes.value;
    const domain = parsedUrl.hostname.replace(/^www\./, '');
    let resultPromise: ResultAsync<{ quote: string; source: string }, Error>;

    switch (domain) {
      case 'twitter.com':
      case 'x.com':
        resultPromise = fetchTwitterQuote(importUrl);
        break;
      case 'bsky.app':
        resultPromise = fetchBlueskyQuote(importUrl);
        break;
      case 'goodreads.com':
        resultPromise = fetchGoodreadsQuote(importUrl);
        break;
      default:
        alert(`Error: Unsupported URL domain: "${domain}". Please provide a Twitter, Bluesky, or Goodreads URL.`);
        isFetching = false;
        return;
    }

    const fetchResult = await resultPromise;
    
    if (fetchResult.isErr()) {
      console.error(fetchResult.error);
      alert(`Error fetching or parsing URL: ${fetchResult.error.message}`);
      isFetching = false;
      return;
    }

    const result = fetchResult.value;
    if (result.quote || result.source) {
      currentQuote.quote = result.quote;
      currentQuote.source = result.source;
      currentQuote.link = importUrl;
      importUrl = '';
    } else {
      alert(`Failed to extract quote or source from ${importUrl}. The page might not have standard metadata tags.`);
    }
    
    isFetching = false;
  }

  function readQuotes(): ResultAsync<any[], Error> {
    return safeInvoke<string>('get_repo_root')
      .andThen(root => safeInvoke<string>('read_file', { path: `${root}/static/quotes/quotes.json` }))
      .andThen(safeJsonParse)
      .orElse(() => okAsync([])); // Return empty array on any failure
  }

  function writeQuotes(quotes: any[]): ResultAsync<void, Error> {
    return safeInvoke<string>('get_repo_root')
      .andThen(root => safeInvoke<void>('write_file', { path: `${root}/static/quotes/quotes.json`, content: JSON.stringify(quotes, null, 2) }));
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
      alert('Quote cannot be empty');
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
        alert('Original quote not found');
        return;
      }
    }
    
    const writeRes = await writeQuotes(quotes);
    if (writeRes.isErr()) {
      console.error(writeRes.error);
      alert('Failed to save quote');
      return;
    }
    
    close();
    
    const invalidateRes = await ResultAsync.fromPromise(invalidateAll(), (e: unknown) => new Error(String(e)));
    if (invalidateRes.isErr()) {
      console.error(invalidateRes.error);
    }
  }
</script>

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onclick={close}>
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
          <button type="button" onclick={close} class="px-4 py-2 text-sm font-medium text-[oklch(0.7107_0.0351_256.79)] hover:text-white transition-colors">Close</button>
          <button type="submit" class="px-4 py-2 text-sm font-medium text-[oklch(0.9_0.03_256)] bg-[oklch(0.3717_0.0392_257.29)] hover:bg-[oklch(0.4717_0.0392_257.29)] rounded-lg transition-colors">Save</button>
        </div>
      </form>
    </div>
  </div>
