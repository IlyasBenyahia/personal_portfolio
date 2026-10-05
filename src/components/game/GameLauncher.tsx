'use client';

import { useTranslations } from 'next-intl';
import { useState, type ComponentType } from 'react';
import type { ZelligeTile } from '@/components/zellige/geometry';
import type { SkillGroup } from '@/content/types';
import { trackAttrs } from '@/lib/analytics';

type DialogProps = { tile: ZelligeTile; skills: SkillGroup[]; onClose: () => void };

/**
 * "Play" button. The game code (engine + dialog) is only downloaded on the
 * first click, so it costs nothing to visitors who don't play.
 */
export function GameLauncher({
  tile,
  skills,
  label,
  className,
}: {
  tile: ZelligeTile;
  skills: SkillGroup[];
  label: string;
  className?: string;
}) {
  const t = useTranslations('Game');
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
        {loading ? t('loading') : label}
      </button>
      {open && Dialog && <Dialog tile={tile} skills={skills} onClose={() => setOpen(false)} />}
    </>
  );
}
