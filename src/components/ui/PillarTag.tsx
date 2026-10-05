import { useTranslations } from 'next-intl';
import type { Pillar } from '@/content/types';

export const PILLAR_TEXT: Record<Pillar, string> = {
  design: 'text-accent',
  develop: 'text-blue',
  grow: 'text-teal',
};

export const PILLAR_DOT: Record<Pillar, string> = {
  design: 'bg-accent-strong',
  develop: 'bg-blue',
  grow: 'bg-teal',
};

export function PillarTag({ pillar }: { pillar: Pillar }) {
  const t = useTranslations('Hero.pillars');
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
      <span aria-hidden="true" className={`size-2 rotate-45 ${PILLAR_DOT[pillar]}`} />
      {t(pillar)}
    </span>
  );
}
