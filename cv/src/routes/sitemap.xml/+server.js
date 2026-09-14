export const prerender = true;

const SITE_URL = 'https://cv.sqrt.fyi';

const ROUTES = ['/', '/about', '/projects', '/skills'];

export async function GET() {
  const urls = ROUTES.map((loc) => ({ loc }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ loc }) => `  <url>\n    <loc>${SITE_URL}${loc}</loc>\n  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600'
    }
  });
}
