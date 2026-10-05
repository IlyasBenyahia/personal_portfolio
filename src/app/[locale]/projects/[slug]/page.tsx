import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getProject, projects } from '@/content/projects';
import { ProjectBadges } from '@/components/projects/ProjectBadges';
import { ProjectVisual } from '@/components/projects/ProjectVisual';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { PillarTag } from '@/components/ui/PillarTag';
import { TodoText } from '@/components/ui/TodoText';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { formatYearMonth } from '@/lib/format';
import { pageMetadata } from '@/lib/seo';
import { caseStudyGraph } from '@/lib/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/projects/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const l = locale as Locale;
  const t = await getTranslations({ locale: l, namespace: 'Seo' });
  const tMeta = await getTranslations({ locale: l, namespace: 'Metadata' });
  return {
    ...pageMetadata({
      locale: l,
      path: `/projects/${slug}`,
      title: `${project.title[l]} · ${t('caseStudy')}`,
      description: project.summary[l],
      siteName: tMeta('siteName'),
      type: 'article',
    }),
    // Placeholder case studies stay out of search results until filled in.
    robots: project.placeholder ? { index: false, follow: true } : undefined,
  };
}

export default async function CaseStudyPage({ params }: PageProps<'/[locale]/projects/[slug]'>) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const project = getProject(slug);
  if (!project) notFound();

  const t = await getTranslations('CaseStudy');
  const tCommon = await getTranslations('Common');
  const tNav = await getTranslations('Nav');
  const title = project.title[locale];
  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length]!;

  const blocks = [
    { id: 'context', label: t('context'), value: project.context[locale] },
    { id: 'role', label: t('role'), value: project.role[locale] },
    { id: 'result', label: t('result'), value: project.result[locale] },
  ];

  return (
    <article className="mx-auto max-w-6xl px-4 pt-10 pb-8 sm:px-6 sm:pt-14">
      <JsonLd
        data={caseStudyGraph(locale, project, {
          home: tCommon('home'),
          projects: tNav('projects'),
        })}
      />
      <nav aria-label={t('breadcrumb')}>
        <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
          <li>
            <Link href="/" className="hover:text-fg hover:underline">
              {tCommon('home')}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={{ pathname: '/', hash: 'projects' }}
              className="hover:text-fg hover:underline"
            >
              {tNav('projects')}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-fg">
            {title}
          </li>
        </ol>
      </nav>

      <header className="mt-10 max-w-3xl">
        <ProjectBadges project={project} />
        <h1 className="mt-5 font-display text-4xl leading-tight font-semibold tracking-tight [font-variation-settings:'opsz'_144] sm:text-6xl">
          <TodoText value={title} />
        </h1>
        <p className="mt-5 text-xl leading-relaxed text-muted">
          <TodoText value={project.summary[locale]} />
        </p>
      </header>

      <dl className="mt-10 grid gap-6 border-y border-line py-6 sm:grid-cols-3">
        <div>
          <dt className="font-mono text-xs tracking-widest text-muted uppercase">{t('year')}</dt>
          <dd className="mt-1">
            {project.year ? (
              formatYearMonth(project.year, locale)
            ) : (
              <TodoText value={t('yearTodo')} />
            )}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-xs tracking-widest text-muted uppercase">
            {t('technologies')}
          </dt>
          <dd className="mt-1">
            <ul className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <li key={tech}>
                  <TodoText value={tech} />
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div className="flex flex-wrap content-start gap-4">
          {project.pillars.map((p) => (
            <PillarTag key={p} pillar={p} />
          ))}
        </div>
      </dl>

      {project.visuals[0] && (
        <ProjectVisual visual={project.visuals[0]} priority className="mt-10" />
      )}

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_2fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          {project.privateSource && <p className="text-muted">{t('privateNote')}</p>}
          {(project.links.demo || project.links.source) && (
            <p className="mt-6 flex flex-wrap gap-3">
              {project.links.demo && (
                <ExternalLink
                  href={project.links.demo}
                  className="rounded-full bg-accent-strong px-5 py-2.5 font-medium text-on-accent"
                >
                  {t('demo')} ↗
                </ExternalLink>
              )}
              {project.links.source && !project.privateSource && (
                <ExternalLink
                  href={project.links.source}
                  className="rounded-full border border-fg/30 px-5 py-2.5 font-medium"
                >
                  {t('source')} ↗
                </ExternalLink>
              )}
            </p>
          )}
        </div>
        <div className="space-y-12">
          {blocks.map((b) => (
            <section key={b.id} aria-labelledby={`cs-${b.id}`}>
              <h2 id={`cs-${b.id}`} className="font-display text-3xl font-semibold">
                {b.label}
              </h2>
              <p className="mt-4 text-lg leading-relaxed">
                <TodoText value={b.value} />
              </p>
            </section>
          ))}
          {project.visuals.length > 1 && (
            <section aria-labelledby="cs-visuals">
              <h2 id="cs-visuals" className="font-display text-3xl font-semibold">
                {t('visuals')}
              </h2>
              <div className="mt-6 grid gap-6">
                {project.visuals.slice(1).map((v, i) => (
                  <ProjectVisual key={i} visual={v} sizes="(min-width: 1024px) 740px, 100vw" />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <nav className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
        <Link
          href={{ pathname: '/', hash: 'projects' }}
          className="font-mono text-sm text-muted hover:text-fg"
        >
          ← {t('back')}
        </Link>
        {next.slug !== project.slug && (
          <Link
            href={`/projects/${next.slug}`}
            className="text-right font-display text-xl font-semibold hover:text-accent"
          >
            <span className="block font-mono text-xs font-normal text-muted">{t('next')}</span>
            {next.title[locale]} →
          </Link>
        )}
      </nav>
    </article>
  );
}
