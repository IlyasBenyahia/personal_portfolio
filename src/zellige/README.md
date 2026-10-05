# Tuiles zellige : remplacer le motif par vos propres dessins

Le site entier (fond du hero, séparateurs, pied de page et, plus tard, les
plateformes du mini-jeu) utilise **une seule tuile**, choisie dans
`src/zellige/config.ts`. Le motif actuel (étoile et croix « khatam »,
calculé dans `src/components/zellige/geometry.ts`) est un **placeholder**.

## Changer de tuile en 3 étapes

1. Dessinez la tuile dans Illustrator en suivant le format ci-dessous.
2. Exportez-la dans ce dossier : `src/zellige/tiles/ma-tuile.svg`.
3. Dans `src/zellige/config.ts`, remplacez la ligne :

   ```ts
   export const SITE_TILE: TileSource = { kind: 'computed' };
   ```

   par :

   ```ts
   export const SITE_TILE: TileSource = { kind: 'svg', file: 'ma-tuile' };
   ```

   puis lancez `npm run dev` ou `npm run build`. Une erreur claire s'affiche
   si le fichier est introuvable ou illisible.

Pour revenir au motif calculé : `{ kind: 'computed' }`.

## Format attendu

### 1. Une tuile carrée, raccordable sur ses 4 bords

- **Plan de travail carré = une répétition.** Par exemple 100 × 100 px. La
  taille du plan de travail devient la période du motif (le `viewBox` du SVG).
- **Raccords :** ce qui sort par le bord droit doit rentrer par le bord gauche,
  et ce qui sort en bas doit rentrer en haut. Le plus simple : utilisez la
  grille Illustrator (Affichage › Grille, magnétisme activé) et placez les
  formes qui chevauchent un bord **une seule fois**, en les laissant déborder
  du plan de travail. La tuile voisine affichera l'autre moitié.
  Exemple : un losange centré sur le coin (0, 0) est dessiné une seule fois,
  à cheval sur le coin ; les 4 répétitions qui se touchent à ce coin
  complètent le losange.
- **Ne dessinez pas deux fois** une forme qui est déjà complétée par un voisin
  (sinon elle apparaît doublée).
- **Pas de contour.** Le joint entre les pièces (« grout ») est ajouté
  automatiquement dans la couleur du fond de page. Laissez les pièces se
  toucher bord à bord.
- **Pas de fond plein** couvrant tout le plan de travail : le fond de page doit
  apparaître dans les joints.

### 2. Les couleurs de référence (recoloration automatique)

Pour que la tuile suive la palette du site **et** le mode sombre, remplissez
chaque pièce avec l'une de ces 5 couleurs exactes (créez-les en nuancier
global) :

| Rôle        | Couleur de référence | Sens dans le site               |
| ----------- | -------------------- | ------------------------------- |
| `primary`   | `#C2410C`            | Terracotta · Concevoir          |
| `secondary` | `#1E40AF`            | Bleu de Fès · Développer        |
| `tertiary`  | `#0F766E`            | Menthe profonde · Faire croître |
| `neutral`   | `#E6D9C2`            | Sable (fond des pièces)         |
| `ink`       | `#1C1917`            | Encre (petits accents)          |

Chaque couleur est remplacée au build par le jeton correspondant du thème
(`--z-primary`, etc. dans `src/app/globals.css`), en clair comme en sombre.
Les pièces `primary` et `secondary` sont en plus inversées une tuile sur deux
(effet damier).

Autres façons d'attribuer un rôle, si vous préférez d'autres couleurs :

- nommer le calque, le groupe ou l'objet `primary`, `secondary`, `tertiary`,
  `neutral` ou `ink` (Illustrator l'exporte en `id`, `primary-2` est accepté) ;
- sinon, chaque autre couleur reçoit un rôle dans l'ordre d'apparition
  (moins prévisible : préférez les couleurs de référence).

Pour garder vos couleurs d'origine sans recoloration (et sans mode sombre),
passez `keepColors` au composant `<Zellige>`.

### 3. Formes et export

- Formes acceptées : tracé, polygone, polyligne, rectangle, cercle, ellipse,
  ligne. Les transformations (`transform`) sont conservées.
- Non pris en charge : images incorporées, textes, dégradés, masques, effets.
  Vectorisez le texte et développez les effets (Objet › Développer).
- Export : Fichier › Exporter › Exporter sous… › SVG, avec
  **Style = Propriétés de présentation** (ou CSS interne),
  **Police = Convertir en contours**, **Décimales = 2**, « Réactif » coché.

Un fichier d'exemple au format d'export Illustrator est fourni :
`src/zellige/tiles/exemple-illustrator.svg` (octogones, carrés et étoile).

## Où le motif est utilisé (et règle de sobriété)

- **Variante `line`** (traits fins en `currentColor`) : utilisée partout par
  défaut (fond du hero, pied de page, 404).
- **Variante `mosaic`** (pleine couleur) : **deux séparateurs maximum** sur
  tout le site. Le premier est sous le hero, avec l'apparition en vague.
- **Animation** : `<ZelligeReveal>` + `animate` font apparaître les tuiles en
  vague depuis le centre (fondu et léger zoom), une seule fois, à l'entrée
  dans l'écran. Statique avec `prefers-reduced-motion` ou sans JavaScript.
- **Mini-jeu** (phase 5) : les plateformes utiliseront la même tuile.

## Vérifier après un changement de tuile

```bash
npm run build
npm run test:visual          # échoue si le rendu change : normal après une nouvelle tuile
npm run test:visual:update   # enregistre les nouvelles références une fois le rendu validé
```

Le test « rendu sans CSS de page » doit, lui, toujours passer : il garantit que
la tuile s'affiche aussi dans Firefox et Safari.
