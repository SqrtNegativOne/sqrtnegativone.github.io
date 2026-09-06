import rawEntries from '../data/now.json' with { type: 'json' };

export interface NowEntry {
  id: string;
  date: string;
  title?: string;
  content: string;
  updatedAt?: string;
}

export function getAllNowEntries(): NowEntry[] {
  return (rawEntries as NowEntry[]).slice().sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export function getLatestNowEntry(): NowEntry | undefined {
  const entries = getAllNowEntries();
  return entries[0];
}

export function getNowEntryByDate(date: string): NowEntry | undefined {
  const entries = getAllNowEntries();
  return entries.find((e) => e.date === date || e.id === date);
}

export function formatNowDate(dateStr: string): string {
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00Z`);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  } catch {
    return dateStr;
  }
}
