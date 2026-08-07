import { readData, writeData } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

interface MediaItem {
  id: string;
  type: string;
  rating: number;
  status: string;
  title: string;
  subtitle: string;
  year: number;
  poster_image: string;
}

export const load: PageServerLoad = async () => {
  const media = await readData<MediaItem>('media.json');
  return { media };
};

export const actions: Actions = {
  save: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    const type = data.get('type') as string;
    const rating = Number(data.get('rating'));
    const status = data.get('status') as string;
    const title = data.get('title') as string;
    const subtitle = (data.get('subtitle') as string) || '';
    const year = Number(data.get('year'));
    const poster_image = (data.get('poster_image') as string) || '';
    const isNew = data.get('isNew') === 'true';
    
    if (!id || !title) {
      return fail(400, { error: 'ID and Title are required' });
    }

    const items = await readData<MediaItem>('media.json');
    
    const newItem: MediaItem = { id, type, rating, status, title, subtitle, year, poster_image };
    
    if (isNew) {
      if (items.some(i => i.id === id)) {
        return fail(400, { error: 'ID already exists' });
      }
      items.push(newItem);
    } else {
      const idx = items.findIndex(i => i.id === id);
      if (idx !== -1) {
        items[idx] = newItem;
      } else {
        items.push(newItem);
      }
    }
    
    await writeData('media.json', items);
    return { success: true };
  },
  
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    
    let items = await readData<MediaItem>('media.json');
    items = items.filter(i => i.id !== id);
    
    await writeData('media.json', items);
    return { success: true };
  }
};
