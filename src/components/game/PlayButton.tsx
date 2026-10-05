import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/locales';
import { getSiteTile } from '@/components/zellige/site-tile';
import { skillGroups } from '@/content/skills';
import { GameLauncher } from './GameLauncher';

/** Server wrapper: hands the site tile, the skills (the game's only content) and the game texts to the launcher. */
export async function PlayButton({ label, className }: { label: string; className?: string }) {
  const [tile, messages, t, locale] = await Promise.all([
    getSiteTile(),
    getMessages(),
    getTranslations('Game'),
    getLocale(),
  ]);
  return (
    <GameLauncher
      tile={tile}
      locale={locale as Locale}
      skills={skillGroups}
      label={label}
      loadingLabel={t('loading')}
      messages={{ Game: messages.Game, Hero: { pillars: messages.Hero.pillars } }}
      className={className}
    />
  );
}
