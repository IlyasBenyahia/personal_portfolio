import Link from 'next/link';
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/site';

/**
 * `/` has no content of its own: it forwards to /en for English-first browsers
 * and to /fr (the default) otherwise. The meta refresh covers visitors without JS.
 */
export const metadata: Metadata = {
  title: 'Ilyas Benyahia',
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE_URL}/${routing.defaultLocale}` },
};

const detect = `try{var l=(navigator.languages&&navigator.languages[0])||navigator.language||'';location.replace(/^en\\b/i.test(l)?'/en':'/fr')}catch(e){location.replace('/fr')}`;

export default function RootRedirect() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: detect }} />
      <meta httpEquiv="refresh" content={`0; url=/${routing.defaultLocale}`} />
      <p style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <Link href="/fr">Français</Link> · <Link href="/en">English</Link>
      </p>
    </>
  );
}
