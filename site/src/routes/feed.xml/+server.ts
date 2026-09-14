import { Feed } from 'feed';
import { getPublicPosts } from '$lib/blog';
import type { RequestHandler } from './$types';

export const prerender = true;

const SITE_URL = 'https://sqrt.fyi';

export const GET: RequestHandler = () => {
  const posts = getPublicPosts().slice(0, 20);

  const feed = new Feed({
    title: 'The Blog of Sqrt-1',
    description: 'Nothing particularly special about it.',
    id: `${SITE_URL}/blog/`,
    link: `${SITE_URL}/blog/`,
    feedLinks: {
      atom: `${SITE_URL}/feed.xml`
    },
    copyright: 'Ark Malhotra',
    author: {
      name: 'Ark Malhotra',
      link: `${SITE_URL}/`
    },
    updated: posts.length > 0 ? new Date(posts[0].date) : new Date()
  });

  for (const post of posts) {
    const postUrl = `${SITE_URL}/blog/${post.slug}/`;
    feed.addItem({
      title: post.title,
      id: postUrl,
      link: postUrl,
      description: post.description,
      content: post.content,
      date: new Date(post.date)
    });
  }

  return new Response(feed.atom1(), {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8'
    }
  });
};
