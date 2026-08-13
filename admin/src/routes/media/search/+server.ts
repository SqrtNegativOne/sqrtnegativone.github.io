import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import path from 'path';
import dns from 'node:dns';

interface GoogleBook { volumeInfo?: { title?: string; authors?: string[]; description?: string; imageLinks?: { thumbnail?: string; smallThumbnail?: string; } } }
interface TmdbResult { title?: string; name?: string; release_date?: string; first_air_date?: string; overview?: string; poster_path?: string; }
interface SteamSearchItem { id: string; }
interface SteamDetails { name: string; developers?: string[]; short_description?: string; }

// Bypass TMDB DNS block in India for requests made by this Node process
dns.setServers(['1.1.1.1', '8.8.8.8']);

let TMDB_KEY = "";
let GOOGLE_BOOKS_KEY = "";
try {
  const envContent = fs.readFileSync(path.resolve('../.env'), 'utf-8');
  const tmdbMatch = envContent.match(/TMDB_API_KEY=(.*)/);
  if (tmdbMatch) TMDB_KEY = tmdbMatch[1].trim();
  const googleMatch = envContent.match(/GOOGLE_BOOKS_API_KEY=(.*)/);
  if (googleMatch) GOOGLE_BOOKS_KEY = googleMatch[1].trim();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (e) { /* ignore */ }

async function searchBook(query: string) {
  let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`;
  if (GOOGLE_BOOKS_KEY) {
    url += `&key=${GOOGLE_BOOKS_KEY}`;
  }
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    if (res.status === 429) return { error: "Google Books API rate limit exceeded. Consider adding GOOGLE_BOOKS_API_KEY to .env." };
    return null;
  }
  const data = await res.json() as { items?: GoogleBook[] };
  const books = data.items || [];
  if (books.length === 0) return null;
  
  books.sort((a: GoogleBook, b: GoogleBook) => {
    const aTitle = a.volumeInfo?.title || "";
    const bTitle = b.volumeInfo?.title || "";
    const aExact = aTitle.toLowerCase() === query.toLowerCase();
    const bExact = bTitle.toLowerCase() === query.toLowerCase();
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });

  return books.slice(0, 10).map((book: GoogleBook) => {
    const vi = book.volumeInfo || {};
    let coverUrl = vi.imageLinks?.thumbnail || vi.imageLinks?.smallThumbnail || null;
    
    // Improve Google Books image quality by removing zoom limitations and curl edges
    if (coverUrl) {
      coverUrl = coverUrl.replace(/^http:/, 'https:')
                         .replace(/[?&]edge=curl/g, '')
                         .replace(/[?&]zoom=\d/g, '');
    }

    return {
      title: vi.title || "Unknown Title",
      tagline: (vi.authors || []).join(", "),
      description: vi.description || "",
      coverUrl: coverUrl,
    };
  });
}

async function searchTmdb(kind: "movie" | "tv", query: string) {
  if (!TMDB_KEY) return { error: "TMDB_API_KEY environment variable is missing." };
  const url = `https://api.tmdb.org/3/search/${kind}?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&page=1`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const data = await res.json() as { results?: TmdbResult[] };
  const results = data.results?.slice(0, 5) || [];
  if (results.length === 0) return null;
  return results.map((d: TmdbResult) => ({
    title: d.title || d.name,
    tagline: d.release_date ? d.release_date.substring(0, 4) : d.first_air_date ? d.first_air_date.substring(0, 4) : "",
    description: d.overview || "",
    coverUrl: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null,
  }));
}

async function searchSteamGame(query: string) {
  const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`;
  const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) });
  if (!searchRes.ok) return null;
  const searchData = await searchRes.json() as { items?: SteamSearchItem[] };
  const matches = searchData.items?.slice(0, 5) || [];
  if (matches.length === 0) return null;

  const results = [];
  
  // Fetch details for each match individually in parallel
  const detailPromises = matches.map(async (m: SteamSearchItem) => {
    const detailsUrl = `https://store.steampowered.com/api/appdetails?appids=${m.id}`;
    try {
      const detailsRes = await fetch(detailsUrl, { signal: AbortSignal.timeout(5000) });
      if (!detailsRes.ok) return null;
      const detailsData = await detailsRes.json() as Record<string, { data?: SteamDetails }>;
      if (!detailsData || !detailsData[m.id]) return null;
      
      const d = detailsData[m.id].data;
      if (!d) return null;

      return {
        title: d.name,
        tagline: (d.developers || []).slice(0, 1).join(", "),
        description: d.short_description || "",
        coverUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${m.id}/library_600x900_2x.jpg`,
      };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return null;
    }
  });

  const detailedResults = await Promise.all(detailPromises);
  
  for (const res of detailedResults) {
    if (res) results.push(res);
  }
  
  return results.length > 0 ? results : null;
}

export const GET: RequestHandler = async ({ url }) => {
  const type = url.searchParams.get('type');
  const query = url.searchParams.get('query');

  if (!type || !query) {
    return json({ error: 'Missing type or query' }, { status: 400 });
  }

  let result = null;

  try {
    if (type === 'book') result = await searchBook(query);
    else if (type === 'movie') result = await searchTmdb('movie', query);
    else if (type === 'show') result = await searchTmdb('tv', query);
    else if (type === 'game') result = await searchSteamGame(query);
    
    if (result && 'error' in result) {
        return json({ error: result.error }, { status: 400 });
    }

    if (result) {
      return json(result);
    } else {
      return json({ error: 'No results found for your query.' }, { status: 404 });
    }
  } catch (err: unknown) {
    const error = err as Error;
    let msg = error.message;
    if (error.cause) {
      msg += ` (Cause: ${error.cause})`;
    }
    return json({ error: msg }, { status: 500 });
  }
};
