import { readData } from '$lib/db';
import type { PageLoad } from './$types';

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

export const load: PageLoad = async () => {
  const projects = (await readData<ProjectItem>('projects.json')).unwrapOr([] as any[]);
  return { projects };
};
