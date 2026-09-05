import { Result, ResultAsync, err, ok } from 'neverthrow';
import { invoke } from '@tauri-apps/api/core';
import { getRepoRoot, readData, writeData } from '$lib/db';
import { applyFilters, applySorts } from '../../../../shared/utils/mediaFilters';
import { invalidateAll } from '$app/navigation';
import { notificationState } from '$lib/notificationState.svelte';
import type { MediaItem } from '../../../../shared/types';
export type { MediaItem };

export interface SearchResult {
  title?: string;
  tagline?: string;
  description?: string;
  coverUrl?: string;
  author?: string;
  publisher?: string;
}

export interface MediaSearchContext {
  tmdbApiKey: string;
  booksApiKey: string;
}

export interface MediaSearchProvider {
  name: string;
  supports(type: string): boolean;
  search(title: string, type: string, context: MediaSearchContext): Promise<Result<SearchResult[], string>>;
}

let cachedTmdbApiKey: string | null = null;
let cachedBooksApiKey: string | null = null;
let envLoaded = false;

async function ensureEnvKeys(): Promise<void> {
  if (envLoaded) return;
  const rootRes = await ResultAsync.fromPromise(getRepoRoot(), (e) => typeof e === 'string' ? e : String(e));
  if (rootRes.isErr()) return;
  const root = rootRes.value;

  const envRes = await ResultAsync.fromPromise(
    invoke<string>('read_file', { path: root + '/admin/.env' }),
    (e) => typeof e === 'string' ? e : (e instanceof Error ? e.message : 'Failed to read admin/.env')
  );
  if (envRes.isOk()) {
    const envText = envRes.value;
    const tokenMatch = envText.match(/TMDB_API_KEY=(.*)/);
    cachedTmdbApiKey = tokenMatch ? tokenMatch[1].trim() : '';
    const booksMatch = envText.match(/GOOGLE_BOOKS_API_KEY=(.*)/);
    cachedBooksApiKey = booksMatch ? booksMatch[1].trim() : '';
    envLoaded = true;
  }
}

class BooksSearchProvider implements MediaSearchProvider {
  name = 'Books';
  supports(type: string) {
    return type === 'book';
  }

  async search(title: string, _type: string, context: MediaSearchContext): Promise<Result<SearchResult[], string>> {
    const subProviders = [
      {
        name: 'Apple Books',
        fetch: async (): Promise<SearchResult[]> => {
          const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&entity=ebook&limit=10`;
          const res = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
          if (!res.ok) throw new Error(`Apple Books error: ${res.status}`);
          const data = await res.json();
          if (!data.results) return [];
          return data.results.map((r: any) => {
            let coverUrl = '';
            if (r.artworkUrl100) {
              coverUrl = r.artworkUrl100.replace('100x100bb.jpg', '1000x1000bb.jpg');
            }
            let description = r.description || '';
            if (description) description = description.replace(/<[^>]*>?/gm, '').trim();
            
            return {
              title: r.trackName || '',
              tagline: 'Apple Books Edition',
              author: r.artistName || '',
              publisher: '',
              description,
              coverUrl
            };
          });
        }
      },
      {
        name: 'Google Books',
        fetch: async (): Promise<SearchResult[]> => {
          let searchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=10`;
          if (context.booksApiKey) searchUrl += `&key=${context.booksApiKey}`;
          const res = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
          if (!res.ok) throw new Error(`Google Books error: ${res.status}`);
          const data = await res.json();
          if (!data.items) return [];
          return data.items.map((r: any) => {
            const vol = r.volumeInfo || {};
            let coverUrl = '';
            if (vol.imageLinks?.thumbnail) {
              coverUrl = vol.imageLinks.thumbnail.replace('http:', 'https:').replace('zoom=1', 'zoom=3');
            }
            return {
              title: vol.title || '',
              tagline: vol.subtitle ? `${vol.subtitle} (Google Books)` : 'Google Books Edition',
              author: vol.authors ? vol.authors.join(', ') : '',
              publisher: vol.publisher || '',
              description: vol.description || '',
              coverUrl
            };
          });
        }
      }
    ];

    const results = await Promise.allSettled(subProviders.map(p => p.fetch()));
    const allBooks: SearchResult[] = [];
    let allFailed = true;
    const errors: string[] = [];

    results.forEach((res, i) => {
      if (res.status === 'fulfilled') {
        allFailed = false;
        allBooks.push(...res.value);
      } else {
        errors.push(`${subProviders[i].name} failed: ${res.reason}`);
      }
    });

    if (allFailed) {
      return err(`All book providers failed. ${errors.join(' | ')}`);
    }

    if (allBooks.length === 0) {
      return err('No results found for that query.');
    }

    return ok(allBooks);
  }
}

