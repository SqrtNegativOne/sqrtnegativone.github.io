// Build-time fetcher: turns media/media.json into src/data/media.json with
// titles, years, and locally-cached poster images. Pulls from:
//   - books:        Open Library (no key required)
//   - movies/shows: TMDB         (TMDB_API_KEY env var)
//   - games:        RAWG         (RAWG_API_KEY env var)
// Results are memoised in media/cache.json and posters land in
// public/media-posters/ so the live build can run offline once warmed up.

import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "media", "media.json");
const CACHE_PATH = path.join(root, "media", "cache.json");
const OUT = path.join(root, "src", "data", "media.json");
const POSTERS_DIR = path.join(root, "public", "media-posters");

const TMDB_KEY = process.env.TMDB_API_KEY || "";
const RAWG_KEY = process.env.RAWG_API_KEY || "";

async function readJson(p, fallback) {
  try {
    return JSON.parse(await fs.readFile(p, "utf8"));
  } catch {
    return fallback;
  }
}

function safeId(id) {
  return String(id).replace(/[^A-Za-z0-9_-]/g, "_");
}

async function downloadImage(url, destBase) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
    const buf = Buffer.from(await res.arrayBuffer());
    // Open Library returns a tiny placeholder when no cover exists; skip those.
    if (buf.length < 1500) return null;
    const dest = `${destBase}.${ext}`;
    await fs.writeFile(dest, buf);
    return path.basename(dest);
  } catch {
    return null;
  }
}

async function fetchBook(id) {
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${id}&format=json&jscmd=data`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const book = data[`ISBN:${id}`];
  if (!book) return null;
  return {
    title: book.title,
    subtitle: (book.authors || []).map((a) => a.name).join(", "),
    year: (book.publish_date || "").match(/\d{4}/)?.[0] || null,
    coverUrl:
      book.cover?.large ||
      book.cover?.medium ||
      `https://covers.openlibrary.org/b/isbn/${id}-L.jpg`,
  };
}

async function fetchTmdb(kind, id) {
  if (!TMDB_KEY) return null;
  const url = `https://api.themoviedb.org/3/${kind}/${id}?api_key=${TMDB_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const d = await res.json();
  return {
    title: d.title || d.name,
    subtitle: (d.tagline || "").slice(0, 120),
    year: (d.release_date || d.first_air_date || "").slice(0, 4) || null,
    coverUrl: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null,
  };
}

async function fetchGame(id) {
  if (!RAWG_KEY) return null;
  const url = `https://api.rawg.io/api/games/${id}?key=${RAWG_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const d = await res.json();
  return {
    title: d.name,
    subtitle: (d.developers || []).slice(0, 1).map((x) => x.name).join(", "),
    year: (d.released || "").slice(0, 4) || null,
    coverUrl: d.background_image || null,
  };
}

async function fetchMeta(item) {
  if (item.type === "book") return fetchBook(item.id);
  if (item.type === "movie") return fetchTmdb("movie", item.id);
  if (item.type === "show") return fetchTmdb("tv", item.id);
  if (item.type === "game") return fetchGame(item.id);
  return null;
}

async function main() {
  await fs.mkdir(POSTERS_DIR, { recursive: true });
  await fs.mkdir(path.dirname(OUT), { recursive: true });

  const items = await readJson(SRC, []);
  const cache = await readJson(CACHE_PATH, {});

  const out = [];
  for (const item of items) {
    const key = `${item.type}:${item.id}`;
    let meta = cache[key] || null;

    if (!meta || !meta.title) {
      try {
        const fresh = await fetchMeta(item);
        if (fresh) {
          meta = { ...(meta || {}), ...fresh };
          cache[key] = meta;
          console.log(`[media] fetched ${key} → ${meta.title}`);
        } else if (!meta) {
          console.warn(`[media] no metadata for ${key} (missing API key or network?)`);
        }
      } catch (e) {
        console.warn(`[media] fetch failed for ${key}:`, e.message);
      }
    }

    // Resolve poster: existing local file, then download if we have a URL.
    let posterFile = meta?.posterFile || null;
    const base = path.join(POSTERS_DIR, `${item.type}-${safeId(item.id)}`);
    if (!posterFile) {
      for (const ext of ["jpg", "png", "webp"]) {
        if (existsSync(`${base}.${ext}`)) {
          posterFile = `${item.type}-${safeId(item.id)}.${ext}`;
          break;
        }
      }
    } else if (!existsSync(path.join(POSTERS_DIR, posterFile))) {
      posterFile = null; // cache references file that no longer exists
    }
    if (!posterFile && meta?.coverUrl) {
      const fname = await downloadImage(meta.coverUrl, base);
      if (fname) {
        posterFile = fname;
        console.log(`[media] downloaded poster for ${key}`);
      }
    }
    if (meta && posterFile) {
      meta.posterFile = posterFile;
      cache[key] = meta;
    }

    out.push({
      type: item.type,
      id: item.id,
      rating: item.rating,
      status: item.status,
      title: meta?.title || `${item.type} ${item.id}`,
      subtitle: meta?.subtitle || "",
      year: meta?.year || null,
      poster: posterFile ? `/media-posters/${posterFile}` : null,
    });
  }

  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n");
  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`[media] wrote ${out.length} entries → ${path.relative(root, OUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
