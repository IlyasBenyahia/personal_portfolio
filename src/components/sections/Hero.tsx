import { useTranslations } from 'next-intl';
import { PlayButton } from '@/components/game/PlayButton';
import { SiteZellige } from '@/components/zellige/SiteZellige';
import { Link } from '@/i18n/navigation';

const PILLARS = [
  { key: 'design', className: 'text-accent' },
  { key: 'develop', className: 'text-blue' },
  { key: 'grow', className: 'text-teal' },
] as const;

export function Hero() {
  const t = useTranslations('Hero');
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <SiteZellige
        variant="line"
        cols={18}
        rows={10}
        fit="slice"
        className="absolute inset-0 -z-10 h-full [mask-image:radial-gradient(ellipse_at_75%_35%,black_5%,transparent_70%)] text-fg opacity-[0.12]"
      />
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32 lg:pt-36 lg:pb-40">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">{t('eyebrow')}</p>
        <h1
          id="hero-title"
          className="mt-5 font-display text-5xl leading-[1.02] font-semibold tracking-tight [font-variation-settings:'opsz'_144] sm:text-7xl lg:text-8xl"
        >
          {t('title')}
        </h1>
        <p className="mt-4 font-mono text-sm text-muted">{t('role')}</p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">{t('tagline')}</p>

        <ol className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-xl italic sm:text-2xl">
          {PILLARS.map((p, i) => (
            <li key={p.key} className="flex items-center gap-3">
              {i > 0 && (
                <span aria-hidden="true" className="font-mono text-base text-muted not-italic">
                  →
                </span>
              )}
              <span className={p.className}>{t(`pillars.${p.key}`)}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href={{ pathname: '/', hash: 'projects' }}
            className="rounded-full bg-accent-strong px-6 py-3 font-medium text-on-accent transition hover:brightness-110"
          >
            {t('ctaProjects')}
          </Link>
          <Link
            href={{ pathname: '/', hash: 'contact' }}
            className="rounded-full border border-fg/30 px-6 py-3 font-medium transition hover:border-fg"
          >
            {t('ctaContact')}
          </Link>
          <PlayButton
            label={t('ctaPlay')}
            className="rounded-full px-4 py-3 font-mono text-sm text-muted underline-offset-4 transition hover:text-fg hover:underline"
          />
        </div>
      </div>
    </section>
  );
}
