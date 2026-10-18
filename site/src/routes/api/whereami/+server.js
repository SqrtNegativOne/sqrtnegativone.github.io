import { json } from '@sveltejs/kit';

// Dormant: the current /main intro no longer fetches this. Kept for the
// longer dynamic intro preserved in src/routes/main/IntroDynamic.svelte.
// Cloudflare fills `platform.cf` per request, so this cannot be prerendered.
export const prerender = false;

/**
 * Returns the visitor's own network identity, as seen by the edge, for the
 * /main readout. Nothing is stored or logged.
 */
export function GET({ request, platform }) {
  const cf = platform?.cf;

  return json(
    {
      city: cf?.city ?? request.headers.get('cf-ipcity') ?? null,
      country: cf?.country ?? request.headers.get('cf-ipcountry') ?? null,
      ip: request.headers.get('cf-connecting-ip') ?? null
    },
    {
      headers: {
        'cache-control': 'no-store'
      }
    }
  );
}
