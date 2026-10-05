import type { ReactNode } from 'react';
import '../globals.css';

/** Root layout for the bare domain only: it just forwards to a locale. */
export default function RootRedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
