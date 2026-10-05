import {
  polygonPath,
  starPoints,
  type ZelligeRole,
  type ZelligeTile,
} from '@/components/zellige/geometry';
import type { Pillar } from '@/content/types';
import { BLOCK, type GameColors } from './types';

/** Reads the theme tokens so the game matches the page (light or dark). */
export function readColors(): GameColors {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    bg: v('--bg'),
    surface: v('--surface'),
    fg: v('--fg'),
    muted: v('--muted'),
    line: v('--line'),
    zPrimary: v('--z-primary'),
    zSecondary: v('--z-secondary'),
    zTertiary: v('--z-tertiary'),
    zNeutral: v('--z-neutral'),
    zInk: v('--z-ink'),
    pillar: { design: v('--accent-strong'), develop: v('--blue'), grow: v('--teal') },
  };
}

function roleColors(zone: Pillar, c: GameColors): Record<ZelligeRole, string> {
  // The zone's own colour leads; the two others stay as accents.
  const lead = { design: c.zPrimary, develop: c.zSecondary, grow: c.zTertiary }[zone];
  const others = [c.zPrimary, c.zSecondary, c.zTertiary].filter((x) => x !== lead);
  return {
    primary: lead,
    secondary: others[0]!,
    tertiary: others[1]!,
    neutral: c.zNeutral,
    ink: c.zInk,
  };
}

/** SVG transform list → DOMMatrix (DOMMatrix only parses CSS syntax). */
export function parseSvgTransform(value: string): DOMMatrix {
  let m = new DOMMatrix();
  for (const [, fn, raw] of value.matchAll(/(\w+)\s*\(([^)]*)\)/g)) {
    const a = raw!
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    const [p0 = 0, p1, p2] = a;
    switch (fn) {
      case 'translate':
        m = m.translate(p0, p1 ?? 0);
        break;
      case 'scale':
        m = m.scale(p0, p1 ?? p0);
        break;
      case 'rotate':
        m =
          p1 !== undefined && p2 !== undefined
            ? m.translate(p1, p2).rotate(p0).translate(-p1, -p2)
            : m.rotate(p0);
        break;
      case 'skewX':
        m = m.skewX(p0);
        break;
      case 'skewY':
        m = m.skewY(p0);
        break;
      case 'matrix':
        m = m.multiply(new DOMMatrix(a));
        break;
    }
  }
  return m;
}

/**
 * Draws one square block of the site tile (the same tile as the page,
 * src/zellige/config.ts) into an offscreen canvas. Motifs straddling the
 * cell edges are drawn from the neighbouring repeats, then clipped.
 */
function renderBlock(
  tile: ZelligeTile,
  size: number,
  dpr: number,
  paint: (ctx: CanvasRenderingContext2D, role: ZelligeRole, path: Path2D) => void,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = Math.ceil(size * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  ctx.beginPath();
  ctx.rect(0, 0, size, size);
  ctx.clip();
  ctx.scale(size / tile.width, size / tile.height);
  for (const motif of tile.motifs) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        ctx.save();
        ctx.translate(motif.offset[0] + dx * tile.width, motif.offset[1] + dy * tile.height);
        for (const piece of motif.pieces) {
          const path = new Path2D(piece.d);
          if (piece.transform) {
            // Imported tiles may carry SVG transforms: apply them through a matrix.
            const transformed = new Path2D();
            transformed.addPath(path, parseSvgTransform(piece.transform));
            paint(ctx, piece.role, transformed);
          } else {
            paint(ctx, piece.role, path);
          }
        }
        ctx.restore();
      }
    }
  }
  return canvas;
}

export interface BlockSprites {
  built: Record<Pillar, HTMLCanvasElement>;
  ghost: HTMLCanvasElement;
}

/** Platform blocks: coloured mosaic once built, thin outline before. */
export function createBlockSprites(
  tile: ZelligeTile,
  colors: GameColors,
  dpr: number,
): BlockSprites {
  // 1.4 screen pixels, expressed in tile units.
  const grout = (tile.width / BLOCK) * 1.4;
  const built = {} as Record<Pillar, HTMLCanvasElement>;
  for (const zone of ['design', 'develop', 'grow'] as const) {
    const map = roleColors(zone, colors);
    built[zone] = renderBlock(tile, BLOCK, dpr, (ctx, role, path) => {
      ctx.fillStyle = map[role];
      ctx.fill(path);
      ctx.lineWidth = grout;
      ctx.strokeStyle = colors.bg;
      ctx.stroke(path);
    });
  }
  const ghost = renderBlock(tile, BLOCK, dpr, (ctx, _role, path) => {
    ctx.lineWidth = grout * 0.7;
    ctx.strokeStyle = colors.line;
    ctx.stroke(path);
  });
  return { built, ghost };
}

/** Collectible gem: a small {8/2} star, the motif of the site. */
export const gemPath = (r: number) => new Path2D(polygonPath(starPoints(r)));
