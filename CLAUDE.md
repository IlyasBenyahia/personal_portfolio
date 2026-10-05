# CLAUDE.md — portfolio d'Ilyas Benyahia

Portfolio personnel publié sur https://benyahiailyas.com. Objectifs :

1. décrocher des opportunités (emploi, freelance) ;
2. prouver par le site lui-même un excellent niveau front-end, UI/UX et SEO.

Positionnement : « Growth Engineer », triptyque **Concevoir → Développer → Faire
croître** (couleurs : terracotta / bleu de Fès / menthe profonde).

## Règles absolues

- **Ne jamais inventer** de chiffres, résultats, clients, projets, intitulés de
  poste ou établissements. Une info manquante = placeholder visible `TODO:`
  (dans le contenu) + entrée dans la liste des TODO de fin de phase.
- **Aucun texte en dur** dans les composants : tout passe par
  `messages/fr.json` et `messages/en.json` (mêmes clés dans les deux fichiers).
- **100 % statique** (`output: 'export'`) : pas de route handler dynamique, pas
  de middleware, pas de Server Action, pas d'optimisation `next/image` à la
  volée.
- Le mini-jeu ne doit contenir **aucune information introuvable ailleurs** dans
  le HTML statique.
- Le blog/devlog est préparé mais **non publié** (dossier privé `_blog`, rien
  dans le sitemap, aucun lien).
- Téléphone jamais affiché en clair : email + lien WhatsApp seulement.
- Workflow : un commit clair par phase, puis une pull request vers `main`.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript strict
  (`noUncheckedIndexedAccess`).
- Tailwind CSS v4 (config CSS-first dans `src/app/globals.css`).
- next-intl 4 en mode statique : `[locale]` + `generateStaticParams` +
  `setRequestLocale`, **sans middleware**. Locales `fr` (défaut) et `en`,
  préfixe toujours présent. Slugs non traduits (`/fr/projects/x`).
- Polices via `next/font/google` : Fraunces (titres), Inter (texte),
  JetBrains Mono (étiquettes, dates, scores).
- Hébergement : Cloudflare Workers Static Assets (`wrangler.jsonc`, dossier
  `out/`), en-têtes dans `public/_headers`.

## Arborescence

```
messages/                 fr.json, en.json (toutes les chaînes)
public/_headers           sécurité + cache Cloudflare
src/app/
  (root)/                 « / » : redirige vers /fr ou /en (langue du navigateur)
  [locale]/               layout racine localisé (html lang) + accueil
  [locale]/projects/[slug] études de cas (une page par projet et par langue)
  [locale]/legal          mentions légales et confidentialité
  global-not-found.tsx    404.html unique, bilingue
  fonts.ts, globals.css   polices et jetons de thème
src/content/               données typées (profil, parcours, formation, compétences,
                          projets, jeux) : textes bilingues { fr, en }
src/components/
  layout/                 SkipLink, SiteHeader, MobileMenu, LocaleSwitcher, SiteFooter
  sections/               sections de l'accueil (Hero, About, Skills, …)
  projects/               visuels et badges des études de cas
  ui/                     Section, SectionHeading, TodoText, Badge, ExternalLink…
  theme/                  ThemeToggle + script anti-flash
  zellige/                moteur du motif (voir plus bas)
src/i18n/                 routing.ts, navigation.ts, request.ts
src/lib/                  site, seo, structured-data, og, blog, analytics, web3forms, images
src/assets/images/        images sources (optimisées au build, voir README du dossier)
scripts/optimize-images.mjs  sharp → AVIF/WebP multi-tailles + manifeste (avant dev/build)
src/zellige/              config.ts (tuile du site), tiles/*.svg, README.md
```

## Contenus

- Textes d'interface : `messages/*.json`. Contenus (parcours, projets…) :
  `src/content/*.ts`, typés par `src/content/types.ts`, avec des champs
  `Localized` (`{ fr, en }`).
- Valeur inconnue : chaîne commençant par `TODO:`, affichée par `<TodoText>`
  comme un encadré pointillé visible. Dates inconnues : `null`.
- Projets privés : `privateSource: true` (badge, pas de lien vers le code).
  Projets placeholder : `placeholder: true` (badge + `noindex`).
- Les compétences de `skills.ts` sont la seule source des objets du mini-jeu.

## SEO

- `src/lib/seo.ts` : `pageMetadata()` (titre et description uniques par page et
  par langue, canonical, hreflang fr/en/x-default, Open Graph, Twitter).
- `src/lib/structured-data.ts` + `<JsonLd>` : Person (sameAs), WebSite,
  ProfilePage (accueil), CreativeWork + BreadcrumbList (études de cas),
  BlogPosting (blog, non publié).
- Images OG/Twitter générées au build par `opengraph-image.tsx` /
  `twitter-image.tsx` (`src/lib/og.tsx`, polices `@fontsource` en WOFF). Les
  routes d'image ont besoin de **tous** les params dans `generateStaticParams`.
- `sitemap.ts` et `robots.ts` statiques ; les projets `placeholder` sont
  `noindex` et absents du sitemap.
