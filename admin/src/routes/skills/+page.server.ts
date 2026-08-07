import { readData, writeData } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

interface SkillItem {
  name: string;
  icon: string;
  logo: string;
  mono: string;
}

export const load: PageServerLoad = async () => {
  const skills = await readData<SkillItem>('skills.json');
  return { skills };
};

export const actions: Actions = {
  save: async ({ request }) => {
    const data = await request.formData();
    const originalName = data.get('originalName') as string;
    const name = data.get('name') as string;
    const icon = (data.get('icon') as string) || '';
    const logo = (data.get('logo') as string) || '';
    const mono = (data.get('mono') as string) || '';
    const isNew = data.get('isNew') === 'true';
    
    if (!name) {
      return fail(400, { error: 'Name is required' });
    }

    const items = await readData<SkillItem>('skills.json');
    const newItem: SkillItem = { name, icon, logo, mono };
    
    if (isNew) {
      if (items.some(i => i.name === name)) {
        return fail(400, { error: 'Skill name already exists' });
      }
      items.push(newItem);
    } else {
      const idx = items.findIndex(i => i.name === originalName);
      if (idx !== -1) {
        items[idx] = newItem;
      } else {
        items.push(newItem);
      }
    }
    
    await writeData('skills.json', items);
    return { success: true };
  },
  
  delete: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name') as string;
    
    let items = await readData<SkillItem>('skills.json');
    items = items.filter(i => i.name !== name);
    
    await writeData('skills.json', items);
    return { success: true };
  }
};
