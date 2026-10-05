'use client';

import NextLink from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { DEFAULT_LOCALE, isLocale, LOCALES, switchLocale, type Locale } from '@/i18n/locales';
import { trackAttrs } from '@/lib/analytics';

export interface LocaleSwitcherLabels {
  label: string;
  /** Per locale: its name, and "switch to …" for the inactive one. */
  items: Record<Locale, { name: string; switchTo: string }>;
}

/** Texts come translated from the server: no message formatting in the client bundle. */
export function LocaleSwitcher({ labels }: { labels: LocaleSwitcherLabels }) {
  const params = useParams<{ locale?: string }>();
  const current = isLocale(params?.locale) ? params.locale : DEFAULT_LOCALE;
  const pathname = usePathname() ?? `/${current}`;

  return (
    <nav aria-label={labels.label}>
      <ul className="flex items-center rounded-full border border-line p-1 font-mono text-xs">
        {LOCALES.map((locale) => {
          const active = locale === current;
          return (
            <li key={locale}>
              <NextLink
                href={switchLocale(pathname, locale)}
                {...(active ? {} : trackAttrs('locale_switch', { to: locale }))}
                hrefLang={locale}
                lang={locale}
                aria-current={active ? 'true' : undefined}
                aria-label={active ? labels.items[locale].name : labels.items[locale].switchTo}
                className="block rounded-full px-2.5 py-1.5 text-muted uppercase transition-colors hover:text-fg aria-[current]:bg-fg aria-[current]:text-bg"
              >
                {locale}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
