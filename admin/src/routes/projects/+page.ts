import { readData } from '$lib/db';
import type { PageLoad } from './$types';
import type { ProjectItem } from '../../../../shared/types';

export const load: PageLoad = async () => {
  const projects = (await readData<ProjectItem>('projects.json')).unwrapOr([] as ProjectItem[]);
  return { projects };
};
