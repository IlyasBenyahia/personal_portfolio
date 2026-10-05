import { useLocale, useTranslations } from 'next-intl';
import { experiences } from '@/content/experience';
import type { Period } from '@/content/types';
import type { Locale } from '@/i18n/routing';
import { formatYearMonth } from '@/lib/format';
import { PillarTag } from '@/components/ui/PillarTag';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TodoText } from '@/components/ui/TodoText';

function PeriodLabel({
  period,
  locale,
  present,
}: {
  period: Period;
  locale: Locale;
  present: string;
}) {
  return (
    <>
      <time dateTime={period.start}>{formatYearMonth(period.start, locale)}</time>
      {period.end !== undefined && (
        <>
          {' – '}
          {period.end === null ? (
            present
          ) : (
            <time dateTime={period.end}>{formatYearMonth(period.end, locale)}</time>
          )}
        </>
      )}
    </>
  );
}

export function ExperienceTimeline({ index }: { index: number }) {
  const t = useTranslations('Experience');
  const locale = useLocale();

  return (
    <Section id="experience">
      <SectionHeading id="experience-title" index={index} title={t('title')} />
      <ol className="mt-12 border-l border-line">
        {experiences.map((xp) => (
          <li key={xp.id} className="relative pb-12 pl-8 last:pb-0 sm:pl-12">
            <span
              aria-hidden="true"
              className="absolute top-1.5 -left-[5px] size-2.5 rotate-45 bg-accent-strong"
            />
            <p className="font-mono text-sm text-muted">
              <PeriodLabel period={xp.period} locale={locale} present={t('present')} />
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold">{xp.company}</h3>
            <p className="mt-1 text-lg">
              <TodoText value={xp.role[locale]} />
              {xp.type && <span className="text-muted"> · {xp.type[locale]}</span>}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-muted marker:text-line">
              {xp.missions.map((m) => (
                <li key={m[locale]}>
                  <TodoText value={m[locale]} />
                </li>
              ))}
            </ul>
            {xp.pillars.length > 0 && (
              <p className="mt-4 flex flex-wrap gap-4">
                {xp.pillars.map((p) => (
                  <PillarTag key={p} pillar={p} />
                ))}
              </p>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
