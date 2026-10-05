import { useTranslations } from 'next-intl';

export function SkipLink() {
  const t = useTranslations('Common');
  return (
    <a
      href="#contenu"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-fg focus:px-4 focus:py-2 focus:text-bg"
    >
      {t('skipToContent')}
    </a>
  );
}
