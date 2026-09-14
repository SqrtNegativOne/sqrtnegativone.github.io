import { getPublicPosts, formatIsoDate } from '$lib/blog';
import { getAllNowEntries } from '$lib/now';

export const prerender = true;

const SITE_URL = 'https://sqrt.fyi';

export async function GET() {
  const sveltePages = import.meta.glob('/src/routes/**/+page.svelte');

  let urls = [];

  // 1. Process SvelteKit routes (ignoring dynamic routes and blog routes handled explicitly)
  for (const path of Object.keys(sveltePages)) {
    let route = path.replace('/src/routes', '').replace('/+page.svelte', '');

    if (route.includes('[') || route.startsWith('/blog')) continue;

    if (route === '') {
      route = '/';
    }

    urls.push({ loc: route });
  }

  // 2. Process Blog routes
  urls.push({ loc: '/blog/' });

  const posts = getPublicPosts();
  for (const post of posts) {
    urls.push({ loc: `/blog/${post.slug}/`, lastmod: formatIsoDate(post.date) });
  }

  // 3. Process Now day routes
  const nowEntries = getAllNowEntries();
  for (const entry of nowEntries) {
    urls.push({ loc: `/now/${entry.date}/`, lastmod: entry.date });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ loc, lastmod }) => `  <url>\n    <loc>${SITE_URL}${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600'
    }
  });
}
