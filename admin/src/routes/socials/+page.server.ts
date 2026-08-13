import { readData, writeData } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

interface SocialItem {
  id: string;
  name: string;
  url: string;
  icon: string;
}

export const load: PageServerLoad = async () => {
  const socials = (await readData<SocialItem>('socials.json')).unwrapOr([] as any[]);
  return { socials };
};

export const actions: Actions = {
  save: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    const name = data.get('name') as string;
    const url = (data.get('url') as string) || '';
    const icon = (data.get('icon') as string) || '';
    const isNew = data.get('isNew') === 'true';
    
    if (!id || !name) {
      return fail(400, { error: 'ID and Name are required' });
    }

    const items = (await readData<SocialItem>('socials.json')).unwrapOr([] as any[]);
    const newItem: SocialItem = { id, name, url, icon };
    
    if (isNew) {
      if (items.some(i => i.id === id)) {
        return fail(400, { error: 'Social ID already exists' });
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
    
    const writeRes = await writeData('socials.json', items);
    if (writeRes.isErr()) return fail(500, { error: 'Failed to write social data' });
    return { success: true };
  },
  
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    
    let items = (await readData<SocialItem>('socials.json')).unwrapOr([] as any[]);
    items = items.filter(i => i.id !== id);
    
    const writeRes = await writeData('socials.json', items);
    if (writeRes.isErr()) return fail(500, { error: 'Failed to delete social data' });
    return { success: true };
  },

  move: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    const direction = data.get('direction') as string;
    
    const items = (await readData<SocialItem>('socials.json')).unwrapOr([] as any[]);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return fail(400, { error: 'Social not found' });
    
    if (direction === 'up' && idx > 0) {
      const temp = items[idx - 1];
      items[idx - 1] = items[idx];
      items[idx] = temp;
    } else if (direction === 'down' && idx < items.length - 1) {
      const temp = items[idx + 1];
      items[idx + 1] = items[idx];
      items[idx] = temp;
    }
    
    const writeRes = await writeData('socials.json', items);
    if (writeRes.isErr()) return fail(500, { error: 'Failed to update social data' });
    return { success: true };
  }
};
