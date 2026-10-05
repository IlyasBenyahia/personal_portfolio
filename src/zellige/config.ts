/**
 * Which tile the site uses, per variant:
 *
 * - `line`: fine outlines (hero background, footer band, 404, placeholder
 *   frames, Open Graph images).
 * - `mosaic`: full-colour pieces (the two colour bands, game platforms).
 *
 * Each entry is either:
 * - `{ kind: 'computed' }`: the built-in khatam star & cross, computed in
 *   src/components/zellige/geometry.ts;
 * - `{ kind: 'svg', file: 'my-tile' }`: src/zellige/tiles/my-tile.svg,
 *   drawn in Illustrator (see src/zellige/README.md).
 *
 * Changing a line swaps the pattern everywhere that variant is used, at the next build.
 */
export type TileSource = { kind: 'computed' } | { kind: 'svg'; file: string };
export type TileVariant = 'line' | 'mosaic';

export const SITE_TILES: Record<TileVariant, TileSource> = {
  line: { kind: 'svg', file: 'ma-tuile' },
  mosaic: { kind: 'computed' },
};
