import type { Metadata } from 'next';
import { routing, type Locale } from '@/i18n/routing';
import { SITE_URL } from './site';

const OG_LOCALE: Record<Locale, string> = { fr: 'fr_FR', en: 'en_US' };

/** Absolute URL of a localized path ("" = home). No trailing slash. */
export function localizedUrl(locale: Locale, path = ''): string {
  return `${SITE_URL}/${locale}${path}`;
}

/** canonical + hreflang (fr, en, x-default → default locale) for a path shared by both locales. */
export function alternatesFor(locale: Locale, path = ''): Metadata['alternates'] {
  return {
    canonical: localizedUrl(locale, path),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l, path)])),
      'x-default': localizedUrl(routing.defaultLocale, path),
    },
  };
}

/**
 * Page-level metadata: unique title/description, canonical, hreflang,
 * Open Graph and Twitter. The images come from the route's
 * opengraph-image / twitter-image files, generated at build time.
 */
export function pageMetadata({
  locale,
  path = '',
  title,
  description,
  siteName,
  type = 'website',
  absoluteTitle = false,
}: {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  siteName: string;
  type?: 'website' | 'article' | 'profile';
  absoluteTitle?: boolean;
}): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: alternatesFor(locale, path),
    openGraph: {
      type,
      url: localizedUrl(locale, path),
      siteName,
      title,
      description,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}
