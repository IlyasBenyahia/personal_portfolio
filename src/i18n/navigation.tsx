'use client';

import NextLink from 'next/link';
import { useParams } from 'next/navigation';
import type { ComponentProps } from 'react';
import {
  DEFAULT_LOCALE,
  isLocale,
  localizedHref,
  type Locale,
  type LocalizedHref,
} from './locales';

type Props = Omit<ComponentProps<typeof NextLink>, 'href' | 'locale'> & {
  href: LocalizedHref;
  /** Target locale; defaults to the current one (from the [locale] segment). */
  locale?: Locale;
};

/**
 * Localized link on top of next/link. Deliberately not next-intl's Link:
 * that one pulls the ICU message formatter into the page bundle (~20 KB gzip).
 */
export function Link({ href, locale, ...props }: Props) {
  const params = useParams<{ locale?: string }>();
  const current = isLocale(params?.locale) ? params.locale : DEFAULT_LOCALE;
  return <NextLink href={localizedHref(locale ?? current, href)} {...props} />;
}
