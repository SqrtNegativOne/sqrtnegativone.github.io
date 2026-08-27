import { Result, ResultAsync, err, ok } from 'neverthrow';
import { invoke } from '@tauri-apps/api/core';
import { getRepoRoot, readData, writeData } from '$lib/db';
import { applyFilters, applySorts } from '../../../../shared/utils/mediaFilters';
import { invalidateAll } from '$app/navigation';

export interface MediaItem {
  id: string; type: string; rating: number; status: string;
  title: string; tagline: string; description: string; notes: string; poster_image: string; private_notes: string;
  author?: string; publisher?: string;
  tags?: string[];
}

export interface SearchResult { title?: string; tagline?: string; description?: string; coverUrl?: string; author?: string; publisher?: string; }

export class MediaState {
  isModalOpen = $state(false);
  isEditing = $state(false);
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

  async searchBooks(title: string, apiKey: string): Promise<Result<SearchResult[], string>> {
    let searchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=10`;
    if (apiKey) searchUrl += `&key=${apiKey}`;
    
    const fetchRes = await ResultAsync.fromPromise(
      fetch(searchUrl, { signal: AbortSignal.timeout(10000) }),
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
    if (!data.items || data.items.length === 0) return err('No results found for that query.');
    
    return ok(data.items.map((r: any) => {
      const vol = r.volumeInfo || {};
      let coverUrl = '';
      if (vol.imageLinks?.thumbnail) {
        coverUrl = vol.imageLinks.thumbnail.replace('http:', 'https:');
      }
      return {
        title: vol.title || '',
        tagline: vol.subtitle || '',
        author: vol.authors ? vol.authors.join(', ') : '',
        publisher: vol.publisher || '',
        description: vol.description || '',
        coverUrl
      };
    }));
  }

  async searchTmdb(title: string, isMovie: boolean, apiKey: string): Promise<Result<SearchResult[], string>> {
    const typeStr = isMovie ? 'movie' : 'tv';
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
    const detailedResults: SearchResult[] = [];

    for (const r of topResults) {
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
            author = directors.map((d: any) => d.name).join(', ');
          } else {
            const creators = d.created_by || [];
            author = creators.map((c: any) => c.name).join(', ');
          }
          const companies = d.production_companies || [];
          publisher = companies.map((c: any) => c.name).join(', ');
        }
      }

      detailedResults.push({
        title: isMovie ? r.title : r.name,
        tagline: '', 
        author,
        publisher,
        description: r.overview,
        coverUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : ''
      });
    }
    
    return ok(detailedResults);
  }

  async searchGames(title: string): Promise<Result<SearchResult[], string>> {
    const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(title)}&l=english&cc=US`;
    const searchRes = await ResultAsync.fromPromise(
      invoke<string>('fetch_url', { url: searchUrl }),
      (e) => e instanceof Error ? e.message : 'Network error during Steam search'
    );
    if (searchRes.isErr()) return err(searchRes.error);

    let searchData;
    try {
      searchData = JSON.parse(searchRes.value);
    } catch (e) {
      return err('Failed to parse Steam search JSON');
    }

    const items = searchData.items;
    if (!items || items.length === 0) return err('No game results found on Steam.');

    const topItems = items.slice(0, 5);
    const results: SearchResult[] = [];
    
    for (const item of topItems) {
      const detailsUrl = `https://store.steampowered.com/api/appdetails?appids=${item.id}`;
      const detailsRes = await ResultAsync.fromPromise(
        invoke<string>('fetch_url', { url: detailsUrl }),
        () => 'Failed to fetch app details'
      );
      if (detailsRes.isOk()) {
        try {
          const detailsData = JSON.parse(detailsRes.value);
          const appData = detailsData[item.id.toString()];
          if (appData && appData.success && appData.data) {
            const d = appData.data;
            results.push({
              title: d.name,
              tagline: '',
              author: d.developers ? d.developers.join(', ') : '',
              publisher: d.publishers ? d.publishers.join(', ') : '',
              description: d.short_description || '',
              coverUrl: d.header_image || ''
            });
          }
        } catch (e) {}
      }
    }

    if (results.length === 0) return err('Failed to retrieve game details.');
    return ok(results);
  }

