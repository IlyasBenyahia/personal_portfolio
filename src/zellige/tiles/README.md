# Tuiles zellige personnalisées (Illustrator)

Déposez ici un SVG, puis utilisez-le :

```tsx
import { loadSvgTile } from '@/components/zellige/load-svg-tile';
import { Zellige } from '@/components/zellige/Zellige';

const tile = await loadSvgTile('ma-tuile'); // lit src/zellige/tiles/ma-tuile.svg au build
<Zellige tile={tile} cols={8} rows={2} />          // recoloré avec la palette (clair/sombre)
<Zellige tile={tile} cols={8} rows={2} keepColors /> // couleurs d'origine du fichier
```

## Règles de dessin

1. **Plan de travail = une répétition.** Sa taille devient la période du motif
   (ex. 100 × 100 px). Les formes peuvent déborder du plan de travail : les
   répétitions voisines les complètent (voir le losange en coin de
   `exemple-illustrator.svg`). Ne dessinez chaque forme qu'une seule fois.
2. **Rôles de couleur.** Nommez le calque, le groupe ou l'objet `primary`
   (terracotta), `secondary` (bleu), `tertiary` (menthe), `neutral` (sable) ou
   `ink` (encre). Illustrator exporte le nom en `id` (`primary-2` est accepté).
   Sans nom, chaque couleur de remplissage distincte reçoit un rôle, dans
   l'ordre d'apparition.
3. **Formes acceptées :** tracé, polygone, polyligne, rectangle, cercle,
   ellipse, ligne. Pas d'images incorporées, de textes ni de dégradés.
4. **Export :** Fichier › Exporter › Exporter sous… › SVG, avec Style =
   « Propriétés de présentation » ou « CSS interne », Décimales = 2.

Le joint (« grout ») est ajouté automatiquement dans la couleur du fond de page.
