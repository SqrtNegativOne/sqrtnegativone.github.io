import { readData } from '$lib/db';
import type { PageLoad } from './$types';

export interface SocialItem {
  id: string;
  name: string;
  url: string;
  icon: string;
}

export const load: PageLoad = async () => {
  const socials = (await readData<SocialItem>('socials.json')).unwrapOr([] as any[]);
  return { socials };
};
