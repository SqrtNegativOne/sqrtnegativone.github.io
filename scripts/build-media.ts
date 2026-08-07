// Build-time fetcher: turns media/media.json into src/data/media.json with
// titles, years, and locally-cached poster images. Pulls from:
//   - books:        Open Library (no key required)
//   - movies/shows: TMDB         (TMDB_API_KEY env var)
//   - games:        Steam        (No key required)
// Results are memoised in media/cache.json and posters land in
// public/media-posters/ so the live build can run offline once warmed up.

import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_PATH = path.join(root, ".cache", "media-cache.json");
const SRC_JSON = path.join(root, "src", "data", "media.json");
const OUT = path.join(root, "src", "generated", "media.ts");
const POSTERS_DIR = path.join(root, "public", "media-posters");

const TMDB_KEY = process.env.TMDB_API_KEY || "";

interface MediaItem {
  type: "book" | "movie" | "show" | "game";
  id: string;
  rating: number;
  status: "finished" | "abandoned" | "wishlist" | "rewishlist" | "next up" | "consuming";
  poster_image?: string;
  title?: string;
  subtitle?: string;
  year?: string;
}

interface MediaMetadata {
  title: string;
  subtitle: string;
  year: string | null;
  coverUrl: string | null;
  posterFile?: string | null;
}

async function readJson<T>(p: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(p, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function safeId(id: string): string {
  return String(id).replace(/[^A-Za-z0-9_-]/g, "_");
}

async function downloadImage(url: string, destBase: string): Promise<string | null> {
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

async function fetchBook(id: string): Promise<MediaMetadata | null> {
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${id}&format=json&jscmd=data`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as Record<string, any>;
  const book = data[`ISBN:${id}`];
  if (!book) return null;
  return {
    title: book.title,
    subtitle: (book.authors || []).map((a: any) => a.name).join(", "),
    year: (book.publish_date || "").match(/\d{4}/)?.[0] || null,
    coverUrl:
      book.cover?.large ||
      book.cover?.medium ||
      `https://covers.openlibrary.org/b/isbn/${id}-L.jpg`,
  };
}

async function fetchTmdb(kind: "movie" | "tv", id: string): Promise<MediaMetadata | null> {
  if (!TMDB_KEY) return null;
  const url = `https://api.themoviedb.org/3/${kind}/${id}?api_key=${TMDB_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const d = await res.json() as any;
  return {
    title: d.title || d.name,
    subtitle: (d.tagline || "").slice(0, 120),
    year: (d.release_date || d.first_air_date || "").slice(0, 4) || null,
    coverUrl: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null,
  };
}

async function fetchSteamGame(id: string): Promise<MediaMetadata | null> {
  const url = `https://store.steampowered.com/api/appdetails?appids=${id}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json() as any;
  const data = json[id];
  if (!data || !data.success || !data.data) return null;
  const d = data.data;
  return {
    title: d.name,
    subtitle: (d.developers || []).slice(0, 1).join(", "),
    year: (d.release_date?.date || "").match(/\d{4}/)?.[0] || null,
    // Using the high-res 600x900 grid image from Steam CDN
    coverUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900_2x.jpg`,
  };
}

async function fetchMeta(item: MediaItem): Promise<MediaMetadata | null> {
  if (item.type === "book") return fetchBook(item.id);
  if (item.type === "movie") return fetchTmdb("movie", item.id);
  if (item.type === "show") return fetchTmdb("tv", item.id);
  if (item.type === "game") return fetchSteamGame(item.id);
  return null;
}

async function main() {
  await fs.mkdir(POSTERS_DIR, { recursive: true });
  await fs.mkdir(path.dirname(OUT), { recursive: true });

  const items = await readJson<MediaItem[]>(SRC_JSON, []);
  const cache = await readJson<Record<string, MediaMetadata>>(CACHE_PATH, {});

  const out: any[] = [];
  for (const item of items) {
    const key = `${item.type}:${item.id}`;
    let meta = cache[key] || null;

    if (!meta || !meta.title) {
      try {
        const fresh = await fetchMeta(item);
        if (fresh) {
          meta = { ...meta, ...fresh };
          cache[key] = meta;
          console.log(`[media] fetched ${key} → ${meta.title}`);
        } else if (!meta) {
          console.warn(`[media] no metadata for ${key} (missing API key or network?)`);
        }
      } catch (e: any) {
        console.warn(`[media] fetch failed for ${key}:`, e.message);
      }
    }

    let finalPosterPath: string | null = null;

    if (item.poster_image) {
      finalPosterPath = item.poster_image;
    } else {
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
      
      finalPosterPath = posterFile ? `/media-posters/${posterFile}` : null;
    }

    out.push({
      type: item.type,
      id: item.id,
      rating: item.rating,
      status: item.status,
      title: meta?.title || `${item.type} ${item.id}`,
      subtitle: meta?.subtitle || "",
      year: meta?.year || null,
      poster: finalPosterPath,
    });
  }

  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n");
  
  const outputTs = `// THIS FILE IS AUTO-GENERATED BY scripts/build-media.ts\n// DO NOT EDIT DIRECTLY\n\nexport const mediaData = ${JSON.stringify(out, null, 2)} as const;\n`;
  await fs.writeFile(OUT, outputTs);
  console.log(`[media] wrote ${out.length} entries → ${path.relative(root, OUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
