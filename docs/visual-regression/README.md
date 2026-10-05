# Régression visuelle du motif zellige

## L'incident (phase 6)

Pour alléger le HTML (3 Mo → 45 Ko gzip), chaque motif zellige est défini une
seule fois puis répété avec `<use>` / `<pattern>`. Les couleurs et les traits
étaient appliqués par des sélecteurs CSS (`.zellige--mosaic .z-primary`).
**Chrome** applique ces sélecteurs aux clones créés par `<use>`, mais
**Firefox et Safari non** : les pièces y retombaient sur le rendu SVG par
défaut, remplissage noir sans contour. Résultat : une bande mosaïque noire et
un fond de hero réduit à des fragments diagonaux.

**Correction** : chaque pièce porte son style en ligne
(`style="fill: var(--z-a, var(--z-primary))"`), qui voyage avec le clone, et
l'alternance en damier passe par des variables CSS posées sur les `<use>`
(les propriétés personnalisées héritent à travers `<use>` dans tous les
moteurs). Plus aucune règle CSS ne cible l'intérieur des motifs. Le gain de
poids de la phase 6 est conservé.

## Les captures

| Fichier                                     | Contenu                                                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `isolated-broken-vs-fixed.png`              | Rendu isolé (sans CSS de page, comme Firefox/Safari) : phase 6 cassée · corrigé clair · corrigé sombre             |
| `compare-{light,dark}-{desktop,mobile}.png` | Page `/en`, de gauche à droite : **avant la phase 6** · **corrigé (build statique)** · **corrigé (`npm run dev`)** |
| `custom-tile-*.png`                         | Tuile SVG « Illustrator » d'exemple (`exemple-illustrator.svg`) : page, rendu isolé, plateformes du jeu            |

Les écarts restants avec la version d'avant la phase 6 (environ 1 % des
pixels) sont voulus : bandes recadrées sur 28 colonnes au lieu de 40 (le damier
commence sur une autre couleur au bord) et épaisseur des traits exprimée en
unités de tuile.

## Le garde-fou automatique

`tests/visual/zellige.spec.ts` (Playwright, Chromium) :

1. **Captures de référence** de l'accueil (hero + bande mosaïque) et du pied
   de page, en clair et en sombre, desktop et mobile, comparées aux images de
   `tests/visual/__screenshots__/` (tolérance 1 % de pixels).
2. **Rendu sans CSS de page** : chaque SVG zellige est re-rendu comme image
   autonome (seules les variables du thème sont fournies). C'est la situation
   des clones `<use>` dans Firefox et Safari ; ce test échoue sur le code
   cassé de la phase 6 (traits « remplis » à 92-99 %) alors que Chrome
   l'affichait correctement.
3. Le jeu dessine bien ses plateformes zellige en couleur ; le favicon est
   bien l'étoile calculée.

```bash
npm run build
npm run test:visual            # compare aux références
npm run test:visual:update     # après un changement VOULU du rendu
```

Les références sont produites avec Chromium sous Linux : sur une autre
machine, de légers écarts d'anticipation (polices, anticrénelage) peuvent
demander de régénérer les références localement.
