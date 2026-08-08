import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import path from 'path';
import dns from 'node:dns';

// Bypass TMDB DNS block in India for requests made by this Node process
dns.setServers(['1.1.1.1', '8.8.8.8']);

let TMDB_KEY = "";
try {
  const envContent = fs.readFileSync(path.resolve('../.env'), 'utf-8');
  const match = envContent.match(/TMDB_API_KEY=(.*)/);
  if (match) TMDB_KEY = match[1].trim();
} catch (e) {}

async function searchBook(query: string) {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "MyMediaApp/1.0" } });
  if (!res.ok) return null;
  const data = await res.json() as any;
  const books = data.docs?.slice(0, 5) || [];
  if (books.length === 0) return null;
  return books.map((book: any) => ({
    title: book.title,
    subtitle: (book.author_name || []).join(", "),
    coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
  }));
}

async function searchTmdb(kind: "movie" | "tv", query: string) {
  if (!TMDB_KEY) return { error: "TMDB_API_KEY environment variable is missing." };
  const url = `https://api.themoviedb.org/3/search/${kind}?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&page=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as any;
  const results = data.results?.slice(0, 5) || [];
  if (results.length === 0) return null;
  return results.map((d: any) => ({
    title: d.title || d.name,
    subtitle: d.release_date ? d.release_date.substring(0, 4) : d.first_air_date ? d.first_air_date.substring(0, 4) : "",
    description: d.overview || "",
    coverUrl: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null,
  }));
}

async function searchSteamGame(query: string) {
  const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) return null;
  const searchData = await searchRes.json() as any;
  const matches = searchData.items?.slice(0, 5) || [];
  if (matches.length === 0) return null;

  const results = [];
  
  // Fetch details for each match individually in parallel
  const detailPromises = matches.map(async (m: any) => {
    const detailsUrl = `https://store.steampowered.com/api/appdetails?appids=${m.id}`;
    try {
      const detailsRes = await fetch(detailsUrl);
      if (!detailsRes.ok) return null;
      const detailsData = await detailsRes.json() as any;
      if (!detailsData || !detailsData[m.id]) return null;
      
      const d = detailsData[m.id].data;
      if (!d) return null;

      return {
        title: d.name,
        subtitle: (d.developers || []).slice(0, 1).join(", "),
        description: d.short_description || "",
        coverUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${m.id}/library_600x900_2x.jpg`,
      };
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
  } catch (err: any) {
    let msg = err.message;
    if (err.cause) {
      msg += ` (Cause: ${err.cause.message || err.cause})`;
    }
    return json({ error: msg }, { status: 500 });
  }
};
