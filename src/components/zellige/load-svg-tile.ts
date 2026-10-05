import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  polygonPath,
  type Point,
  type ZelligePiece,
  type ZelligeRole,
  type ZelligeTile,
} from './geometry';

/**
 * Turns a seamless tile drawn in Illustrator (or any editor) into a ZelligeTile,
 * at build time. Files live in `src/zellige/tiles/`.
 *
 * Authoring rules (see src/zellige/README.md):
 * - The artboard = one repeat. Its size gives the viewBox, i.e. the period.
 * - Shapes may overflow the artboard: the neighbouring repeats complete them.
 * - Colour roles: name a layer/group/object `primary`, `secondary`, `tertiary`,
 *   `neutral` or `ink` (Illustrator exports the name as `id`, e.g. `primary-2`),
 *   or set `data-role`, or fill with one of the REFERENCE_FILLS below. Other
 *   shapes get a role per distinct fill colour, in order of appearance.
 * - Supported elements: path, polygon, polyline, rect, circle, ellipse, line.
 */

const ROLES: ZelligeRole[] = ['primary', 'secondary', 'tertiary', 'neutral', 'ink'];

/**
 * Reference swatches: draw with these exact colours and each shape is
 * recoloured with the matching site token (light / dark). Keep in sync with
 * src/zellige/README.md.
 */
export const REFERENCE_FILLS: Record<string, ZelligeRole> = {
  '#c2410c': 'primary',
  '#1e40af': 'secondary',
  '#0f766e': 'tertiary',
  '#e6d9c2': 'neutral',
  '#1c1917': 'ink',
};
const SHAPES = new Set(['path', 'polygon', 'polyline', 'rect', 'circle', 'ellipse', 'line']);

function attrs(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of source.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
    out[m[1]!] = m[3] ?? m[4] ?? '';
  }
  return out;
}

function roleFromName(name: string | undefined): ZelligeRole | undefined {
  if (!name) return undefined;
  const base = name.toLowerCase().replace(/[-_ ]?\d+$/, '');
  return ROLES.find((r) => base === r);
}

function num(v: string | undefined, fallback = 0): number {
  const n = Number.parseFloat(v ?? '');
  return Number.isFinite(n) ? n : fallback;
}

function shapeToPath(tag: string, a: Record<string, string>): string | undefined {
  switch (tag) {
    case 'path':
      return a.d;
    case 'polygon':
    case 'polyline': {
      const n = (a.points ?? '')
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      const pts: Point[] = [];
      for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i]!, n[i + 1]!]);
      const d = polygonPath(pts);
      return tag === 'polyline' ? d.slice(0, -1) : d;
    }
    case 'rect': {
      const [x, y, w, h] = [num(a.x), num(a.y), num(a.width), num(a.height)];
      return `M${x} ${y}h${w}v${h}h${-w}Z`;
    }
    case 'circle':
    case 'ellipse': {
      const cx = num(a.cx);
      const cy = num(a.cy);
      const rx = tag === 'circle' ? num(a.r) : num(a.rx);
      const ry = tag === 'circle' ? num(a.r) : num(a.ry);
      return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
    }
    case 'line':
      return `M${num(a.x1)} ${num(a.y1)}L${num(a.x2)} ${num(a.y2)}`;
    default:
      return undefined;
  }
}

/** `.cls-1{fill:#c2410c;}` → { 'cls-1': '#c2410c' } */
function classFills(svg: string): Record<string, string> {
  const fills: Record<string, string> = {};
  for (const block of svg.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    for (const rule of block[1]!.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      const fill = /fill\s*:\s*([^;]+)/.exec(rule[2]!)?.[1]?.trim();
      if (!fill) continue;
      for (const sel of rule[1]!.split(',')) {
        const cls = sel.trim().replace(/^\./, '');
        if (cls) fills[cls] = fill;
      }
    }
  }
  return fills;
}

export function parseSvgTile(svg: string): ZelligeTile {
  const root = /<svg\b([^>]*)>/.exec(svg);
  if (!root) throw new Error('Zellige: no <svg> root found');
  const rootAttrs = attrs(root[1]!);
  const vb = (rootAttrs.viewBox ?? '').split(/[\s,]+/).map(Number);
  const width = vb[2] ?? num(rootAttrs.width);
  const height = vb[3] ?? num(rootAttrs.height);
  if (!width || !height)
    throw new Error('Zellige: the SVG needs a viewBox (artboard = one repeat)');
  const [minX, minY] = [vb[0] ?? 0, vb[1] ?? 0];

  const fills = classFills(svg);
  const colourRoles = new Map<string, ZelligeRole>();
  const pieces: ZelligePiece[] = [];
  const stack: { role?: ZelligeRole; transform?: string; skip: boolean }[] = [];
  const body = svg
    .slice(root.index + root[0].length)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(defs|style|title|metadata)\b[\s\S]*?<\/\1>/g, '');

  for (const m of body.matchAll(/<(\/?)([\w:-]+)([^>]*?)(\/?)>/g)) {
    const [, closing, tag, rawAttrs, selfClosing] = m;
    if (closing) {
      if (tag === 'g') stack.pop();
      continue;
    }
    const a = attrs(rawAttrs!);
    const parent = stack.at(-1);
    const role = roleFromName(a['data-role']) ?? roleFromName(a.id) ?? roleFromName(a['data-name']);
    const transform = [parent?.transform, a.transform].filter(Boolean).join(' ') || undefined;

    if (tag === 'g') {
      if (!selfClosing)
        stack.push({ role: role ?? parent?.role, transform, skip: a.display === 'none' });
      continue;
    }
    if (!SHAPES.has(tag!) || parent?.skip || a.display === 'none') continue;
    const d = shapeToPath(tag!, a);
    if (!d) continue;

    const fill =
      a.fill ??
      /fill\s*:\s*([^;]+)/.exec(a.style ?? '')?.[1]?.trim() ??
      (a.class ? fills[a.class.split(/\s+/)[0]!] : undefined);
    const key = (fill ?? 'none').toLowerCase();
    let pieceRole = role ?? parent?.role ?? REFERENCE_FILLS[key];
    if (!pieceRole) {
      if (!colourRoles.has(key)) colourRoles.set(key, ROLES[colourRoles.size % ROLES.length]!);
      pieceRole = colourRoles.get(key)!;
    }
    pieces.push({
      d,
      role: pieceRole,
      fill,
      fillRule: a['fill-rule'] === 'evenodd' ? 'evenodd' : undefined,
      transform:
        [minX || minY ? `translate(${-minX} ${-minY})` : '', transform ?? '']
          .filter(Boolean)
          .join(' ') || undefined,
    });
  }

  if (pieces.length === 0) throw new Error('Zellige: no supported shapes found in the SVG');
  return { width, height, motifs: [{ id: 'custom', offset: [0, 0], pieces }] };
}

/** Reads `src/zellige/tiles/<name>.svg` at build time. */
export async function loadSvgTile(name: string): Promise<ZelligeTile> {
  const file = path.join(process.cwd(), 'src/zellige/tiles', `${name}.svg`);
  return parseSvgTile(await readFile(file, 'utf8'));
}
