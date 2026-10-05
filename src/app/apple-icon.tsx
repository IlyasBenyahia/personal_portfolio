import { ImageResponse } from 'next/og';
import { polygonPath, starPoints } from '@/components/zellige/geometry';

export const dynamic = 'force-static';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const star = polygonPath(starPoints(66).map(([x, y]) => [x + 90, y + 90] as const));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><rect width="180" height="180" fill="#f5f0e8"/><path d="${star}" fill="#b23a0a"/></svg>`;
  return new ImageResponse(
    <img
      src={`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`}
      width={180}
      height={180}
      alt=""
    />,
    size,
  );
}
