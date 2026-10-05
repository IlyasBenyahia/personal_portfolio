/**
 * Blog index — PREPARED, NOT PUBLISHED. `_blog` is a private folder: Next.js
 * does not route it. Rename to `blog` to publish (see src/content/blog/README.md).
 */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getPosts } from '@/lib/blog';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  const tMeta = await getTranslations({ locale, namespace: 'Metadata' });
  return pageMetadata({
    locale,
    path: '/blog',
    title: t('title'),
    description: t('description'),
    siteName: tMeta('siteName'),
  });
}

export default async function BlogIndex({ params }: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations('Blog');
  const posts = await getPosts(locale);
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="mt-4 text-lg text-muted">{t('description')}</p>
      {posts.length === 0 ? (
        <p className="mt-12 text-muted">{t('empty')}</p>
      ) : (
        <ol className="mt-12 divide-y divide-line border-y border-line">
          {posts.map((post) => (
            <li key={post.slug} className="py-6">
              <h2 className="font-display text-2xl font-semibold">
                <Link href={`/blog/${post.slug}`} className="hover:text-accent">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-1 font-mono text-xs text-muted">
                <time dateTime={post.date}>{dateFormat.format(new Date(post.date))}</time>
              </p>
              <p className="mt-2 text-muted">{post.description}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
