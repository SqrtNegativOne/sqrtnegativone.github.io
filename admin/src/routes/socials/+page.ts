import { readData } from '$lib/db';
import type { PageLoad } from './$types';
import type { SocialItem } from '../../../../shared/types';
export type { SocialItem };

export const load: PageLoad = async () => {
  const socials = (await readData<SocialItem>('socials.json')).unwrapOr([] as SocialItem[]);
  return { socials };
};
