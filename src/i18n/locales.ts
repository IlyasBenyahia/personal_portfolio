/** Plain constants, safe to import from client components (no next-intl runtime). */
export const LOCALES = ['fr', 'en'] as const;
export const DEFAULT_LOCALE = 'fr';
export type Locale = (typeof LOCALES)[number];

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

export type LocalizedHref = string | { pathname: string; hash?: string };

/** "/projects/x" → "/fr/projects/x"; { pathname: '/', hash: 'contact' } → "/fr#contact". */
export function localizedHref(locale: Locale, href: LocalizedHref): string {
  const { pathname, hash } = typeof href === 'string' ? { pathname: href, hash: undefined } : href;
  const path = pathname === '/' ? '' : pathname;
  return `/${locale}${path}${hash ? `#${hash}` : ''}`;
}

/** Swaps the locale prefix of a localized pathname: "/fr/legal" → "/en/legal". */
export function switchLocale(pathname: string, to: Locale): string {
  const rest = pathname.replace(/^\/(fr|en)(?=\/|$)/, '');
  return `/${to}${rest}`;
}
