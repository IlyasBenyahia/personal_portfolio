import type { Metadata } from 'next';
import { Zellige } from '@/components/zellige/Zellige';
import { ZelligeScrollBuild } from '@/components/zellige/ZelligeScrollBuild';
import { innerRadius, polygonPath, type Point } from '@/components/zellige/geometry';
import { loadSvgTile } from '@/components/zellige/load-svg-tile';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

// TEMPORARY prototype page: delete src/app/fr/test-zellige once direction B is decided.
export const metadata: Metadata = {
  title: 'Prototype zellige · Direction B',
  robots: { index: false, follow: false },
};

const SWATCHES = [
  { name: 'Papier', token: '--bg' },
  { name: 'Encre', token: '--fg' },
  { name: 'Terracotta · Concevoir', token: '--accent-strong' },
  { name: 'Bleu de Fès · Développer', token: '--blue' },
  { name: 'Menthe profonde · Faire croître', token: '--teal' },
  { name: 'Sable', token: '--z-neutral' },
];

const PILLARS = [
  {
    title: 'Concevoir',
    color: 'text-accent',
    items: 'UI/UX design, Figma, Adobe XD, Illustrator…',
  },
  { title: 'Développer', color: 'text-blue', items: 'TypeScript, React, Next.js, Unity, C#…' },
  {
    title: 'Faire croître',
    color: 'text-teal',
    items: 'SEO technique, Semrush, Google Ads, Facebook Ads…',
  },
];

function Separator({ variant }: { variant: 'mosaic' | 'line' }) {
  return (
    <div className="border-line border-y" role="presentation">
      <Zellige
        variant={variant}
        cols={40}
        rows={1}
        fit="slice"
        className={variant === 'line' ? 'text-fg/40 h-10' : 'h-12'}
      />
    </div>
  );
}

/** One cell enlarged, with the construction lines the geometry module computes. */
function Anatomy() {
  const R = 50;
  const r = innerRadius(R);
  const square = (deg: number): Point[] =>
    [0, 90, 180, 270].map((a) => {
      const t = ((a + deg) * Math.PI) / 180;
      return [R + R * Math.cos(t), R + R * Math.sin(t)];
    });
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm">
      <Zellige cols={1} rows={1} className="absolute inset-0 h-full" />
      <svg
        viewBox="-2 -2 104 104"
        className="text-fg absolute inset-[-2%] h-[104%] w-[104%]"
        aria-hidden="true"
      >
        <g fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 1.5">
          <rect x="0" y="0" width="100" height="100" />
          <circle cx={R} cy={R} r={R} />
          <circle cx={R} cy={R} r={r} />
          <path d={polygonPath(square(0))} strokeDasharray="none" strokeWidth="0.7" />
          <path d={polygonPath(square(45))} strokeDasharray="none" strokeWidth="0.7" />
        </g>
      </svg>
    </div>
  );
}

