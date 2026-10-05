import { setRequestLocale } from 'next-intl/server';
import { About } from '@/components/sections/About';
import { Contact } from '@/components/sections/Contact';
import { EducationList } from '@/components/sections/EducationList';
import { ExperienceTimeline } from '@/components/sections/ExperienceTimeline';
import { Games } from '@/components/sections/Games';
import { Hero } from '@/components/sections/Hero';
import { Projects } from '@/components/sections/Projects';
import { Skills } from '@/components/sections/Skills';
import { SiteZellige } from '@/components/zellige/SiteZellige';
import { ZelligeReveal } from '@/components/zellige/ZelligeReveal';
import type { Locale } from '@/i18n/routing';

/** Full-colour mosaic band: used twice at most on the whole site (see CLAUDE.md). */
function MosaicSeparator() {
  return (
    <ZelligeReveal className="border-y border-line">
      <SiteZellige cols={40} rows={1} fit="slice" animate className="h-14" />
    </ZelligeReveal>
  );
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  // The locale layout has already validated the segment.
  setRequestLocale(locale as Locale);

  return (
    <>
      <Hero />
      <MosaicSeparator />
      <About index={1} />
      <Skills index={2} />
      <ExperienceTimeline index={3} />
      <Projects index={4} />
      <Games index={5} />
      <EducationList index={6} />
      <MosaicSeparator />
      <Contact index={7} />
    </>
  );
}
