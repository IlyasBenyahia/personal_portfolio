import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { profile } from '@/content/profile';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

const SECTIONS = ['hosting', 'analytics', 'form', 'rights', 'storage', 'ip'] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: 'Legal' });
  const tMeta = await getTranslations({ locale, namespace: 'Metadata' });
  return pageMetadata({
    locale,
    path: '/legal',
    title: t('title'),
    description: t('description'),
    siteName: tMeta('siteName'),
  });
}

export default async function LegalPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations('Legal');

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {t('title')}
      </h1>
      <p className="mt-4 font-mono text-xs text-muted">{t('updated')}</p>

      <section aria-labelledby="legal-publisher" className="mt-12">
        <h2 id="legal-publisher" className="font-display text-2xl font-semibold">
          {t('publisherTitle')}
        </h2>
        <p className="mt-3 leading-relaxed">{t('publisher')}</p>
        <p className="mt-2">
          {t('contact')}{' '}
          <a href={`mailto:${profile.email}`} className="underline underline-offset-4">
            {profile.email}
          </a>
        </p>
      </section>

      {SECTIONS.map((key) => (
        <section key={key} aria-labelledby={`legal-${key}`} className="mt-10">
          <h2 id={`legal-${key}`} className="font-display text-2xl font-semibold">
            {t(`${key}Title`)}
          </h2>
          <p className="mt-3 leading-relaxed text-fg/90">{t(key)}</p>
        </section>
      ))}
    </article>
  );
}
