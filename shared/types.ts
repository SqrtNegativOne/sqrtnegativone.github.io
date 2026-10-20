export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  github: string | null;
  url: string | null;
  image: string;
  private?: boolean;
}

export interface MediaItem {
  id: string;
  type: string;
  rating?: number | null;
  status: string;
  title: string;
  tagline: string;
  description: string;
  notes?: string;
  poster_image: string;
  /**
   * Admin-only. Merged in from `admin/data/media-private.json` when the admin
   * loads the library; never written to the public `media.json`.
   */
  private_notes?: string;
  author?: string;
  publisher?: string;
  tags?: string[];
  hidden?: boolean;
  uncertain?: boolean;
}

/** What happened to a library item. `add` is written automatically. */
export type MediaLogKind =
  | 'add'
  | 'start'
  | 'checkpoint'
  | 'finish'
  | 'drop'
  | 'shelve'
  | 'resume'
  | 'note';

/** How a checkpoint is measured. Omitted for a bare "still going" mark. */
export type MediaProgressUnit =
  | 'episode'
  | 'season'
  | 'page'
  | 'chapter'
  | 'hour'
  | 'percent';

/**
 * `private` events live only in `admin/data/media-log.json`. `public` events
 * are projected into `site/src/data/media-log.json` for the website.
 */
export type MediaVisibility = 'private' | 'public';

export interface MediaLogEvent {
  id: string;
  media_id: string;
  kind: MediaLogKind;
  /**
   * Local wall-clock stamp, either `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm`.
   * Deliberately offset-free: grouping must not shift under a UTC build.
   */
  at: string;
  /** Consumption pass; a rewatch/re-read is another pass. Defaults to 1. */
  round?: number;
  unit?: MediaProgressUnit | null;
  value?: number;
  total?: number;
  note?: string;
  visibility: MediaVisibility;
}

export interface PrivateNoteItem {
  id: string;
  notes: string;
}

export interface SkillItem {
  name: string;
  icon?: string;
  logo: string;
  mono?: boolean;
  hidden?: boolean;
}

export interface QuoteItem {
  id: string;
  quote: string;
  source?: string;
  link?: string;
  tags?: string[];
}

/** An 88x31 link button shown on the contact page. */
export interface ButtonItem {
  url: string;
  image: string;
}

export type SocialAudience = 'professional' | 'personal' | 'both';

export interface SocialItem {
  id: string;
  name: string;
  url: string;
  icon: string;
  /**
   * Which of the two sites the link belongs on. `personal` links are shown on
   * sqrt.fyi, `professional` links on cv.sqrt.fyi, and `both` on either.
   */
  audience: SocialAudience;
}
