import { useLocale, useTranslations } from 'next-intl';
import { skillGroups } from '@/content/skills';
import { localize } from '@/content/types';
import { PILLAR_DOT, PILLAR_TEXT } from '@/components/ui/PillarTag';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Skills({ index }: { index: number }) {
  const t = useTranslations('Skills');
  const locale = useLocale();

  return (
    <Section id="skills">
      <SectionHeading id="skills-title" index={index} title={t('title')} intro={t('intro')} />
      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {skillGroups.map((group, i) => (
          <li
            key={group.pillar}
            className="relative flex flex-col rounded-2xl border border-line bg-surface p-6 sm:p-8"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-x-6 top-0 h-1 rounded-b ${PILLAR_DOT[group.pillar]} sm:inset-x-8`}
            />
            <p aria-hidden="true" className="font-mono text-xs text-muted">
              {String(i + 1).padStart(2, '0')} / 03
            </p>
            <h3 className={`mt-2 font-display text-3xl font-semibold ${PILLAR_TEXT[group.pillar]}`}>
              {t(`pillars.${group.pillar}.title`)}
            </h3>
            <p className="mt-3 text-muted">{t(`pillars.${group.pillar}.description`)}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {group.items.map((item) => {
                const label = localize(item, locale);
                return (
                  <li
                    key={label}
                    className="rounded-full border border-line bg-bg px-3 py-1 text-sm"
                  >
                    {label}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  );
}
