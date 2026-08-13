import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import fs from 'fs/promises';
import path from 'path';

const QUOTES_FILE = path.resolve(process.cwd(), '../static/quotes/quotes.json');

export const load: PageServerLoad = async () => {
  try {
    const content = await fs.readFile(QUOTES_FILE, 'utf-8');
    const quotes = JSON.parse(content);
    return { quotes };
  } catch (error) {
    console.error('Error reading quotes.json:', error);
    return { quotes: [] };
  }
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
    
    const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);

    if (!quote) {
      return fail(400, { error: 'Quote cannot be empty' });
    }

    try {
      const content = await fs.readFile(QUOTES_FILE, 'utf-8');
      const quotes = JSON.parse(content);
      
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
      
      await fs.writeFile(QUOTES_FILE, JSON.stringify(quotes, null, 2), 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Error saving quote:', error);
      return fail(500, { error: 'Failed to save quote' });
    }
  },
  
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = (data.get('id') as string || '').trim();
    
    if (!id) {
      return fail(400, { error: 'Quote ID to delete not provided' });
    }

    try {
      const content = await fs.readFile(QUOTES_FILE, 'utf-8');
      let quotes = JSON.parse(content);
      
      quotes = quotes.filter((q: {id: string}) => q.id !== id);
      
      await fs.writeFile(QUOTES_FILE, JSON.stringify(quotes, null, 2), 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Error deleting quote:', error);
      return fail(500, { error: 'Failed to delete quote' });
    }
  }
};
