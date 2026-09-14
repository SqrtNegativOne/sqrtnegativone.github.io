import { error } from '@sveltejs/kit';
import { getPostBySlug, getAllPosts } from '$lib/blog';
import type { PageLoad, EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => {
  return getAllPosts().map((p) => ({ slug: p.slug }));
};

export const load: PageLoad = ({ params }) => {
  const post = getPostBySlug(params.slug);
  if (!post) {
    throw error(404, 'Post not found');
  }
  return { post };
};
