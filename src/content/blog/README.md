# Blog / devlog (préparé, non publié)

Les articles vivent ici, un dossier par langue : `fr/<slug>.mdx` et
`en/<slug>.mdx` (même slug dans les deux langues).

```mdx
---
title: Titre de l’article
description: Résumé (meta description, 150 caractères environ)
date: 2026-11-01
updated: 2026-11-15 # optionnel
tags: [devlog, unity]
draft: false
---

Contenu en MDX…
```

Les articles `draft: true` ne sont jamais générés.

## Publier le blog (plus tard)

Aujourd'hui, la route est dans un dossier privé (`src/app/[locale]/_blog/`) :
Next.js l'ignore, rien n'est généré, rien n'est dans le sitemap, aucun lien
n'y mène. Pour publier :

1. Renommer `src/app/[locale]/_blog` en `src/app/[locale]/blog`.
2. Ajouter les articles au sitemap (`src/app/sitemap.ts`, via `getPosts()`).
3. Ajouter « Blog » à la navigation (`src/components/layout/nav-items.ts` et
   les messages).
