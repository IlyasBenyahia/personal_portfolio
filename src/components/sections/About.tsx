import { useLocale, useTranslations } from 'next-intl';
import { profile } from '@/content/profile';
import { SiteZellige } from '@/components/zellige/SiteZellige';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TodoText } from '@/components/ui/TodoText';

export function About({ index }: { index: number }) {
  const t = useTranslations('About');
  const locale = useLocale();

  return (
    <Section id="about">
      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] md:gap-16">
        <div>
          <SectionHeading id="about-title" index={index} title={t('title')} />
          <div className="mt-8 space-y-5 text-lg leading-relaxed">
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>
            <p>{t('p3')}</p>
          </div>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-xs tracking-widest text-muted uppercase">
                {t('location')}
              </dt>
              <dd className="mt-1">{profile.location[locale]}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs tracking-widest text-muted uppercase">
                {t('languages')}
              </dt>
              <dd className="mt-1">{profile.languages.map((l) => l[locale]).join(', ')}</dd>
            </div>
          </dl>
        </div>

        {/* TODO: replace with the portrait (optimised at build in phase 4). */}
        <figure className="relative isolate mx-auto aspect-[4/5] w-full max-w-sm self-center overflow-hidden rounded-2xl border border-dashed border-line bg-surface">
          <SiteZellige
            variant="line"
            cols={4}
            rows={5}
            fit="slice"
            className="absolute inset-0 -z-10 h-full text-fg opacity-15"
          />
          <figcaption className="grid h-full place-items-center p-6 text-center">
            <TodoText value={t('photoTodo')} />
          </figcaption>
        </figure>
      </div>
    </Section>
  );
}
