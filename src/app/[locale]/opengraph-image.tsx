import { getTranslations } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { OG_SIZE, renderOgImage } from '@/lib/og';

export const dynamic = 'force-static';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Ilyas Benyahia · Front-end Developer & UI/UX Designer';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: 'Hero' });
  return renderOgImage({
    eyebrow: t('eyebrow'),
    title: t('title'),
    subtitle: t('role'),
    pillars: [t('pillars.design'), t('pillars.develop'), t('pillars.grow')],
  });
}
