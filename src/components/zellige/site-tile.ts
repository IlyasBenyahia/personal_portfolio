import 'server-only';
import { cache } from 'react';
import { SITE_TILE } from '@/zellige/config';
import { khatamTile, type ZelligeTile } from './geometry';
import { loadSvgTile } from './load-svg-tile';

/** The tile configured in src/zellige/config.ts, loaded once per build. */
export const getSiteTile = cache(async (): Promise<ZelligeTile> => {
  if (SITE_TILE.kind === 'svg') return loadSvgTile(SITE_TILE.file);
  return khatamTile();
});
