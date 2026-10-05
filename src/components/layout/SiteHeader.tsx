import { useTranslations } from 'next-intl';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileMenu } from './MobileMenu';
import { NAV_ITEMS } from './nav-items';

export function SiteHeader() {
  const t = useTranslations();
  const items = NAV_ITEMS.map((item) => ({ id: item.id, label: t(`Nav.${item.key}`) }));

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md supports-[not(backdrop-filter:blur(1px))]:bg-bg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight [font-variation-settings:'opsz'_48]"
        >
          Ilyas Benyahia
        </Link>

        <nav aria-label={t('Common.mainNav')} className="hidden lg:block">
          <ul className="flex items-center gap-1 text-sm">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={{ pathname: '/', hash: item.id }}
                  className="rounded-md px-2.5 py-2 text-muted transition-colors hover:text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
          <MobileMenu
            items={items}
            labels={{
              open: t('Common.openMenu'),
              close: t('Common.closeMenu'),
              nav: t('Common.mainNav'),
            }}
          />
        </div>
      </div>
    </header>
  );
}
