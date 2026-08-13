import { readData, writeData } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import fs from 'node:fs/promises';
import path from 'node:path';

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  github: string | null;
  url: string | null;
  image: string;
  private?: boolean;
}

export const load: PageServerLoad = async () => {
  const projects = (await readData<ProjectItem>('projects.json')).unwrapOr([] as any[]);
  return { projects };
};

export const actions: Actions = {
  save: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    const name = data.get('name') as string;
    const description = data.get('description') as string;
    const tagsStr = data.get('tags') as string;
    const github = data.get('github') as string;
    const url = data.get('url') as string;
    let image = data.get('image') as string;
    const imageFile = data.get('imageFile') as File | null;
    const isPrivate = data.get('private') === 'true';
    const isNew = data.get('isNew') === 'true';
    
    if (!id || !name) {
      return fail(400, { error: 'ID and Name are required' });
    }

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      
      let ext = imageFile.name.split('.').pop();
      if (!ext || ext === 'blob' || ext === 'image') {
         if (imageFile.type === 'image/jpeg') ext = 'jpg';
         else if (imageFile.type === 'image/webp') ext = 'webp';
         else ext = 'png';
      }
      
      const safeId = id.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${safeId}-${Date.now()}.${ext}`;
      
      const filepath = path.join(process.cwd(), '..', 'static', 'projects', fileName);
      await fs.writeFile(filepath, buffer);
      image = `/projects/${fileName}`;
    }

    const items = (await readData<ProjectItem>('projects.json')).unwrapOr([] as any[]);
    
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
    
    const newItem: ProjectItem = { 
      id, 
      name, 
      description, 
      tags, 
      github: github || null, 
      url: url || null, 
      image,
      private: isPrivate
    };
    
    // Remove undefined/false private if not private to match original data styling
    if (!isPrivate) {
      delete newItem.private;
    }
    
    if (isNew) {
      if (items.some(i => i.id === id)) {
        return fail(400, { error: 'Project ID already exists' });
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
    
    const writeRes = await writeData('projects.json', items);
    if (writeRes.isErr()) return fail(500, { error: 'Failed to write project data' });
    return { success: true };
  },
  
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    
    let items = (await readData<ProjectItem>('projects.json')).unwrapOr([] as any[]);
    items = items.filter(i => i.id !== id);
    
    const writeRes = await writeData('projects.json', items);
    if (writeRes.isErr()) return fail(500, { error: 'Failed to delete project data' });
    return { success: true };
  },
  
  move: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    const direction = data.get('direction') as string;
    
    const items = (await readData<ProjectItem>('projects.json')).unwrapOr([] as any[]);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return fail(400, { error: 'Project not found' });
    
    if (direction === 'up' && idx > 0) {
      const temp = items[idx - 1];
      items[idx - 1] = items[idx];
      items[idx] = temp;
    } else if (direction === 'down' && idx < items.length - 1) {
      const temp = items[idx + 1];
      items[idx + 1] = items[idx];
      items[idx] = temp;
    }
    
    const writeRes = await writeData('projects.json', items);
    if (writeRes.isErr()) return fail(500, { error: 'Failed to update project data' });
    return { success: true };
  }
};
