import Link from 'next/link';
import type { Metadata } from 'next';
import { fontVariables } from './fonts';
import { Zellige } from '@/components/zellige/Zellige';
import './globals.css';

// Single static 404.html for both languages (no locale is known for an unmatched URL).
export const metadata: Metadata = {
  title: 'Page introuvable · Page not found',
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="fr" className={fontVariables}>
      <body className="grid min-h-svh place-items-center px-4">
        <main className="w-full max-w-xl py-16 text-center">
          <Zellige variant="line" cols={6} rows={1} className="mx-auto w-48 text-fg/40" />
          <h1 className="mt-8 font-display text-5xl font-semibold tracking-tight">404</h1>
          <p className="mt-4 text-lg">
            Cette page n’existe pas ou a été déplacée.
            <br />
            <span lang="en" className="text-muted">
              This page doesn’t exist or has moved.
            </span>
          </p>
          <p className="mt-8 flex justify-center gap-3">
            <Link
              href="/fr"
              className="rounded-full bg-accent-strong px-5 py-2.5 font-medium text-on-accent"
            >
              Retour à l’accueil
            </Link>
            <Link
              href="/en"
              lang="en"
              className="rounded-full border border-fg/30 px-5 py-2.5 font-medium"
            >
              Back to home
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