class TmdbSearchProvider implements MediaSearchProvider {
  name = 'TMDB';
  supports(type: string) {
    return type === 'movie' || type === 'show';
  }

  async search(title: string, type: string, context: MediaSearchContext): Promise<Result<SearchResult[], string>> {
    const isMovie = type === 'movie';
    const typeStr = isMovie ? 'movie' : 'tv';
    const apiKey = context.tmdbApiKey;
    const searchUrl = `https://api.themoviedb.org/3/search/${typeStr}?query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1&api_key=${apiKey}`;
    
    const fetchRes = await ResultAsync.fromPromise(
      fetch(searchUrl, { signal: AbortSignal.timeout(10000), headers: { 'Accept': 'application/json' } }),
      (e) => e instanceof Error ? e.message : 'Network error during search'
    );
    if (fetchRes.isErr()) return err(fetchRes.error);

    const response = fetchRes.value;
    if (!response.ok) {
      const errTextRes = await ResultAsync.fromPromise(response.text(), () => 'Failed to read error body');
      return err(`Search failed: ${response.status} ${response.statusText}. ${errTextRes.unwrapOr('')}`);
    }

    const jsonRes = await ResultAsync.fromPromise(response.json(), () => 'Failed to parse JSON response');
    if (jsonRes.isErr()) return err(jsonRes.error);
    
    const data = jsonRes.value;
    if (!data.results || data.results.length === 0) return err('No results found for that query.');
    
    const topResults = data.results.slice(0, 5);

    // Fetch credits and details for all top results concurrently
    const detailedResults = await Promise.all(
      topResults.map(async (r: any) => {
        let author = '';
        let publisher = '';
        const detailsUrl = `https://api.themoviedb.org/3/${typeStr}/${r.id}?api_key=${apiKey}&append_to_response=credits`;

        const detFetchRes = await ResultAsync.fromPromise(
          fetch(detailsUrl, { signal: AbortSignal.timeout(5000), headers: { 'Accept': 'application/json' } }),
          () => 'Details fetch err'
        );
        if (detFetchRes.isOk() && detFetchRes.value.ok) {
          const detJsonRes = await ResultAsync.fromPromise(detFetchRes.value.json(), () => '');
          if (detJsonRes.isOk()) {
            const d = detJsonRes.value;
            if (isMovie) {
              const directors = d.credits?.crew?.filter((c: any) => c.job === 'Director') || [];
              author = directors.map((dir: any) => dir.name).join(', ');
            } else {
              const creators = d.created_by || [];
              author = creators.map((c: any) => c.name).join(', ');
            }
            const companies = d.production_companies || [];
            publisher = companies.map((c: any) => c.name).join(', ');
          }
        }

        return {
          title: isMovie ? r.title : r.name,
          tagline: '',
          author,
          publisher,
          description: r.overview,
          coverUrl: r.poster_path ? `https://image.tmdb.org/t/p/original${r.poster_path}` : ''
        } as SearchResult;
      })
    );
    
    return ok(detailedResults);
  }
}

class SteamSearchProvider implements MediaSearchProvider {
  name = 'Steam';
  supports(type: string) {
    return type === 'game';
  }

