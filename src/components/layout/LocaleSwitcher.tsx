'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { trackAttrs } from '@/lib/analytics';

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const current = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t('label')}>
      <ul className="flex items-center rounded-full border border-line p-1 font-mono text-xs">
        {routing.locales.map((locale) => {
          const active = locale === current;
          return (
            <li key={locale}>
              <Link
                href={pathname}
                locale={locale}
                {...(active ? {} : trackAttrs('locale_switch', { to: locale }))}
                hrefLang={locale}
                lang={locale}
                aria-current={active ? 'true' : undefined}
                aria-label={active ? t(locale) : t('switchTo', { language: t(locale) })}
                className="block rounded-full px-2.5 py-1.5 text-muted uppercase transition-colors hover:text-fg aria-[current]:bg-fg aria-[current]:text-bg"
              >
                {locale}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
