/**
 * Zellige geometry — every shape is computed, nothing is hand-drawn.
 *
 * Construction (classic "star and cross" / khatam pattern):
 * - Square lattice of period P. An 8-pointed star {8/2} — two squares of
 *   circumradius R = P/2 rotated 45° from each other — sits at every cell centre.
 * - With R = P/2, the axial tips of neighbouring stars touch exactly at the cell
 *   edges, and the space left between four stars is a pointed cross centred on
 *   every lattice corner. Stars + crosses cover the plane with no gap and no
 *   overlap, so the repetition is seamless by construction.
 * - Each star is cut into mosaic pieces (8 tips, an octagonal ring, an inner
 *   rosette); each cross into a central square and 4 arrow arms.
 */

export type Point = readonly [number, number];

/** Semantic colour slots, mapped to palette tokens in zellige.css. */
export type ZelligeRole = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'ink';

export interface ZelligePiece {
  d: string;
  role: ZelligeRole;
  fillRule?: 'evenodd' | 'nonzero';
  /** Original fill, kept for imported SVG tiles (`keepColors`). */
  fill?: string;
  transform?: string;
}

/** A group of pieces repeated once per lattice cell, at `offset`. */
export interface ZelligeMotif {
  id: string;
  offset: Point;
  pieces: ZelligePiece[];
  /** Pieces drawn in `line` variant (outlines only). Defaults to `pieces`. */
  outline?: ZelligePiece[];
}

export interface ZelligeTile {
  width: number;
  height: number;
  motifs: ZelligeMotif[];
}

const round = (n: number) => Math.round(n * 1000) / 1000;

export function polygonPath(points: readonly Point[]): string {
  return `M${points.map(([x, y]) => `${round(x)} ${round(y)}`).join('L')}Z`;
}

const polar = (r: number, deg: number): Point => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
};

/** Radius of the inner vertices of an {8/2} star of outer radius R. */
export const innerRadius = (R: number) => (R * Math.cos(Math.PI / 4)) / Math.cos(Math.PI / 8);

/** Outline of an {8/2} star centred on 0, tips on the axes. 16 vertices. */
export function starPoints(R: number): Point[] {
  const r = innerRadius(R);
  return Array.from({ length: 16 }, (_, i) => polar(i % 2 === 0 ? R : r, i * 22.5));
}

export function octagonPoints(r: number, startDeg = 22.5): Point[] {
  return Array.from({ length: 8 }, (_, i) => polar(r, startDeg + i * 45));
}

/** Pieces of one star of outer radius R centred on 0. */
function starPieces(R: number): ZelligePiece[] {
  const r = innerRadius(R);
  const pieces: ZelligePiece[] = [];
  // 8 triangular tips: axial tips and diagonal tips read as the two squares.
  for (let k = 0; k < 8; k++) {
    const tip = polar(R, k * 45);
    pieces.push({
      d: polygonPath([polar(r, k * 45 - 22.5), tip, polar(r, k * 45 + 22.5)]),
      role: 'tertiary',
    });
  }
  // Octagonal ring around a smaller rosette (same {8/2} construction, scaled).
  const rosetteR = r * 0.78;
  pieces.push({
    d: polygonPath(octagonPoints(r)) + polygonPath(starPoints(rosetteR)),
    role: 'neutral',
    fillRule: 'evenodd',
  });
  pieces.push({ d: polygonPath(starPoints(rosetteR)), role: 'secondary' });
  return pieces;
}

/**
 * Pieces of the cross centred on 0 between four stars of radius R placed at
 * (±R, ±R). h is where the stars' diagonal tips land: R - R·cos45°.
 */
function crossPieces(R: number): ZelligePiece[] {
  const h = R - R * Math.SQRT1_2;
  const pieces: ZelligePiece[] = [];
  const rot = ([x, y]: Point, k: number): Point => {
    // rotate by k·90°
    const c = [1, 0, -1, 0][k]!;
    const s = [0, 1, 0, -1][k]!;
    return [x * c - y * s, x * s + y * c];
  };
  for (let k = 0; k < 4; k++) {
    const arm: Point[] = [
      [0, -R],
      [h, -R + h],
      [h, -h],
      [-h, -h],
      [-h, -R + h],
    ];
    pieces.push({ d: polygonPath(arm.map((p) => rot(p, k))), role: 'primary' });
  }
  pieces.push({
    d: polygonPath([
      [-h, -h],
      [h, -h],
      [h, h],
      [-h, h],
    ]),
    role: 'neutral',
  });
  return pieces;
}

function crossOutline(R: number): Point[] {
  const h = R - R * Math.SQRT1_2;
  const pts: Point[] = [];
  const arm: Point[] = [
    [0, -R],
    [h, -R + h],
    [h, -h],
  ];
  for (let k = 0; k < 4; k++) {
    const c = [1, 0, -1, 0][k]!;
    const s = [0, 1, 0, -1][k]!;
    for (const [x, y] of arm) pts.push([x * c - y * s, x * s + y * c]);
  }
  return pts;
}

/** The computed khatam tile: one star per cell centre, one cross per corner. */
export function khatamTile(period = 100): ZelligeTile {
  const R = period / 2;
  const r = innerRadius(R);
  return {
    width: period,
    height: period,
    motifs: [
      {
        id: 'star',
        offset: [R, R],
        pieces: starPieces(R),
        outline: [
          { d: polygonPath(starPoints(R)), role: 'ink' },
          { d: polygonPath(starPoints(r * 0.78)), role: 'ink' },
        ],
      },
      {
        id: 'cross',
        offset: [0, 0],
        pieces: crossPieces(R),
        outline: [{ d: polygonPath(crossOutline(R)), role: 'ink' }],
      },
    ],
  };
}

export interface PlacedMotif {
  key: string;
  motif: ZelligeMotif;
  x: number;
  y: number;
  /** 0–1, build order for the tile-by-tile animation. */
  order: number;
  col: number;
  row: number;
}

/**
 * Lays the tile out over a cols × rows area. One extra ring of cells is
 * placed around it so motifs straddling the edges are complete; the SVG
 * viewBox clips the overflow.
 */
export function layoutTile(tile: ZelligeTile, cols: number, rows: number): PlacedMotif[] {
  const placed: Omit<PlacedMotif, 'order'>[] = [];
  for (let row = -1; row <= rows; row++) {
    for (let col = -1; col <= cols; col++) {
      for (const motif of tile.motifs) {
        const x = col * tile.width + motif.offset[0];
        const y = row * tile.height + motif.offset[1];
        placed.push({ key: `${motif.id}-${col}-${row}`, motif, x, y, col, row });
      }
    }
  }
  // Build order: radial, from the centre of the area outwards.
  const cx = (cols * tile.width) / 2;
  const cy = (rows * tile.height) / 2;
  const dist = (p: { x: number; y: number }) => Math.hypot(p.x - cx, p.y - cy);
  const max = Math.max(...placed.map(dist)) || 1;
  return placed.map((p) => ({ ...p, order: round(dist(p) / max) }));
}
