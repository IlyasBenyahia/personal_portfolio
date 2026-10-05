import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { layoutTile } from '@/components/zellige/geometry';
import { getSiteTile } from '@/components/zellige/site-tile';

export const OG_SIZE = { width: 1200, height: 630 };

const PAPER = '#f5f0e8';
const INK = '#1c1917';
const MUTED = '#57534e';
const PILLARS = ['#b23a0a', '#1e40af', '#0f766e'];

const font = (pkg: string, file: string) =>
  readFile(path.join(process.cwd(), 'node_modules/@fontsource', pkg, 'files', file));

/** The site tile as a line drawing, inlined as an SVG data URI (Satori renders <img>). */
async function zelligeDataUri(cols: number, rows: number): Promise<string> {
  const tile = await getSiteTile();
  const paths = layoutTile(tile, cols, rows)
    .flatMap(({ motif, x, y }) =>
      (motif.outline ?? motif.pieces).map(
        (p) =>
          `<path transform="translate(${x} ${y})${p.transform ? ` ${p.transform}` : ''}" d="${p.d}"/>`,
      ),
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols * tile.width} ${rows * tile.height}" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="${INK}" stroke-opacity="0.16" stroke-width="1.2">${paths}</g></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/** Shared 1200×630 card used for every page's Open Graph / Twitter image. */
export async function renderOgImage({
  eyebrow,
  title,
  subtitle,
  pillars,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Design / Develop / Grow labels, in the page language. */
  pillars: [string, string, string];
}) {
  const [fraunces, inter, mono, pattern] = await Promise.all([
    font('fraunces', 'fraunces-latin-600-normal.woff'),
    font('inter', 'inter-latin-400-normal.woff'),
    font('jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'),
    zelligeDataUri(6, 7),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: PAPER,
        color: INK,
        fontFamily: 'Inter',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Satori only renders <img> */}
      <img
        src={pattern}
        width={540}
        height={630}
        alt=""
        style={{ position: 'absolute', right: 0, top: 0 }}
      />
      <div
        style={{
          position: 'absolute',
          left: 660,
          top: 0,
          width: 260,
          height: 630,
          backgroundImage: `linear-gradient(to right, ${PAPER}, rgba(245, 240, 232, 0))`,
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          width: 760,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'JetBrains Mono',
            fontSize: 24,
            color: PILLARS[0],
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontFamily: 'Fraunces',
              fontSize: title.length > 40 ? 64 : 84,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
          <div style={{ marginTop: 24, fontSize: 30, lineHeight: 1.35, color: MUTED }}>
            {subtitle}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 28, fontFamily: 'Fraunces', fontSize: 34 }}>
          {pillars.map((label, i) => (
            <div
              key={label}
              style={{ display: 'flex', alignItems: 'center', gap: 28, color: PILLARS[i] }}
            >
              {i > 0 && <div style={{ width: 28, height: 2, background: MUTED }} />}
              {label}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 12,
          display: 'flex',
        }}
      >
        {PILLARS.map((c) => (
          <div key={c} style={{ flex: 1, background: c }} />
        ))}
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Fraunces', data: fraunces, weight: 600, style: 'normal' },
        { name: 'Inter', data: inter, weight: 400, style: 'normal' },
        { name: 'JetBrains Mono', data: mono, weight: 400, style: 'normal' },
      ],
    },
  );
}
