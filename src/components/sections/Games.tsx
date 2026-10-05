import { useLocale, useTranslations } from 'next-intl';
import { games } from '@/content/games';
import { SiteZellige } from '@/components/zellige/SiteZellige';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Games({ index }: { index: number }) {
  const t = useTranslations('Games');
  const locale = useLocale();

  return (
    <Section id="games">
      <SectionHeading id="games-title" index={index} title={t('title')} intro={t('intro')} />
      <ul className="mt-12 grid gap-6 md:grid-cols-2">
        {games.map((game) => (
          <li
            key={game.id}
            className="flex flex-col rounded-2xl border border-line bg-surface p-6 sm:p-8"
          >
            <p>
              <Badge>
                {t('published')} · {game.platform}
              </Badge>
            </p>
            <h3 className="mt-4 font-display text-3xl font-semibold">{game.title}</h3>
            <p className="mt-3 flex-1 text-lg text-muted">{game.description[locale]}</p>
            <p className="mt-6">
              <ExternalLink
                href={game.url}
                className="inline-flex items-center gap-2 rounded-full border border-fg/30 px-5 py-2.5 font-medium transition hover:border-fg"
              >
                {t('play', { title: game.title, platform: game.platform })} ↗
              </ExternalLink>
            </p>
          </li>
        ))}
        <li className="relative isolate flex flex-col overflow-hidden rounded-2xl border border-dashed border-line p-6 sm:p-8">
          <SiteZellige
            variant="line"
            cols={8}
            rows={4}
            fit="slice"
            className="absolute inset-0 -z-10 h-full text-fg opacity-10"
          />
          <p>
            <Badge>{t('upcoming')}</Badge>
          </p>
          <h3 className="mt-4 font-display text-3xl font-semibold">{t('upcomingTitle')}</h3>
          <p className="mt-3 text-lg text-muted">{t('upcomingText')}</p>
        </li>
      </ul>
    </Section>
  );
}
