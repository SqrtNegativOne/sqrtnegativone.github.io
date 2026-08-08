import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import fs from 'fs/promises';
import path from 'path';

const QUOTES_FILE = path.resolve(process.cwd(), '../static/quotes.txt');

export const load: PageServerLoad = async () => {
  try {
    const content = await fs.readFile(QUOTES_FILE, 'utf-8');
    // Read and split by \n\n, filter out empty
    const quotes = content.split('\n\n').filter((q: string) => q.trim() !== '');
    return { quotes };
  } catch (error) {
    console.error('Error reading quotes.txt:', error);
    return { quotes: [] };
  }
};

export const actions: Actions = {
  save: async ({ request }) => {
    const data = await request.formData();
    const isNew = data.get('isNew') === 'true';
    const originalQuote = data.get('originalQuote') as string;
    const newQuote = (data.get('quote') as string || '').trim();
    
    if (!newQuote) {
      return fail(400, { error: 'Quote cannot be empty' });
    }

    try {
      let content = await fs.readFile(QUOTES_FILE, 'utf-8');
      let quotes = content.split('\n\n').filter((q: string) => q.trim() !== '');
      
      if (isNew) {
        quotes.push(newQuote);
      } else {
        const index = quotes.findIndex((q: string) => q.trim() === originalQuote.trim());
        if (index !== -1) {
          quotes[index] = newQuote;
        } else {
          return fail(400, { error: 'Original quote not found' });
        }
      }
      
      await fs.writeFile(QUOTES_FILE, quotes.join('\n\n\n'), 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Error saving quote:', error);
      return fail(500, { error: 'Failed to save quote' });
    }
  },
  
  delete: async ({ request }) => {
    const data = await request.formData();
    const quoteToDelete = (data.get('quote') as string || '').trim();
    
    if (!quoteToDelete) {
      return fail(400, { error: 'Quote to delete not provided' });
    }

    try {
      let content = await fs.readFile(QUOTES_FILE, 'utf-8');
      let quotes = content.split('\n\n').filter((q: string) => q.trim() !== '');
      
      quotes = quotes.filter((q: string) => q.trim() !== quoteToDelete);
      
      await fs.writeFile(QUOTES_FILE, quotes.join('\n\n\n'), 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Error deleting quote:', error);
      return fail(500, { error: 'Failed to delete quote' });
    }
  }
};
