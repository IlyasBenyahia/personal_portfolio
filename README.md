# benyahiailyas.com

Portfolio d'Ilyas Benyahia : Front-end Developer & UI/UX Designer, futur
Growth Engineer. Site 100 % statique, bilingue FR/EN.

- Next.js 16 (App Router, `output: 'export'`), TypeScript strict, Tailwind CSS v4
- next-intl (routes `/fr` et `/en`, sans middleware)
- Hébergement : Cloudflare Workers Static Assets

## Démarrer

```bash
npm install
cp .env.example .env   # puis renseigner les clés
npm run dev            # http://localhost:3000/fr
npm run build          # export statique dans out/
```

Autres commandes : `npm run lint`, `npm run typecheck`, `npm run check`,
`npm run start` (sert `out/`), `npm run deploy`.

## Modifier les contenus

- Textes de l'interface : `messages/fr.json` et `messages/en.json`.
- Parcours, projets, compétences, formation, jeux, profil : `src/content/*.ts`
  (textes `{ fr, en }`, valeurs manquantes préfixées `TODO:`).

## Motif zellige : utiliser vos propres tuiles

Le motif actuel est un placeholder calculé. Pour le remplacer par une tuile
dessinée dans Illustrator :

1. Plan de travail **carré**, une répétition, raccordable sur ses 4 bords
   (les formes qui chevauchent un bord sont dessinées une seule fois et
   débordent du plan de travail).
2. Pièces remplies avec les **couleurs de référence**, recolorées
   automatiquement en clair et en sombre :
   `#C2410C` (primary), `#1E40AF` (secondary), `#0F766E` (tertiary),
   `#E6D9C2` (neutral), `#1C1917` (ink). Pas de contour : le joint est ajouté
   automatiquement.
3. Export SVG dans `src/zellige/tiles/ma-tuile.svg`.
4. Dans `src/zellige/config.ts` :
   `export const SITE_TILE: TileSource = { kind: 'svg', file: 'ma-tuile' };`

Guide complet (raccords, rôles, réglages d'export) :
[`src/zellige/README.md`](src/zellige/README.md).
