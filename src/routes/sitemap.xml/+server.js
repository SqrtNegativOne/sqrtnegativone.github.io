export const prerender = true;

const SITE_URL = 'https://sqrt.fyi';

export async function GET() {
  const sveltePages = import.meta.glob('/src/routes/**/+page.svelte');
  const eleventyPosts = import.meta.glob('/blog/posts/*.md', { query: '?raw', import: 'default', eager: true });
  
  let urls = [];
  
  // 1. Process SvelteKit routes
  for (const path of Object.keys(sveltePages)) {
    let route = path.replace('/src/routes', '').replace('/+page.svelte', '');
    
    // Ignore dynamic routes if any exist in the future
    if (route.includes('[')) continue;
    
    if (route === '') {
      route = '/';
    }
    
    urls.push(route);
  }
  
  // 2. Process Eleventy routes
  urls.push('/blog/');
  
  for (const [path, rawContent] of Object.entries(eleventyPosts)) {
    // Basic frontmatter parsing
    const frontmatter = rawContent.split('---')[1] || '';
    const isDraft = frontmatter.includes('draft: true');
    const isAfterdark = frontmatter.includes('afterdark');
    
    if (isDraft || isAfterdark) continue;
    
    // Extract filename for slug
    const slug = path.split('/').pop().replace('.md', '');
    urls.push(`/blog/${slug}/`);
  }
  
  // Optional: You could extract the date from frontmatter to include <lastmod>
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>\n    <loc>${SITE_URL}${url}</loc>\n  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600'
    }
  });
}
