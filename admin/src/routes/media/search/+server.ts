import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const TMDB_KEY = process.env.TMDB_API_KEY || "";

async function fetchBook(id: string) {
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${id}&format=json&jscmd=data`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as Record<string, any>;
  const book = data[`ISBN:${id}`];
  if (!book) return null;
  return {
    title: book.title,
    subtitle: (book.authors || []).map((a: any) => a.name).join(", "),
    coverUrl:
      book.cover?.large ||
      book.cover?.medium ||
      `https://covers.openlibrary.org/b/isbn/${id}-L.jpg`,
  };
}

async function fetchTmdb(kind: "movie" | "tv", id: string) {
  if (!TMDB_KEY) return { error: "TMDB_API_KEY environment variable is missing." };
  const url = `https://api.themoviedb.org/3/${kind}/${id}?api_key=${TMDB_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const d = await res.json() as any;
  return {
    title: d.title || d.name,
    subtitle: (d.tagline || "").slice(0, 120),
    coverUrl: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null,
  };
}

async function fetchSteamGame(id: string) {
  const url = `https://store.steampowered.com/api/appdetails?appids=${id}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as any;
  const d = data[id]?.data;
  if (!d) return null;
  return {
    title: d.name,
    subtitle: (d.developers || []).slice(0, 1).join(", "),
    coverUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900_2x.jpg`,
  };
}

export const GET: RequestHandler = async ({ url }) => {
  const type = url.searchParams.get('type');
  const id = url.searchParams.get('id');

  if (!type || !id) {
    return json({ error: 'Missing type or id' }, { status: 400 });
  }

  let result = null;

  try {
    if (type === 'book') result = await fetchBook(id);
    else if (type === 'movie') result = await fetchTmdb('movie', id);
    else if (type === 'show') result = await fetchTmdb('tv', id);
    else if (type === 'game') result = await fetchSteamGame(id);
    
    if (result && 'error' in result) {
        return json({ error: result.error }, { status: 400 });
    }

    if (result) {
      return json(result);
    } else {
      return json({ error: 'Not found or invalid ID' }, { status: 404 });
    }
  } catch (err: any) {
    return json({ error: err.message }, { status: 500 });
  }
};