  async handleSearch() {
    if (!this.currentItem.title || !this.currentItem.type) return;
    this.isSearching = true;
    this.searchError = '';
    
    const rootRes = await ResultAsync.fromPromise(getRepoRoot(), (e) => typeof e === 'string' ? e : String(e));
    if (rootRes.isErr()) {
      this.searchError = rootRes.error;
      this.isSearching = false;
      return;
    }
    const root = rootRes.value;

    const envRes = await ResultAsync.fromPromise(
      invoke<string>('read_file', { path: root + '/admin/.env' }),
      (e) => typeof e === 'string' ? e : (e instanceof Error ? e.message : 'Failed to read admin/.env')
    );
    if (envRes.isErr()) {
      this.searchError = envRes.error;
      this.isSearching = false;
      return;
    }
    
    const envText = envRes.value;
    const tokenMatch = envText.match(/TMDB_API_KEY=(.*)/);
    const tmdbApiKey = tokenMatch ? tokenMatch[1].trim() : '';
    const booksMatch = envText.match(/GOOGLE_BOOKS_API_KEY=(.*)/);
    const booksApiKey = booksMatch ? booksMatch[1].trim() : '';
    
    let searchResult: Result<SearchResult[], string>;
    switch (this.currentItem.type) {
      case 'book':
        searchResult = await this.searchBooks(this.currentItem.title, booksApiKey);
        break;
      case 'movie':
        searchResult = await this.searchTmdb(this.currentItem.title, true, tmdbApiKey);
        break;
      case 'show':
        searchResult = await this.searchTmdb(this.currentItem.title, false, tmdbApiKey);
        break;
      case 'game':
        searchResult = await this.searchGames(this.currentItem.title);
        break;
      default:
        searchResult = err('Unsupported media type');
        break;
    }

    if (searchResult.isErr()) {
      this.searchError = searchResult.error;
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
    this.errorMsg = '';
    let { id, type, rating, status, title, tagline, description, notes, poster_image, private_notes, tags, author, publisher } = this.currentItem;
    
    if (!id || !title) {
      this.errorMsg = 'ID and Title are required';
      return;
    }

    const rootRes = await ResultAsync.fromPromise(getRepoRoot(), (err) => typeof err === 'string' ? err : String(err));
    if (rootRes.isErr()) {
      this.errorMsg = rootRes.error;
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
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const filename = `${type}_${safeId}.jpg`;
        const filepath = `${postersDir}/${filename}`;
        
        const writeRes = await ResultAsync.fromPromise(
          invoke('write_file_binary', { path: filepath, content: Array.from(bytes) }),
          (err) => typeof err === 'string' ? err : 'Failed to write image'
        );
        if (writeRes.isErr()) {
          this.errorMsg = writeRes.error;
          return;
        }
        const convertRes = await ResultAsync.fromPromise(
          invoke('convert_image_to_avif', { path: filepath }),
          (err) => typeof err === 'string' ? err : 'Failed to convert image'
        );
        if (convertRes.isErr()) {
          this.errorMsg = convertRes.error;
          return;
        }
        poster_image = `${type}_${safeId}`;
      }
    } else if (poster_image.startsWith('http://') || poster_image.startsWith('https://')) {
      const fetchRes = await ResultAsync.fromPromise(
        invoke<number[]>('fetch_binary', { url: poster_image }),
        (err) => typeof err === 'string' ? err : 'Failed to fetch image via backend'
      );
      if (fetchRes.isOk()) {
        const bytes = new Uint8Array(fetchRes.value);
        const filename = `${type}_${safeId}.jpg`;
        const filepath = `${postersDir}/${filename}`;
        
        const writeRes = await ResultAsync.fromPromise(
          invoke('write_file_binary', { path: filepath, content: Array.from(bytes) }),
          (err) => typeof err === 'string' ? err : 'Failed to write image'
        );
        if (writeRes.isErr()) {
          this.errorMsg = writeRes.error;
          return;
        }
        const convertRes = await ResultAsync.fromPromise(
          invoke('convert_image_to_avif', { path: filepath }),
          (err) => typeof err === 'string' ? err : 'Failed to convert image'
        );
        if (convertRes.isErr()) {
          this.errorMsg = convertRes.error;
          return;
        }
        poster_image = `${type}_${safeId}`;
      }
    }

    const items = (await readData<MediaItem>('../../static/media/media.json')).unwrapOr([] as any[]);
    const newItem: MediaItem = { id, type, rating, status, title, tagline, description, notes, private_notes, poster_image, tags, author, publisher };
    
    if (isNew) {
      if (items.some(i => i.id === id)) {
        this.errorMsg = 'ID already exists';
        return;
      }
      items.push(newItem);
    } else {
      const idx = items.findIndex(i => i.id === id);
      if (idx !== -1) items[idx] = newItem;
      else items.push(newItem);
    }
    
    const saveRes = await writeData('../../static/media/media.json', items);
    if (saveRes.isErr()) {
      this.errorMsg = saveRes.error.message;
      return;
    }

    let pNotes = (await readData<{id: string, notes: string}>('../../static/media/media-private.json')).unwrapOr([] as any[]);
    if (!Array.isArray(pNotes)) pNotes = [];

    if (private_notes && private_notes.trim()) {
      const pIdx = pNotes.findIndex(n => n.id === id);
      if (pIdx !== -1) pNotes[pIdx].notes = private_notes;
      else pNotes.push({ id, notes: private_notes });
    } else {
      pNotes = pNotes.filter(n => n.id !== id);
    }
    const savePrivateRes = await writeData('../../static/media/media-private.json', pNotes);
    if (savePrivateRes.isErr()) {
      this.errorMsg = savePrivateRes.error.message;
      return;
    }

    this.isModalOpen = false;
    await invalidateAll();
  }

  async handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this media item?')) return;
    this.errorMsg = '';
    
    let items = (await readData<MediaItem>('../../static/media/media.json')).unwrapOr([] as any[]);
    items = items.filter(i => i.id !== id);
    const writeRes = await writeData('../../static/media/media.json', items);
    if (writeRes.isErr()) {
      this.errorMsg = writeRes.error.message;
      return;
    }

    let pNotes = (await readData<{id: string, notes: string}>('../../static/media/media-private.json')).unwrapOr([] as any[]);
    if (Array.isArray(pNotes)) {
        pNotes = pNotes.filter(n => n.id !== id);
        const writePrivateRes = await writeData('../../static/media/media-private.json', pNotes);
        if (writePrivateRes.isErr()) {
          this.errorMsg = writePrivateRes.error.message;
          return;
        }
    }
    
    this.isModalOpen = false;
    await invalidateAll();
  }
}
