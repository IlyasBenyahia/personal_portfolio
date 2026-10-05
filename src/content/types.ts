import type { Locale } from '@/i18n/routing';

/** A string in both site languages. Prefix with "TODO:" when the value is not known yet. */
export type Localized = Record<Locale, string>;

/** "YYYY" or "YYYY-MM". */
export type YearMonth = `${number}` | `${number}-${string}`;

export interface Period {
  start: YearMonth;
  /** null = ongoing ("present"). Omit for a single-date entry. */
  end?: YearMonth | null;
}

export type Pillar = 'design' | 'develop' | 'grow';

export interface SocialLink {
  id: 'github' | 'linkedin' | 'itch' | 'behance';
  label: string;
  url: string;
}

export interface Experience {
  id: string;
  company: string;
  role: Localized;
  period: Period;
  /** Contract type, e.g. paid internship. */
  type?: Localized;
  missions: Localized[];
  pillars: Pillar[];
}

export interface Education {
  id: string;
  degree: Localized;
  school: string;
  /** Year obtained, or expected end date when `inProgress`. null = not provided (TODO). */
  date: YearMonth | null;
  inProgress?: boolean;
}

/** Tool names are universal strings; descriptive skills are localized. */
export type SkillItem = string | Localized;

export interface SkillGroup {
  pillar: Pillar;
  items: SkillItem[];
}

export interface ProjectVisual {
  /** Path under /public, or null while the capture is missing (rendered as a TODO frame). */
  src: string | null;
  alt: Localized;
  width: number;
  height: number;
}

export interface Project {
  slug: string;
  title: Localized;
  /** One-line summary for cards and meta descriptions. */
  summary: Localized;
  year: YearMonth | null;
  pillars: Pillar[];
  /** Private repository: shows the "private source code" badge, no code link. */
  privateSource: boolean;
  context: Localized;
  role: Localized;
  technologies: string[];
  result: Localized;
  visuals: ProjectVisual[];
  links: { demo?: string; source?: string };
  /** Placeholder project, to be replaced by real content. */
  placeholder?: boolean;
}

export interface Game {
  id: string;
  title: string;
  description: Localized;
  url: string;
  platform: string;
  status: 'published' | 'upcoming';
}

export const localize = (value: string | Localized, locale: Locale) =>
  typeof value === 'string' ? value : value[locale];

export const isTodo = (value: string) => value.trimStart().startsWith('TODO');