export default async function TestZelligePage() {
  const customTile = await loadSvgTile('exemple-illustrator');

  return (
    <>
      <a
        href="#contenu"
        className="focus:bg-fg focus:text-bg sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:px-4 focus:py-2"
      >
        Aller au contenu
      </a>

      <header className="border-line bg-bg/85 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="text-muted font-mono text-xs tracking-widest uppercase">
            Prototype · Direction B « Atelier Zellige »
          </p>
          <ThemeToggle />
        </div>
      </header>

      <main id="contenu">
        {/* 1. Hero background */}
        <section className="relative isolate overflow-hidden">
          <Zellige
            variant="line"
            cols={18}
            rows={10}
            fit="slice"
            className="text-fg absolute inset-0 -z-10 h-full [mask-image:radial-gradient(ellipse_at_70%_40%,black_10%,transparent_70%)] opacity-[0.13]"
          />
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
            <p className="text-accent font-mono text-xs tracking-widest uppercase">
              Front-end Developer & UI/UX Designer
            </p>
            <h1 className="font-display mt-5 max-w-3xl text-5xl leading-[1.02] font-semibold tracking-tight [font-variation-settings:'opsz'_144,'SOFT'_50] sm:text-7xl lg:text-8xl">
              Ilyas Benyahia
            </h1>
            <p className="text-muted mt-6 max-w-xl text-lg leading-relaxed sm:text-xl">
              Concevoir, développer, faire croître : je porte un produit digital de l’idée à la
              croissance. <span className="font-mono text-sm">{'// texte provisoire'}</span>
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#construction"
                className="bg-accent-strong text-on-accent rounded-full px-6 py-3 font-medium transition hover:brightness-110"
              >
                Voir mes projets
              </a>
              <a
                href="#import"
                className="border-fg/30 hover:border-fg rounded-full border px-6 py-3 font-medium transition"
              >
                Me contacter
              </a>
              <a
                href="#palette"
                className="text-muted hover:text-fg rounded-full px-6 py-3 font-mono text-sm underline-offset-4 transition hover:underline"
              >
                ▶ Jouer
              </a>
            </div>
          </div>
          <p className="text-muted absolute right-4 bottom-3 font-mono text-[11px]">
            Usage 1 · fond de hero (variante « line »)
          </p>
        </section>

        {/* 2. Separator */}
        <Separator variant="mosaic" />
        <p className="text-muted mx-auto max-w-6xl px-4 pt-3 font-mono text-[11px] sm:px-6">
          Usage 2 · séparateur de section (variante « mosaic », taille de tuile fixe, recadré sur
          mobile)
        </p>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6" aria-labelledby="competences">
          <h2
            id="competences"
            className="font-display text-3xl font-semibold tracking-tight sm:text-5xl"
          >
            Le triptyque, en couleurs
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {PILLARS.map((p) => (
              <li key={p.title} className="border-line bg-surface rounded-2xl border p-6">
                <h3 className={`font-display text-2xl font-semibold ${p.color}`}>{p.title}</h3>
                <p className="text-muted mt-3">{p.items}</p>
              </li>
            ))}
          </ul>
        </section>

        <Separator variant="line" />
        <p className="text-muted mx-auto max-w-6xl px-4 pt-3 font-mono text-[11px] sm:px-6">
          Variante discrète du séparateur (« line »)
        </p>

        {/* 3. Tile-by-tile build */}
        <section aria-labelledby="animation" className="mt-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2
              id="animation"
              className="font-display text-3xl font-semibold tracking-tight sm:text-5xl"
            >
              Tuile par tuile
            </h2>
            <p className="text-muted mt-4 max-w-xl">
              Usage 3 · faites défiler : le motif se pose depuis le centre, au rythme du scroll.
              Avec « réduire les animations » activé, il s’affiche directement terminé.
            </p>
          </div>
          <ZelligeScrollBuild length={1.4}>
            <div className="w-[min(92vw,1100px)]">
              <Zellige cols={9} rows={5} animate />
            </div>
          </ZelligeScrollBuild>
        </section>

        {/* Construction */}
        <section
          id="construction"
          className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 md:grid-cols-2"
          aria-labelledby="geometrie"
        >
          <div>
            <h2
              id="geometrie"
              className="font-display text-3xl font-semibold tracking-tight sm:text-5xl"
            >
              Tracé par calcul
            </h2>
            <ol className="text-muted marker:text-accent mt-6 list-decimal space-y-3 pl-5 marker:font-mono">
              <li>
                Grille carrée de période P. Une étoile {'{8/2}'} (deux carrés de rayon R = P/2,
                tournés de 45°) au centre de chaque cellule.
              </li>
              <li>
                Avec R = P/2, les pointes axiales des étoiles voisines se touchent exactement sur le
                bord de la cellule.
              </li>
              <li>
                L’espace restant entre quatre étoiles forme une croix à bras pointus, centrée sur
                chaque coin : le pavage est complet, sans recouvrement.
              </li>
              <li>
                Chaque étoile est découpée en 8 pointes, une bague octogonale et une rosace ; chaque
                croix en un carré central et 4 bras. Le joint (« grout ») est le fond de page.
              </li>
            </ol>
            <p className="text-muted mt-6 font-mono text-xs">
              src/components/zellige/geometry.ts · aucune coordonnée saisie à la main.
            </p>
          </div>
          <Anatomy />
        </section>

        {/* Custom SVG import */}
        <section id="import" className="border-line border-t" aria-labelledby="illustrator">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <h2
              id="illustrator"
              className="font-display text-3xl font-semibold tracking-tight sm:text-5xl"
            >
              Vos tuiles Illustrator
            </h2>
            <p className="text-muted mt-4 max-w-2xl">
              Le même composant accepte un SVG exporté d’Illustrator, lu au build depuis{' '}
              <code className="text-fg font-mono text-sm">src/zellige/tiles/</code>. Ci-dessous, un
              exemple de fichier au format Illustrator (octogones + carrés + étoile {'{8/3}'}),
              recoloré avec la palette (à gauche) ou avec ses couleurs d’origine (à droite).
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <figure>
                <Zellige tile={customTile} cols={6} rows={4} className="rounded-xl" />
                <figcaption className="text-muted mt-2 font-mono text-[11px]">
                  {'<Zellige tile={await loadSvgTile("exemple-illustrator")} />'}
                </figcaption>
              </figure>
              <figure>
                <Zellige tile={customTile} cols={6} rows={4} keepColors className="rounded-xl" />
                <figcaption className="text-muted mt-2 font-mono text-[11px]">
                  keepColors
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Palette & type */}
        <section id="palette" className="border-line border-t" aria-labelledby="systeme">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <h2
              id="systeme"
              className="font-display text-3xl font-semibold tracking-tight sm:text-5xl"
            >
              Palette B & typographies
            </h2>
            <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {SWATCHES.map((s) => (
                <li key={s.token}>
                  <div
                    className="border-line aspect-[4/3] rounded-lg border"
                    style={{ background: `var(${s.token})` }}
                  />
                  <p className="mt-2 text-sm">{s.name}</p>
                  <p className="text-muted font-mono text-[11px]">{s.token}</p>
                </li>
              ))}
            </ul>
            <div className="mt-16 grid gap-10 md:grid-cols-3">
              <div>
                <p className="text-muted font-mono text-[11px] tracking-widest uppercase">
                  Fraunces · titres
                </p>
                <p className="font-display mt-3 text-5xl leading-none font-semibold [font-variation-settings:'opsz'_144,'SOFT'_50]">
                  Aa Ŝœ 2027
                </p>
                <p className="font-display mt-3 text-xl italic">Des produits digitaux rentables.</p>
              </div>
              <div>
                <p className="text-muted font-mono text-[11px] tracking-widest uppercase">
                  Inter · texte
                </p>
                <p className="mt-3 leading-relaxed">
                  Front-end developer et UI/UX designer basé à Rabat. Double profil web et jeu
                  vidéo, orienté croissance. Texte courant à 16–18 px, interlignage 1,6.
                </p>
              </div>
              <div>
                <p className="text-muted font-mono text-[11px] tracking-widest uppercase">
                  JetBrains Mono · détails
                </p>
                <p className="mt-3 font-mono text-sm leading-relaxed">
                  2025 — présent
                  <br />
                  next@16 · typescript
                  <br />
                  score: 0000
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-line border-t">
        <Zellige cols={40} rows={1} fit="slice" className="h-6 opacity-90" />
        <p className="text-muted mx-auto max-w-6xl px-4 py-8 font-mono text-xs sm:px-6">
          Page temporaire de prototype (non indexée, hors sitemap) · à supprimer après validation.
        </p>
      </footer>
    </>
  );
}
