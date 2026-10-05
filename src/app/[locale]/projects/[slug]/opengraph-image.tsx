import { getTranslations } from 'next-intl/server';
import { getProject, projects } from '@/content/projects';
import { routing, type Locale } from '@/i18n/routing';
import { OG_SIZE, renderOgImage } from '@/lib/og';

export const dynamic = 'force-static';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Ilyas Benyahia · Case study';

// Image routes are route handlers: they need every param, the parent's included.
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  const project = getProject(slug)!;
  const t = await getTranslations({ locale, namespace: 'Hero' });
  const tCase = await getTranslations({ locale, namespace: 'Seo' });
  return renderOgImage({
    eyebrow: tCase('caseStudyEyebrow'),
    title: project.title[locale],
    subtitle: project.summary[locale],
    pillars: [t('pillars.design'), t('pillars.develop'), t('pillars.grow')],
  });
}
