import type { CSSProperties } from 'react';
import { khatamTile, layoutTile, type ZelligeTile } from './geometry';

export interface ZelligeProps {
  /** Computed tile (default: khatam star & cross) or one loaded with loadSvgTile(). */
  tile?: ZelligeTile;
  /** Number of repeats across / down. */
  cols?: number;
  rows?: number;
  /** `mosaic`: coloured pieces with grout lines. `line`: outlines only (currentColor). */
  variant?: 'mosaic' | 'line';
  /** Each tile reveals as `--p` (0→1) passes its build order. Driven by <ZelligeScrollBuild>. */
  animate?: boolean;
  /** Imported SVG tiles only: keep the file's own colours instead of the palette. */
  keepColors?: boolean;
  /** `slice` fills its box like background-size: cover. */
  fit?: 'meet' | 'slice';
  className?: string;
  style?: CSSProperties;
}

/** Decorative zellige surface, rendered as static SVG at build time. */
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
  const width = cols * tile.width;
  const height = rows * tile.height;
  const placed = layoutTile(tile, cols, rows);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={`xMidYMid ${fit}`}
      className={['zellige', `zellige--${variant}`, className].filter(Boolean).join(' ')}
      data-animate={animate || undefined}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {placed.map(({ key, motif, x, y, order, col, row }) => {
        const pieces = variant === 'line' ? (motif.outline ?? motif.pieces) : motif.pieces;
        return (
          <g key={key} transform={`translate(${x} ${y})`}>
            <g
              className="zt"
              data-alt={(col + row) % 2 === 1 || undefined}
              style={animate ? ({ '--t': order } as CSSProperties) : undefined}
            >
              {pieces.map((p, i) => (
                <path
                  key={i}
                  d={p.d}
                  className={keepColors ? undefined : `z-${p.role}`}
                  fillRule={p.fillRule}
                  transform={p.transform}
                  fill={keepColors ? p.fill : undefined}
                />
              ))}
            </g>
          </g>
        );
      })}
    </svg>
  );
}