- Blog : `src/app/[locale]/_blog` (dossier privé, non routé) + `src/lib/blog.ts`
  - `src/content/blog/{fr,en}/*.mdx`. Procédure de publication :
    `src/content/blog/README.md`.

## Formulaire, statistiques, images

- Contact : `ContactForm` (client) → Web3Forms (`NEXT_PUBLIC_WEB3FORMS_KEY`),
  validation maison, honeypot `botcheck`, messages bilingues, `aria-live`.
- Statistiques : **toujours passer par `src/lib/analytics.ts`** (`track()` côté
  client, `trackAttrs()` pour les composants serveur → attributs `data-track`
  lus par `<Analytics>`). Umami et Cloudflare sont chargés après `load` + idle,
  uniquement si leur variable d'environnement existe, et seulement sur
  benyahiailyas.com (`data-domains`). Nouvel événement = l'ajouter à l'union
  `AnalyticsEvent` et à `EVENT_NAMES`.
- Images : sources dans `src/assets/images/`, `<Picture image="…" sizes="…">`
  (AVIF + WebP, largeur/hauteur intrinsèques). `public/images/opt/` et le
  manifeste sont générés (gitignorés).

## Thème et design (direction B « Atelier Zellige »)

- Jetons CSS dans `globals.css` : `--bg --surface --fg --muted --line --accent
--accent-strong --on-accent --blue --teal` et `--z-*` pour la mosaïque.
  Exposés à Tailwind via `@theme inline` (`bg-bg`, `text-muted`, `text-accent`…).
- Mode sombre : préférence système par défaut, surcharge manuelle via
  `html[data-theme]` (stockée dans `localStorage.theme`, appliquée avant le
  premier rendu par `theme-script.ts`). **Ne pas utiliser `dark:`** de
  Tailwind : passer par les jetons.
- Contraste AA vérifié pour tous les jetons de texte.
- Animations : toujours une variante `prefers-reduced-motion`.

## Motif zellige

- Une seule tuile pour tout le site, choisie dans `src/zellige/config.ts`.
  Le motif actuel est un placeholder calculé ; Ilyas fournira ses tuiles SVG
  (Illustrator). **Format et procédure : `src/zellige/README.md`.**
- `<SiteZellige>` (serveur) = `<Zellige>` + tuile du site. Variantes `line`
  (par défaut partout) et `mosaic` (**2 séparateurs pleine couleur maximum**).
- `<ZelligeReveal>` + `animate` : apparition en vague (fondu + léger zoom)
  depuis le centre, une fois, à l'entrée dans l'écran.
- `loadSvgTile()` lit le SVG au build ; les couleurs de référence
  (`#C2410C #1E40AF #0F766E #E6D9C2 #1C1917`) deviennent des rôles recolorés.
- Le mini-jeu devra réutiliser la même tuile (pièces `d` → `Path2D`).

## Commandes

```bash
npm run dev           # serveur de dev (http://localhost:3000/fr)
npm run build         # export statique dans out/
npm run start         # sert out/ localement
npm run lint          # ESLint (0 warning attendu)
npm run typecheck     # tsc --noEmit
npm run format        # Prettier
npm run check         # lint + typecheck + format:check
npm run deploy        # build + wrangler deploy (Cloudflare)
npm run images        # optimise src/assets/images (lancé par predev/prebuild)
npm run audit:prod    # audit des dépendances livrées (doit rester à 0)
```

Node 22 LTS (`.nvmrc`, `engines` ≥ 22.12). Variables d'environnement : voir
`.env.example` (`.env` est ignoré par git).

Dépendances : `npm audit` signale 5 alertes « high » sur `braces` (chaîne
`eslint-config-next` → `fast-glob`), outil de dev uniquement, sans version
corrigée publiée : ne pas lancer `npm audit fix --force` (il rétrograde
`eslint-config-next` en v14). ESLint reste en v9 tant qu'`eslint-config-next`
ne supporte pas ESLint 10 (`eslint-plugin-react` plante).

## Conventions

- Prettier : guillemets simples, point-virgule, 100 colonnes, tri des classes
  Tailwind. ESLint : `eslint-config-next` (core-web-vitals + typescript).
- Composants serveur par défaut ; `'use client'` seulement si interaction.
- Accessibilité : un seul `h1` par page, hiérarchie de titres, focus visible,
  `aria-*` sur les contrôles, lien d'évitement vers `#contenu`.
- Commits en anglais, impératif, un par phase.

## Avancement

- [x] Prototype zellige (validé : direction B)
- [x] Phase 1 : socle (i18n statique, thème, polices, layout, Cloudflare, docs)
- [x] Phase 2 : contenus typés + toutes les sections + études de cas
- [x] Phase 3 : SEO (metadata, hreflang, sitemap, robots, JSON-LD, OG, blog caché)
- [x] Phase 4 : contact Web3Forms, analytics (Umami + Cloudflare), images, maintenance
- [ ] Phase 5 : mini-jeu « Ship It! »
- [ ] Phase 6 : audit a11y/perf, Lighthouse, guide de déploiement, TODO finaux
