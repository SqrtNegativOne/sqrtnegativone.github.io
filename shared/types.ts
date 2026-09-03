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
}

export interface QuoteItem {
  id: string;
  quote: string;
  source?: string;
  link?: string;
  tags?: string[];
}

export interface SocialItem {
  id: string;
  name: string;
  url: string;
  icon: string;
}
