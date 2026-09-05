import { readData } from '$lib/db';
import type { PageLoad } from './$types';
import type { MediaItem, PrivateNoteItem } from '../../../../shared/types';

export const load: PageLoad = async () => {
  const mediaRes = await readData<MediaItem>('media');
  const media = mediaRes.unwrapOr([] as MediaItem[]);
  
  const privateNotesRes = await readData<PrivateNoteItem>('mediaPrivate');
  let privateNotes = privateNotesRes.unwrapOr([] as PrivateNoteItem[]);
  
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
