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
  rating: number;
  status: string;
  title: string;
  tagline: string;
  description: string;
  notes?: string;
  poster_image: string;
  private_notes?: string;
  author?: string;
  publisher?: string;
  tags?: string[];
  hidden?: boolean;
}

export interface PrivateNoteItem {
  id: string;
  notes: string;
}

export interface SkillItem {
  name: string;
  icon?: string;
  logo: string;
  mono?: string;
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
