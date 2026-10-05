'use client';

import type { AbstractIntlMessages } from 'next-intl';
import { useState, type ComponentType } from 'react';
import type { ZelligeTile } from '@/components/zellige/geometry';
import type { SkillGroup } from '@/content/types';
import type { Locale } from '@/i18n/locales';
import { trackAttrs } from '@/lib/analytics';

type DialogProps = {
  tile: ZelligeTile;
  skills: SkillGroup[];
  locale: Locale;
  messages: AbstractIntlMessages;
  onClose: () => void;
};

/**
 * "Play" button. The game code (engine + dialog) is only downloaded on the
 * first click, so it costs nothing to visitors who don't play.
 */
export function GameLauncher({
  tile,
  locale,
  skills,
  label,
  loadingLabel,
  messages,
  className,
}: {
  tile: ZelligeTile;
  locale: Locale;
  skills: SkillGroup[];
  label: string;
  loadingLabel: string;
  /** Game texts, handed to the lazily loaded dialog (keeps them out of the page bundle). */
  messages: AbstractIntlMessages;
  className?: string;
}) {
  const [Dialog, setDialog] = useState<ComponentType<DialogProps> | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function launch() {
    setOpen(true);
    if (Dialog) return;
    setLoading(true);
    const mod = await import('./GameDialog');
    setDialog(() => mod.default);
    setLoading(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={launch}
        aria-haspopup="dialog"
        aria-busy={loading || undefined}
        className={className}
        {...trackAttrs('game_play')}
      >
        <span aria-hidden="true">▶ </span>
        {loading ? loadingLabel : label}
      </button>
      {open && Dialog && (
        <Dialog
          tile={tile}
          locale={locale}
          skills={skills}
          messages={messages}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
