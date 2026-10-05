/**
 * Which tile the whole site uses (hero background, separators, footer, game).
 *
 * - `{ kind: 'computed' }`: the built-in khatam star & cross, computed in
 *   src/components/zellige/geometry.ts (placeholder until custom tiles exist).
 * - `{ kind: 'svg', file: 'my-tile' }`: src/zellige/tiles/my-tile.svg,
 *   drawn in Illustrator (see src/zellige/README.md).
 *
 * Changing this one line swaps the pattern everywhere at the next build.
 */
export type TileSource = { kind: 'computed' } | { kind: 'svg'; file: string };

export const SITE_TILE: TileSource = { kind: 'computed' };
