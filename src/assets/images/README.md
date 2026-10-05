# Images sources

Déposez ici les images d'origine (JPEG, PNG, WebP, haute résolution).
`npm run dev` et `npm run build` génèrent automatiquement des versions AVIF et
WebP en plusieurs largeurs (480 à 2000 px) dans `public/images/opt/`.

Référencez une image par son chemin relatif à ce dossier, par exemple :

- photo : `profile.photo = 'ilyas-benyahia.jpg'` (`src/content/profile.ts`) ;
- capture de projet : `visuals: [{ src: 'projects/mon-projet/accueil.png', … }]`
  (`src/content/projects.ts`).

Les dimensions sont lues dans le fichier : aucun décalage de mise en page.
