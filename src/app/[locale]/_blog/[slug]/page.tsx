/**
 * Blog post template (BlogPosting) — PREPARED, NOT PUBLISHED. See ../page.tsx.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/seo/JsonLd';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { getPost, getPosts } from '@/lib/blog';
import { pageMetadata } from '@/lib/seo';
import { blogPostingGraph } from '@/lib/structured-data';

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const all = await Promise.all(routing.locales.map((l) => getPosts(l)));
  return all.flat().map((p) => ({ locale: p.locale, slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  const post = await getPost(locale, slug);
  if (!post) return {};
  const tMeta = await getTranslations({ locale, namespace: 'Metadata' });
  const meta = pageMetadata({
    locale,
    path: `/blog/${slug}`,
    title: post.meta.title,
    description: post.meta.description,
    siteName: tMeta('siteName'),
    type: 'article',
  });
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: 'article',
      publishedTime: post.meta.date,
      modifiedTime: post.meta.updated ?? post.meta.date,
      authors: ['Ilyas Benyahia'],
      tags: post.meta.tags,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const post = await getPost(locale, slug);
  if (!post) notFound();
  const t = await getTranslations('Blog');
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' });
  const { meta, content } = post;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <JsonLd data={blogPostingGraph(locale, meta)} />
      <p>
        <Link href="/blog" className="font-mono text-sm text-muted hover:text-fg">
          ← {t('back')}
        </Link>
      </p>
      <header className="mt-8">
        <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          {meta.title}
        </h1>
        <p className="mt-4 font-mono text-xs text-muted">
          <time dateTime={meta.date}>
            {t('published', { date: dateFormat.format(new Date(meta.date)) })}
          </time>
          {meta.updated && (
            <>
              {' · '}
              <time dateTime={meta.updated}>
                {t('updated', { date: dateFormat.format(new Date(meta.updated)) })}
              </time>
            </>
          )}
        </p>
      </header>
      <div className="mt-10 space-y-5 text-lg leading-relaxed [&_a]:underline [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-semibold">
        {content}
      </div>
    </article>
  );
}
