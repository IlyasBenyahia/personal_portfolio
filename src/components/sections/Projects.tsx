import { useLocale, useTranslations } from 'next-intl';
import { projects } from '@/content/projects';
import { Link } from '@/i18n/navigation';
import { ProjectBadges } from '@/components/projects/ProjectBadges';
import { ProjectVisual } from '@/components/projects/ProjectVisual';
import { PillarTag } from '@/components/ui/PillarTag';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TodoText } from '@/components/ui/TodoText';

export function Projects({ index }: { index: number }) {
  const t = useTranslations('Projects');
  const locale = useLocale();

  return (
    <Section id="projects">
      <SectionHeading id="projects-title" index={index} title={t('title')} intro={t('intro')} />
      <ul className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const title = project.title[locale];
          const cover = project.visuals[0];
          return (
            <li
              key={project.slug}
              className="group relative flex flex-col rounded-2xl border border-line bg-surface p-4 transition-colors focus-within:border-fg/40 hover:border-fg/40"
            >
              {cover && <ProjectVisual visual={cover} />}
              <div className="flex flex-1 flex-col px-2 pt-5 pb-2">
                <ProjectBadges project={project} />
                <h3 className="mt-4 font-display text-2xl font-semibold">
                  <Link
                    href={`/projects/${project.slug}`}
                    aria-label={t('viewCaseOf', { title })}
                    className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent"
                  >
                    <TodoText value={title} />
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-muted">
                  <TodoText value={project.summary[locale]} />
                </p>
                <p className="mt-5 flex flex-wrap gap-4">
                  {project.pillars.map((p) => (
                    <PillarTag key={p} pillar={p} />
                  ))}
                </p>
                <p
                  aria-hidden="true"
                  className="mt-5 font-mono text-sm text-accent group-hover:underline"
                >
                  {t('viewCase')} →
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
