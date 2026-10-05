import 'server-only';
import { cache } from 'react';
import { SITE_TILES, type TileVariant } from '@/zellige/config';
import { khatamTile, type ZelligeTile } from './geometry';
import { loadSvgTile } from './load-svg-tile';

/** The tile configured for a variant in src/zellige/config.ts, loaded once per build. */
export const getSiteTile = cache(async (variant: TileVariant): Promise<ZelligeTile> => {
  const source = SITE_TILES[variant];
  if (source.kind === 'svg') return loadSvgTile(source.file);
  return khatamTile();
});
