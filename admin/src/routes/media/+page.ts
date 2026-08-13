import { readData } from '$lib/db';
import type { PageLoad } from './$types';

interface MediaItem {
  id: string;
  type: string;
  rating: number;
  status: string;
  title: string;
  tagline: string;
  description: string;
  notes?: string;
  poster_image: string;
  private_notes?: string;
}

interface PrivateNoteItem {
  id: string;
  notes: string;
}

export const load: PageLoad = async () => {
  const mediaRes = await readData<MediaItem>('media.json');
  const media = mediaRes.unwrapOr([] as any[]);
  
  const privateNotesRes = await readData<PrivateNoteItem>('media-private.json');
  let privateNotes = privateNotesRes.unwrapOr([] as any[]);
  
  if (!Array.isArray(privateNotes)) privateNotes = [];

  const notesMap = new Map<string, string>();
  for (const item of privateNotes) {
     // Without server crypto, we treat it as plain text or base64.
     // For a true SPA migration, you'd integrate Tauri's subtleCrypto or similar.
     notesMap.set(item.id, item.notes || '');
  }

  const mergedMedia = media.map(item => ({
      ...item,
      private_notes: notesMap.get(item.id) || ''
  }));

  return { media: mergedMedia };
};
