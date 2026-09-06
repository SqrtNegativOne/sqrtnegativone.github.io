import posts from './content/posts.json' with { type: 'json' };

export function getAllPosts(): Post[] {
  return posts as Post[];
}

export interface Post {
  title: string;
  date: string;
  description?: string;
  subtitle?: string;
  tags: string[];
  font?: string;
  draft: boolean;
  raw: string;
  rawSource: string;
  content: string;
  slug: string;
}

export function getPublicPosts(): Post[] {
  return (posts as Post[])
    .filter((p) => !p.draft && !p.tags.includes('afterdark'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAfterdarkPosts(): Post[] {
  return (posts as Post[])
    .filter((p) => p.tags.includes('afterdark'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post | undefined {
  return (posts as Post[]).find((p) => p.slug === slug);
}

export function formatReadableDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

export function formatIsoDate(dateStr: string): string {
  return new Date(dateStr).toISOString().split('T')[0];
}
