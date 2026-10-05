# TODO : ce qu'il reste à fournir

Tout ce qui est listé ici est **visible sur le site** sous forme d'encadré
pointillé « TODO: », ou désactivé tant que l'information manque. Rien n'a été
inventé. Une fois un point rempli, supprimez-le de cette liste.

## Contenus (fichiers dans `src/content/`)

| Information                                                                                                    | Fichier         | Remarque                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Intitulé exact du poste chez **DEVELOP UPSCALE** (juillet 2025 – présent)                                      | `experience.ts` | `role` FR + EN                                                                                                                |
| Missions chez **DEVELOP UPSCALE**                                                                              | `experience.ts` | `missions`                                                                                                                    |
| Intitulé exact du poste chez **AdLikeT** (avril 2024 – mars 2025)                                              | `experience.ts` |                                                                                                                               |
| Autres missions chez **AdLikeT** (le lancement de campagnes publicitaires est déjà indiqué)                    | `experience.ts` |                                                                                                                               |
| Types de missions **Freelance** (développement web, design, SEO)                                               | `experience.ts` | sans citer de client sans son accord                                                                                          |
| Missions chez **Next Level** (infographiste, 2023)                                                             | `experience.ts` |                                                                                                                               |
| Missions chez **2C Solution** (web designer, stage rémunéré, 2021 – 2022)                                      | `experience.ts` |                                                                                                                               |
| Pilier(s) de DEVELOP UPSCALE (Concevoir / Développer / Faire croître)                                          | `experience.ts` | `pillars: []` pour l'instant                                                                                                  |
| Année d'obtention du **diplôme de Technicien Spécialisé en Infographie (ISTA)**                                | `education.ts`  | `date: null`                                                                                                                  |
| **3 études de cas** : titre, résumé, année, contexte, rôle, technologies, résultat vérifiable, captures, liens | `projects.ts`   | retirer `placeholder: true` pour les rendre indexables et les ajouter au sitemap ; `privateSource: true` si le code est privé |
| URL directe de **Colors Recipe** sur itch.io                                                                   | `games.ts`      | le lien pointe vers le profil itch.io en attendant                                                                            |

## Fichiers à déposer

| Fichier                                       | Emplacement                                                                     | Utilisé par                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Photo portrait (JPEG/PNG haute définition)    | `src/assets/images/` puis `photo: '<nom>.jpg'` dans `profile.ts`                | section À propos (AVIF/WebP générés au build)             |
| CV en français                                | `public/cv/cv-ilyas-benyahia-fr.pdf`                                            | bouton « CV en français (PDF) »                           |
| CV en anglais                                 | `public/cv/cv-ilyas-benyahia-en.pdf`                                            | bouton « CV en anglais (PDF) »                            |
| Captures des projets                          | `src/assets/images/projects/<projet>/…` puis `visuals[].src` dans `projects.ts` | études de cas et cartes projets                           |
| Tuile(s) zellige dessinée(s) dans Illustrator | `src/zellige/tiles/<nom>.svg` puis `src/zellige/config.ts`                      | tout le site + le mini-jeu (voir `src/zellige/README.md`) |

> Les boutons CV renvoient une 404 tant que les PDF ne sont pas déposés.

## Comptes et clés (voir `docs/DEPLOIEMENT.md`)

- [ ] Clé **Web3Forms** → `NEXT_PUBLIC_WEB3FORMS_KEY` (sans elle, le
      formulaire invite à écrire par email).
- [ ] Site **Umami Cloud** → `NEXT_PUBLIC_UMAMI_WEBSITE_ID`.
- [ ] **Cloudflare Web Analytics** (activation automatique, ou jeton →
      `NEXT_PUBLIC_CF_ANALYTICS_TOKEN`).
- [ ] Projet **Cloudflare Workers** relié au dépôt GitHub, variables de build
      renseignées.
- [ ] Serveurs DNS du domaine passés chez Cloudflare **en conservant les MX**,
      domaine personnalisé branché, email testé.
- [ ] **Google Search Console** : propriété Domaine vérifiée, sitemap envoyé.

## Plus tard (optionnel)

- [ ] Blog / devlog : écrire les premiers articles (`src/content/blog/`) puis
      suivre la procédure de publication de `src/content/blog/README.md`.
- [ ] Passer à ESLint 10 quand `eslint-config-next` le supportera.
- [ ] Effets sonores du mini-jeu (désactivés par défaut), si souhaité.
