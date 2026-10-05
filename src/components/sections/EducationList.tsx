import { useLocale, useTranslations } from 'next-intl';
import { education } from '@/content/education';
import { formatYearMonth } from '@/lib/format';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TodoText } from '@/components/ui/TodoText';

export function EducationList({ index }: { index: number }) {
  const t = useTranslations('Education');
  const locale = useLocale();

  return (
    <Section id="education">
      <SectionHeading id="education-title" index={index} title={t('title')} />
      <ol className="mt-12 divide-y divide-line border-y border-line">
        {education.map((item) => (
          <li key={item.id} className="grid gap-2 py-6 sm:grid-cols-[12rem_1fr] sm:gap-8">
            <p className="font-mono text-sm text-muted">
              {item.date === null ? (
                <TodoText value={t('yearTodo')} />
              ) : item.inProgress ? (
                t('expected', { date: formatYearMonth(item.date, locale) })
              ) : (
                <time dateTime={item.date}>{formatYearMonth(item.date, locale)}</time>
              )}
            </p>
            <div>
              <h3 className="font-display text-xl font-semibold sm:text-2xl">
                {item.degree[locale]}
              </h3>
              <p className="mt-1 text-muted">{item.school}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
