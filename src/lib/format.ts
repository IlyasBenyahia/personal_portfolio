import type { Locale } from '@/i18n/routing';
import type { YearMonth } from '@/content/types';

/** "2025-07" → "juillet 2025" / "July 2025"; "2023" → "2023". */
export function formatYearMonth(value: YearMonth, locale: Locale): string {
  const [year, month] = value.split('-');
  if (!month) return year!;
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, 1)));
}
