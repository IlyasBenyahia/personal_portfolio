import { useId, type CSSProperties } from 'react';
import {
  khatamTile,
  layoutTile,
  type ZelligePiece,
  type ZelligeRole,
  type ZelligeTile,
} from './geometry';

/**
 * Piece styles are inline on purpose. Motifs are cloned by <use>, and
 * Firefox / Safari do not match page selectors against those clones (Chrome
 * does): a class-based `fill` silently falls back to black there. Inline
 * styles travel with the clone, and custom properties inherit through <use>
 * in every engine, so the theme tokens still apply.
 */
const ROLE_FILL: Record<ZelligeRole, string> = {
  // --z-a / --z-b are swapped on every other cell (checkerboard).
  primary: 'var(--z-a, var(--z-primary))',
  secondary: 'var(--z-b, var(--z-secondary))',
  tertiary: 'var(--z-tertiary)',
  neutral: 'var(--z-neutral)',
  ink: 'var(--z-ink)',
};

const ALT_CELL: CSSProperties = {
  ['--z-a' as string]: 'var(--z-secondary)',
  ['--z-b' as string]: 'var(--z-primary)',
};

function pieceStyle(
  piece: ZelligePiece,
  variant: 'mosaic' | 'line',
  keepColors: boolean,
): CSSProperties {
  if (variant === 'line') {
    return {
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 'var(--z-line-width, 1.2)',
      strokeLinejoin: 'round',
    };
  }
  return {
    fill: keepColors ? (piece.fill ?? 'currentColor') : ROLE_FILL[piece.role],
    stroke: 'var(--z-grout)',
    strokeWidth: 'var(--z-grout-width, 1.6)',
    strokeLinejoin: 'round',
  };
}

export interface ZelligeProps {
  /** Computed tile (default: khatam star & cross) or one loaded with loadSvgTile(). */
  tile?: ZelligeTile;
  /** Number of repeats across / down. */
  cols?: number;
  rows?: number;
  /** `mosaic`: coloured pieces with grout lines. `line`: outlines only (currentColor). */
  variant?: 'mosaic' | 'line';
  /** Each tile fades in as a wave from the centre. Wrap in <ZelligeReveal>. */
  animate?: boolean;
  /** Imported SVG tiles only: keep the file's own colours instead of the palette. */
  keepColors?: boolean;
  /** `slice` fills its box like background-size: cover. */
  fit?: 'meet' | 'slice';
  className?: string;
  style?: CSSProperties;
}

/**
 * Decorative zellige surface, rendered as static SVG at build time.
 *
 * Each motif is defined once in <defs>. Static surfaces repeat it through an
 * SVG <pattern> (2 × 2 cells, for the checkerboard colour swap), so a surface
 * costs about 1 KB whatever its size. Animated surfaces need one element per
 * tile, so they place lightweight <use> references instead of copying paths.
 * Colours: see ROLE_FILL above (inline styles + inherited custom properties).
 */
export function Zellige({
  tile = khatamTile(),
  cols = 8,
  rows = 2,
  variant = 'mosaic',
  animate = false,
  keepColors = false,
  fit = 'meet',
  className,
  style,
}: ZelligeProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const width = cols * tile.width;
  const height = rows * tile.height;
  const motifId = (i: number) => `${uid}-m${i}`;

  const defs = tile.motifs.map((motif, i) => {
    const pieces = variant === 'line' ? (motif.outline ?? motif.pieces) : motif.pieces;
    return (
      <g key={motif.id} id={motifId(i)}>
        {pieces.map((p, j) => (
          <path
            key={j}
            d={p.d}
            fillRule={p.fillRule}
            transform={p.transform}
            style={pieceStyle(p, variant, keepColors)}
          />
        ))}
      </g>
    );
  });

  const svgProps = {
    viewBox: `0 0 ${width} ${height}`,
    preserveAspectRatio: `xMidYMid ${fit}`,
    className: ['zellige', `zellige--${variant}`, className].filter(Boolean).join(' '),
    style,
    'aria-hidden': true,
    focusable: false,
  } as const;

  if (animate) {
    // Only tiles that can show inside the viewBox (motifs span about one period).
    const placed = layoutTile(tile, cols, rows).filter(
      ({ x, y }) =>
        x > -tile.width / 2 &&
        x < width + tile.width / 2 &&
        y > -tile.height / 2 &&
        y < height + tile.height / 2,
    );
    return (
      <svg {...svgProps} data-animate="">
        <defs>{defs}</defs>
        {placed.map(({ key, motif, x, y, order, col, row }) => (
          <use
            key={key}
            href={`#${motifId(tile.motifs.indexOf(motif))}`}
            x={x}
            y={y}
            className="zt"
            style={{
              ['--t' as string]: order,
              ...(Math.abs(col + row) % 2 === 1 ? ALT_CELL : undefined),
            }}
          />
        ))}
      </svg>
    );
  }

  // One pattern tile = 2 × 2 cells; every motif also drawn from the
  // neighbouring repeats so pieces straddling the edges are complete.
  const cells: { x: number; y: number; alt: boolean }[] = [];
  for (let row = -1; row <= 2; row++) {
    for (let col = -1; col <= 2; col++) {
      cells.push({
        x: col * tile.width,
        y: row * tile.height,
        alt: (((col + row) % 2) + 2) % 2 === 1,
      });
    }
  }
  const patternId = `${uid}-p`;
  return (
    <svg {...svgProps}>
      <defs>
        {defs}
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width={tile.width * 2}
          height={tile.height * 2}
        >
          {cells.flatMap((cell) =>
            tile.motifs.map((motif, i) => (
              <use
                key={`${cell.x}-${cell.y}-${i}`}
                href={`#${motifId(i)}`}
                x={cell.x + motif.offset[0]}
                y={cell.y + motif.offset[1]}
                style={cell.alt ? ALT_CELL : undefined}
              />
            )),
          )}
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${patternId})`} />
    </svg>
  );
}
