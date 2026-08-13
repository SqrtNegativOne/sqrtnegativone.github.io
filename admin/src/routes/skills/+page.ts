import { readData } from '$lib/db';
import type { PageLoad } from './$types';

export interface SkillItem {
  name: string;
  icon: string;
  logo: string;
  mono: string;
}

export const load: PageLoad = async () => {
  const skills = (await readData<SkillItem>('skills.json')).unwrapOr([] as any[]);
  return { skills };
};
