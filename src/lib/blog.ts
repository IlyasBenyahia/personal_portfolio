import 'server-only';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { compileMDX } from 'next-mdx-remote/rsc';
import type { Locale } from '@/i18n/routing';

/**
 * Blog / devlog content (prepared, NOT published: the route lives in the
 * private folder app/[locale]/_blog). See src/content/blog/README.md.
 */
export interface BlogFrontmatter {
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  updated?: string;
  tags: string[];
  draft: boolean;
}

export interface BlogPostMeta extends BlogFrontmatter {
  slug: string;
  locale: Locale;
}

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

const isoDate = (value: unknown): string | undefined =>
  value instanceof Date ? value.toISOString().slice(0, 10) : (value as string | undefined);

async function compile(locale: Locale, slug: string) {
  const source = await readFile(path.join(BLOG_DIR, locale, `${slug}.mdx`), 'utf8');
  const { content, frontmatter } = await compileMDX<Record<string, unknown>>({
    source,
    options: { parseFrontmatter: true },
  });
  const meta: BlogPostMeta = {
    slug,
    locale,
    title: String(frontmatter.title ?? slug),
    description: String(frontmatter.description ?? ''),
    date: isoDate(frontmatter.date) ?? '',
    updated: isoDate(frontmatter.updated),
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String) : [],
    draft: frontmatter.draft === true,
  };
  return { content, meta };
}

/** Published posts of a locale, newest first. Drafts are excluded. */
export async function getPosts(locale: Locale): Promise<BlogPostMeta[]> {
  let files: string[] = [];
  try {
    files = (await readdir(path.join(BLOG_DIR, locale))).filter((f) => f.endsWith('.mdx'));
  } catch {
    return [];
  }
  const posts = await Promise.all(files.map((f) => compile(locale, f.replace(/\.mdx$/, ''))));
  return posts
    .map((p) => p.meta)
    .filter((p) => !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(locale: Locale, slug: string) {
  const post = await compile(locale, slug);
  return post.meta.draft ? null : post;
}
