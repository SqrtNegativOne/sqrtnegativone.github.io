import { readData } from '$lib/db';
import type { PageLoad } from './$types';
import type { SkillItem } from '../../../../shared/types';
export type { SkillItem };

export const load: PageLoad = async () => {
  const skills = (await readData<SkillItem>('skills.json')).unwrapOr([] as SkillItem[]);
  return { skills };
};
