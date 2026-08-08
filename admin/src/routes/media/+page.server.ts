import { readData, writeData } from '$lib/server/db';
import { encrypt, decrypt } from '$lib/server/crypto';
import { fail } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import type { PageServerLoad, Actions } from './$types';

interface MediaItem {
  id: string;
  type: string;
  rating: number;
  status: string;
  title: string;
  subtitle: string;
  description: string;
  poster_image: string;
  private_notes?: string;
}

interface PrivateNoteItem {
  id: string;
  notes: string;
}

export const load: PageServerLoad = async () => {
  const media = await readData<MediaItem>('media.json');
  let privateNotes = await readData<PrivateNoteItem>('media-private.json');
  
  if (!Array.isArray(privateNotes)) privateNotes = [];

  const notesMap = new Map<string, string>();
  for (const item of privateNotes) {
     notesMap.set(item.id, decrypt(item.notes));
  }

  const mergedMedia = media.map(item => ({
      ...item,
      private_notes: notesMap.get(item.id) || ''
  }));

  return { media: mergedMedia };
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
    const description = (data.get('description') as string) || '';
    const private_notes = (data.get('private_notes') as string) || '';
    let poster_image = (data.get('poster_image') as string) || '';
    const isNew = data.get('isNew') === 'true';
    
    if (!id || !title) {
      return fail(400, { error: 'ID and Title are required' });
    }

    let didSavePoster = false;

    if (poster_image.startsWith('data:image/')) {
      try {
        const matches = poster_image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const base64Data = matches[2].replace(/ /g, '+');
          const buffer = Buffer.from(base64Data, 'base64');
          
          const safeId = id.replace(/[^A-Za-z0-9_-]/g, "_");
          const postersDir = path.resolve(process.cwd(), '../static/media-posters');
          await fs.mkdir(postersDir, { recursive: true });
          
          let filename = `${type}_${safeId}.${ext}`;
          let filepath = path.join(postersDir, filename);

          
          await fs.writeFile(filepath, buffer);
          poster_image = `/media-posters/${filename}`;
          didSavePoster = true;
        }
      } catch (err) {
        console.error('Failed to save pasted image:', err);
      }
    } else if (poster_image.startsWith('http://') || poster_image.startsWith('https://')) {
      try {
        const res = await fetch(poster_image);
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          const ct = res.headers.get("content-type") || "";
          const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
          
          const safeId = id.replace(/[^A-Za-z0-9_-]/g, "_");
          const postersDir = path.resolve(process.cwd(), '../static/media-posters');
          await fs.mkdir(postersDir, { recursive: true });
          
          let filename = `${type}_${safeId}.${ext}`;
          let filepath = path.join(postersDir, filename);
          
          await fs.writeFile(filepath, buffer);
          poster_image = `/media-posters/${filename}`;
          didSavePoster = true;
        }
      } catch (err) {
        console.error('Failed to download image URL:', err);
      }
    }

    const items = await readData<MediaItem>('media.json');
    
    const newItem: MediaItem = { id, type, rating, status, title, subtitle, description, poster_image };
    
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

    // Save private notes
    let privateNotes = await readData<PrivateNoteItem>('media-private.json');
    if (!Array.isArray(privateNotes)) privateNotes = [];

    if (private_notes.trim()) {
        const encrypted = encrypt(private_notes);
        const pIdx = privateNotes.findIndex(n => n.id === id);
        if (pIdx !== -1) {
             privateNotes[pIdx].notes = encrypted;
        } else {
             privateNotes.push({ id, notes: encrypted });
        }
    } else {
        privateNotes = privateNotes.filter(n => n.id !== id);
    }
    await writeData('media-private.json', privateNotes);

    return { success: true };
  },
  
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    
    let items = await readData<MediaItem>('media.json');
    items = items.filter(i => i.id !== id);
    await writeData('media.json', items);

    let privateNotes = await readData<PrivateNoteItem>('media-private.json');
    if (Array.isArray(privateNotes)) {
        privateNotes = privateNotes.filter(n => n.id !== id);
        await writeData('media-private.json', privateNotes);
    }

    return { success: true };
  }
};
