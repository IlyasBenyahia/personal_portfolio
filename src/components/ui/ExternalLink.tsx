import { useTranslations } from 'next-intl';
import type { ComponentProps } from 'react';

/** Link opening in a new tab, announced to screen readers. */
export function ExternalLink({ children, ...props }: ComponentProps<'a'>) {
  const t = useTranslations('Contact');
  return (
    <a target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      <span className="sr-only"> {t('newTab')}</span>
    </a>
  );
}
