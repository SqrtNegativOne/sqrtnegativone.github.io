import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import fs from 'fs/promises';
import path from 'path';
import { ResultAsync, ok, err } from 'neverthrow';

const QUOTES_FILE = path.resolve(process.cwd(), '../static/quotes/quotes.json');

function readQuotes(): ResultAsync<any[], Error> {
  return ResultAsync.fromPromise(fs.readFile(QUOTES_FILE, 'utf-8'), e => e as Error)
    .andThen(content => {
      try {
        return ok(JSON.parse(content));
      } catch (e) {
        return err(e as Error);
      }
    });
}

function writeQuotes(quotes: any[]): ResultAsync<void, Error> {
  return ResultAsync.fromPromise(
    fs.writeFile(QUOTES_FILE, JSON.stringify(quotes, null, 2), 'utf-8'),
    e => e as Error
  );
}

export const load: PageServerLoad = async () => {
  const quotesRes = await readQuotes();
  if (quotesRes.isErr()) {
    console.error('Error reading quotes.json:', quotesRes.error);
    return { quotes: [] };
  }
  return { quotes: quotesRes.value };
};

export const actions: Actions = {
  save: async ({ request }) => {
    const data = await request.formData();
    const isNew = data.get('isNew') === 'true';
    const id = data.get('id') as string;
    const quote = (data.get('quote') as string || '').trim();
    const source = (data.get('source') as string || '').trim();
    const link = (data.get('link') as string || '').trim();
    const tagsStr = data.get('tags') as string || '';
    
    const tags = Array.from(new Set(tagsStr.split(',').map(t => t.trim()).filter(t => t)));

    if (!quote) {
      return fail(400, { error: 'Quote cannot be empty' });
    }

    const quotesRes = await readQuotes();
    if (quotesRes.isErr()) {
      return fail(500, { error: 'Failed to read quotes' });
    }
    const quotes = quotesRes.value;

    if (isNew) {
      quotes.push({ id: crypto.randomUUID(), quote, source, link, tags });
    } else {
      const index = quotes.findIndex((q: {id: string}) => q.id === id);
      if (index !== -1) {
        quotes[index] = { id, quote, source, link, tags };
      } else {
        return fail(400, { error: 'Original quote not found' });
      }
    }
    
    const writeRes = await writeQuotes(quotes);
    if (writeRes.isErr()) {
      console.error('Error saving quote:', writeRes.error);
      return fail(500, { error: 'Failed to save quote' });
    }
    return { success: true };
  },
  
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = (data.get('id') as string || '').trim();
    
    if (!id) {
      return fail(400, { error: 'Quote ID to delete not provided' });
    }

    const quotesRes = await readQuotes();
    if (quotesRes.isErr()) {
      return fail(500, { error: 'Failed to read quotes for deletion' });
    }
    
    let quotes = quotesRes.value;
    quotes = quotes.filter((q: {id: string}) => q.id !== id);
    
    const writeRes = await writeQuotes(quotes);
    if (writeRes.isErr()) {
      console.error('Error deleting quote:', writeRes.error);
      return fail(500, { error: 'Failed to delete quote' });
    }
    return { success: true };
  }
};
