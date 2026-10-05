import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/Hero';
import { SiteZellige } from '@/components/zellige/SiteZellige';
import { ZelligeReveal } from '@/components/zellige/ZelligeReveal';
import type { Locale } from '@/i18n/routing';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  // The locale layout has already validated the segment.
  setRequestLocale(locale as Locale);

  return (
    <>
      <Hero />
      {/* Full-colour mosaic: signature separator #1 of 2 max (see CLAUDE.md). */}
      <ZelligeReveal className="border-y border-line">
        <SiteZellige cols={40} rows={1} fit="slice" animate className="h-14" />
      </ZelligeReveal>
      {/* TODO(phase 2): about, skills, experience, projects, games, education, contact. */}
    </>
  );
}
