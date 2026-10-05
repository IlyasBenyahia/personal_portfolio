import { useTranslations } from 'next-intl';
import { SiteZellige } from '@/components/zellige/SiteZellige';

export function SiteFooter() {
  const t = useTranslations('Footer');
  return (
    <footer className="mt-24">
      <SiteZellige variant="line" cols={40} rows={1} fit="slice" className="h-10 text-fg/35" />
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{t('rights', { year: new Date().getFullYear() })}</p>
          <p>{t('builtWith')}</p>
          <a
            href="#contenu"
            className="font-mono text-xs underline-offset-4 hover:text-fg hover:underline"
          >
            {t('backToTop')} ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
