# Rapport Lighthouse final

Mesuré le 5 octobre 2026 avec **Lighthouse 13.5** (Chromium headless) sur le
build statique servi par `wrangler dev`, soit exactement les fichiers et les
en-têtes (`public/_headers`) qui seront servis par Cloudflare. Profils par
défaut : **mobile** = Moto G Power simulé, 4G lente, CPU ×4 ; **desktop** =
préréglage desktop.

Rapports complets de la page d'accueil :
[`fr-mobile.html`](fr-mobile.html) et [`fr-desktop.html`](fr-desktop.html)
(à ouvrir dans un navigateur).

| Page                      | Profil  | Performance | Accessibilité | Bonnes pratiques | SEO     | LCP    | CLS | TBT    |
| ------------------------- | ------- | ----------- | ------------- | ---------------- | ------- | ------ | --- | ------ |
| `/fr`                     | mobile  | 90          | 100           | 100              | 100     | 3,4 s  | 0   | 180 ms |
| `/fr`                     | desktop | **100**     | 100           | 100              | 100     | 0,7 s  | 0   | 0 ms   |
| `/en`                     | mobile  | 91          | 100           | 100              | 100     | 3,3 s  | 0   | 130 ms |
| `/en`                     | desktop | **100**     | 100           | 100              | 100     | 0,7 s  | 0   | 0 ms   |
| `/fr/projects/project-1`  | mobile  | 95          | 100           | 100              | 66 \*   | 2,8 s  | 0   | 100 ms |
| `/fr/projects/project-1`  | desktop | **100**     | 100           | 100              | 66 \*   | 0,7 s  | 0   | 0 ms   |
| `/fr/legal`               | mobile  | 93          | 100           | 100              | 100     | 3,1 s  | 0   | 100 ms |
| `/fr/legal`               | desktop | **100**     | 100           | 100              | 100     | 0,6 s  | 0   | 0 ms   |

\* Volontaire : les études de cas placeholder sont en `noindex` tant qu'elles
ne sont pas remplies (« la page est bloquée pour l'indexation »). Elles
passent à 100 dès que `placeholder: true` est retiré dans
`src/content/projects.ts`.

## Ce qui sépare le mobile de 100

Le LCP **observé** est de 0,3 s, mais le LCP **simulé** en 4G lente intègre
le JavaScript téléchargé avant lui : environ 143 Ko gzip, dont 116 Ko pour
React DOM et le routeur Next.js (socle incompressible de l'App Router). Les
scores mobiles varient de ± 3 points d'un passage à l'autre.

Optimisations déjà appliquées pendant l'audit :

- HTML de l'accueil : 3 Mo → 45 Ko gzip (motif zellige en `<pattern>` /
  `<use>` au lieu de 5 800 tracés recopiés deux fois) ; TBT mobile 2,4 s → 0,2 s.
- `content-visibility: auto` sur les sections sous la ligne de flottaison.
- Polices préchargées : 207 Ko → 115 Ko (axe `SOFT` de Fraunces retiré,
  JetBrains Mono non préchargée). Retirer aussi le préchargement de
  Fraunces a été testé et rejeté : CLS 0,11.
- Formateur ICU (`use-intl`) sorti du bundle initial : les textes des
  composants client sont traduits côté serveur, le mini-jeu embarque les
  siens dans son chunk chargé au clic (≈ 15 Ko gzip de JS en moins).
- CSS inline (aucune requête bloquante), scripts de statistiques chargés
  après `load` + inactivité.

Pistes restantes, à arbitrer : retirer complètement le JavaScript client
(perte du thème manuel, du formulaire, du jeu) ou passer à un framework
« islands » ; non recommandé pour le gain (quelques points sur un score
simulé, alors que les Core Web Vitals réels sont au vert).

## Accessibilité (axe-core 4, WCAG 2.2 A/AA + bonnes pratiques)

**0 violation** sur `/fr`, `/en`, une étude de cas, `/en/legal` et la 404,
en clair et en sombre, ainsi que sur le menu mobile ouvert, le formulaire en
erreur et le mini-jeu (accueil et partie en cours). Vérifications
manuelles : ordre de tabulation, lien d'évitement, focus visible, aucun
défilement horizontal à 360, 768 et 1920 px.

## Refaire la mesure

```bash
npm run build
npx wrangler dev          # http://localhost:8787
npx lighthouse http://localhost:8787/fr --view                    # mobile
npx lighthouse http://localhost:8787/fr --preset=desktop --view   # desktop
```

Une fois en ligne, PageSpeed Insights (https://pagespeed.web.dev) donne en
plus les **Core Web Vitals réels** (données CrUX) dès que le trafic suffit.