  async search(title: string): Promise<Result<SearchResult[], string>> {
    const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(title)}&l=english&cc=US`;
    const searchRes = await ResultAsync.fromPromise(
      invoke<string>('fetch_url', { url: searchUrl }),
      (e) => e instanceof Error ? e.message : 'Network error during Steam search'
    );
    if (searchRes.isErr()) return err(searchRes.error);

    let searchData: { items?: Array<{ id: number }> };
    try {
      searchData = JSON.parse(searchRes.value);
    } catch {
      return err('Failed to parse Steam search JSON');
    }

    const items = searchData.items;
    if (!items || items.length === 0) return err('No game results found on Steam.');

    const topItems = items.slice(0, 5);

    // Fetch details for all top Steam items concurrently
    const gamePromises = topItems.map(async (item: { id: number }) => {
      const detailsUrl = `https://store.steampowered.com/api/appdetails?appids=${item.id}`;
      const detailsRes = await ResultAsync.fromPromise(
        invoke<string>('fetch_url', { url: detailsUrl }),
        () => 'Failed to fetch app details'
      );
      if (detailsRes.isErr()) return null;

      try {
        const detailsData = JSON.parse(detailsRes.value);
        const appData = detailsData[item.id.toString()];
        if (appData && appData.success && appData.data) {
          const d = appData.data;
          let coverUrl = d.header_image || '';
          const libImageUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.id}/library_600x900.jpg`;
          
          try {
            const headRes = await fetch(libImageUrl, { method: 'HEAD', signal: AbortSignal.timeout(1500) });
            if (headRes.ok) {
              coverUrl = libImageUrl;
            }
          } catch {
            // Optional library poster not found, fallback to header_image
          }

          return {
            title: d.name,
            tagline: '',
            author: Array.isArray(d.developers) ? d.developers.join(', ') : '',
            publisher: Array.isArray(d.publishers) ? d.publishers.join(', ') : '',
            description: d.short_description || '',
            coverUrl
          } as SearchResult;
        }
      } catch {
        // Ignore JSON parse errors for individual game details
      }
      return null;
    });

    const settled = await Promise.all(gamePromises);
    const results = settled.filter((r): r is SearchResult => r !== null);

    if (results.length === 0) return err('Failed to retrieve game details.');
    return ok(results);
  }
}

const searchProviders: MediaSearchProvider[] = [
  new BooksSearchProvider(),
  new TmdbSearchProvider(),
  new SteamSearchProvider(),
];

export class MediaState {
  isModalOpen = $state(false);
  isEditing = $state(false);
  isSaving = $state(false);
  errorMsg = $state('');
  
  currentItem: MediaItem = $state({
    id: '', type: 'movie', rating: 4, status: 'wishlist',
    title: '', tagline: '', description: '', notes: '', poster_image: '', private_notes: '',
    author: '', publisher: '',
    tags: []
  });
  
  isSearching = $state(false);
  searchError = $state('');
  isSearchModalOpen = $state(false);
  searchResults: SearchResult[] = $state([]);

  searchQuery = $state("");
  filters = $state<{ property: string, operator: string, value: any }[]>([]);
  sorts = $state<{ property: string, direction: 'asc' | 'desc' }[]>([{ property: 'title', direction: 'asc' }]);

  data: any = $state(null);

  constructor() {}

  get filteredMedia() {
    if (!this.data?.media) return [];
    return applySorts(applyFilters(this.data.media, this.filters, this.searchQuery), this.sorts);
  }

  openNew() {
    this.isEditing = false;
    this.errorMsg = '';
    this.currentItem = { 
      id: '', type: 'movie', rating: 4, status: 'wishlist',
      title: '', tagline: '', description: '', notes: '', poster_image: '', private_notes: '',
      author: '', publisher: '',
      tags: []
    };
    this.isModalOpen = true;
  }

  openEdit(item: MediaItem) {
    this.isEditing = true;
    this.errorMsg = '';
    this.currentItem = { ...item };
    this.isModalOpen = true;
  }

  async handleSearch() {
    if (!this.currentItem.title || !this.currentItem.type) return;
    this.isSearching = true;
    this.searchError = '';

    await ensureEnvKeys();

    const provider = searchProviders.find(p => p.supports(this.currentItem.type));
    if (!provider) {
      this.searchError = `Unsupported media type: ${this.currentItem.type}`;
      notificationState.error(this.searchError, { title: 'Media Search' });
      this.isSearching = false;
      return;
    }

    const searchResult = await provider.search(this.currentItem.title, this.currentItem.type, {
      tmdbApiKey: cachedTmdbApiKey || '',
      booksApiKey: cachedBooksApiKey || '',
    });

    if (searchResult.isErr()) {
      this.searchError = searchResult.error;
      notificationState.error(searchResult.error, { title: `${provider.name} Search` });
    } else {
      this.searchResults = searchResult.value;
      this.isSearchModalOpen = true;
    }
    this.isSearching = false;
  }

  selectSearchResult(result: SearchResult) {
    if (result.title) this.currentItem.title = result.title;
    if (result.author) this.currentItem.author = result.author;
    if (result.publisher) this.currentItem.publisher = result.publisher;
    const descParts = [];
    if (result.tagline) descParts.push(result.tagline);
    if (result.description) descParts.push(result.description);
    if (descParts.length > 0) this.currentItem.description = descParts.join('\n\n');
    if (result.coverUrl) this.currentItem.poster_image = result.coverUrl;
    
    if (!this.currentItem.id && result.title) {
      this.currentItem.id = result.title.toLowerCase().replace(/[^a-z0-9_-]/g, "_").replace(/_+/g, "_");
    }
    this.isSearchModalOpen = false;
  }

  handlePaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = (ev) => {
          this.currentItem.poster_image = ev.target?.result as string;
        };
        reader.readAsDataURL(file);
        e.preventDefault();
        break;
      }
    }
  }

  handleRatingKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.currentItem.rating = Math.min(7, Math.floor((this.currentItem.rating || 4) + 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.currentItem.rating = Math.max(1, Math.ceil((this.currentItem.rating || 4) - 1));
    }
  }

  async handleSave(e: Event) {
    e.preventDefault();
    this.isSaving = true;
    try {
      this.errorMsg = '';
      const { id, type, rating, status, title, tagline, description, notes, private_notes, tags, author, publisher } = this.currentItem;
      let poster_image = this.currentItem.poster_image;
      
      if (!id || !title) {
        this.errorMsg = 'ID and Title are required';
        notificationState.error(this.errorMsg, { title: 'Validation Error' });
        return;
      }

      const rootRes = await ResultAsync.fromPromise(getRepoRoot(), (err) => typeof err === 'string' ? err : String(err));
      if (rootRes.isErr()) {
        this.errorMsg = rootRes.error;
        notificationState.error(this.errorMsg, { title: 'Save Failed' });
        return;
      }
      const root = rootRes.value;
      const safeId = id.replace(/[^A-Za-z0-9_-]/g, "_");
      const postersDir = `${root}/static/media/media-posters`;
      const isNew = !this.isEditing;

      await ResultAsync.fromPromise(invoke('mkdir', { path: postersDir, recursive: true }), () => {});

      if (poster_image.startsWith('data:image/')) {
        const matches = poster_image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const base64Data = matches[2].replace(/ /g, '+');
          const filename = `${type}_${safeId}.jpg`;
          const filepath = `${postersDir}/${filename}`;
          
          const writeRes = await ResultAsync.fromPromise(
            invoke('save_base64_image', { path: filepath, base64_content: base64Data }),
            (err) => typeof err === 'string' ? err : 'Failed to write image'
          );
          if (writeRes.isErr()) {
            this.errorMsg = writeRes.error;
            notificationState.error(this.errorMsg, { title: 'Image Save Failed' });
            return;
          }
          const convertRes = await ResultAsync.fromPromise(
            invoke('convert_image_to_avif', { path: filepath }),
            (err) => typeof err === 'string' ? err : 'Failed to convert image'
          );
          if (convertRes.isErr()) {
            this.errorMsg = convertRes.error;
            notificationState.error(this.errorMsg, { title: 'Image Optimization Failed' });
            return;
          }
          poster_image = `${type}_${safeId}`;
        }
      } else if (poster_image.startsWith('http://') || poster_image.startsWith('https://')) {
        const filename = `${type}_${safeId}.jpg`;
        const filepath = `${postersDir}/${filename}`;
        
        const writeRes = await ResultAsync.fromPromise(
          invoke('download_and_save_image', { url: poster_image, path: filepath }),
          (err) => typeof err === 'string' ? err : 'Failed to download image via backend'
        );
        if (writeRes.isErr()) {
          this.errorMsg = writeRes.error;
          notificationState.error(this.errorMsg, { title: 'Image Download Failed' });
          return;
        }
        const convertRes = await ResultAsync.fromPromise(
          invoke('convert_image_to_avif', { path: filepath }),
          (err) => typeof err === 'string' ? err : 'Failed to convert image'
        );
        if (convertRes.isErr()) {
          this.errorMsg = convertRes.error;
          notificationState.error(this.errorMsg, { title: 'Image Optimization Failed' });
          return;
        }
        poster_image = `${type}_${safeId}`;
      }

      const items = (await readData<MediaItem>('media')).unwrapOr([] as any[]);
      const newItem: MediaItem = { id, type, rating, status, title, tagline, description, notes, private_notes, poster_image, tags, author, publisher };
      
      if (isNew) {
        if (items.some(i => i.id === id)) {
          this.errorMsg = 'ID already exists';
          notificationState.error(this.errorMsg, { title: 'Duplicate ID' });
          return;
        }
        items.push(newItem);
      } else {
        const idx = items.findIndex(i => i.id === id);
        if (idx !== -1) items[idx] = newItem;
        else items.push(newItem);
      }
      
      const saveRes = await writeData('media', items);
      if (saveRes.isErr()) {
        this.errorMsg = saveRes.error.message;
        notificationState.error(this.errorMsg, { title: 'Save Failed' });
        return;
      }

      let pNotes = (await readData<{id: string, notes: string}>('mediaPrivate')).unwrapOr([] as any[]);
      if (!Array.isArray(pNotes)) pNotes = [];

      if (private_notes && private_notes.trim()) {
        const pIdx = pNotes.findIndex(n => n.id === id);
        if (pIdx !== -1) pNotes[pIdx].notes = private_notes;
        else pNotes.push({ id, notes: private_notes });
      } else {
        pNotes = pNotes.filter(n => n.id !== id);
      }
      const savePrivateRes = await writeData('mediaPrivate', pNotes);
      if (savePrivateRes.isErr()) {
        this.errorMsg = savePrivateRes.error.message;
        notificationState.error(this.errorMsg, { title: 'Save Private Notes Failed' });
        return;
      }

      notificationState.success(`Saved "${newItem.title}" successfully!`, { title: 'Media Saved' });
      this.isModalOpen = false;
      await invalidateAll();
    } finally {
      this.isSaving = false;
    }
  }

  async handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this media item?')) return;
    this.errorMsg = '';
    
    let items = (await readData<MediaItem>('media')).unwrapOr([] as any[]);
    const itemToDelete = items.find(i => i.id === id);
    
    if (itemToDelete && itemToDelete.poster_image && !itemToDelete.poster_image.startsWith('http') && !itemToDelete.poster_image.startsWith('data:')) {
      const rootRes = await ResultAsync.fromPromise(getRepoRoot(), () => '');
      if (rootRes.isOk() && rootRes.value) {
        const root = rootRes.value;
        const posterBase = `${root}/static/media/media-posters/${itemToDelete.poster_image}`;
        await ResultAsync.fromPromise(invoke('unlink', { path: `${posterBase}.avif` }), () => {});
        await ResultAsync.fromPromise(invoke('unlink', { path: `${posterBase}.jpg` }), () => {});
      }
    }

    items = items.filter(i => i.id !== id);
    const writeRes = await writeData('media', items);
    if (writeRes.isErr()) {
      this.errorMsg = writeRes.error.message;
      notificationState.error(this.errorMsg, { title: 'Delete Failed' });
      return;
    }

    let pNotes = (await readData<{id: string, notes: string}>('mediaPrivate')).unwrapOr([] as any[]);
    if (Array.isArray(pNotes)) {
        pNotes = pNotes.filter(n => n.id !== id);
        const writePrivateRes = await writeData('mediaPrivate', pNotes);
        if (writePrivateRes.isErr()) {
          this.errorMsg = writePrivateRes.error.message;
          notificationState.error(this.errorMsg, { title: 'Delete Private Notes Failed' });
          return;
        }
    }
    
    notificationState.success(`Deleted media "${id}"`, { title: 'Media Deleted' });
    this.isModalOpen = false;
    await invalidateAll();
  }
}
