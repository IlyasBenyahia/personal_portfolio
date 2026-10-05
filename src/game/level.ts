import type { Pillar } from '@/content/types';
import { BLOCK, GROUND_Y, type Item, type Level, type Obstacle, type Platform } from './types';

export const ZONES: Pillar[] = ['design', 'develop', 'grow'];

/** Small deterministic PRNG: every run gets the same, fair level. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const START_RUNWAY = 14 * BLOCK;
/** Platforms start before x = 0 so the screen is never empty at the start. */
const VIEW_MARGIN = 400;

/** Zone index (0–2) of a world position. */
export const zoneAt = (x: number, zoneLength: number) =>
  Math.max(0, Math.min(ZONES.length - 1, Math.floor((x - START_RUNWAY) / zoneLength)));

/**
 * Builds the three zones (Design → Develop → Grow). Collectibles are exactly
 * the skills of skills.ts, one zone per pillar. Zone 1 has "scope creep"
 * blobs, zone 2 has bugs (stomp them), zone 3 has more "bounce rate" gaps.
 */
export function buildLevel(skills: Record<Pillar, string[]>, zoneLength = 9000): Level {
  const rand = mulberry32(2027);
  const between = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
  const platforms: Platform[] = [];
  const items: Item[] = [];
  const obstacles: Obstacle[] = [];
  let id = 0;

  platforms.push({
    x: -VIEW_MARGIN,
    y: GROUND_Y,
    blocks: Math.ceil((START_RUNWAY + VIEW_MARGIN) / BLOCK),
    zone: 0,
  });
  let x = START_RUNWAY;

  ZONES.forEach((pillar, zone) => {
    const start = START_RUNWAY + zone * zoneLength;
    const end = start + zoneLength;

    // Ground: runs of blocks separated by gaps (wider and more frequent in "Grow").
    while (x < end) {
      const gap = zone === 2 ? between(2, 3) : between(0, 2) === 0 ? 0 : 2;
      x += gap * BLOCK;
      const blocks = zone === 2 ? between(5, 9) : between(7, 13);
      platforms.push({ x, y: GROUND_Y, blocks, zone });
      x += blocks * BLOCK;
    }

    // A few floating platforms, for rhythm.
    for (let i = 0; i < 4; i++) {
      const px = start + ((i + 0.6) * zoneLength) / 4.2;
      platforms.push({ x: Math.round(px / BLOCK) * BLOCK, y: GROUND_Y - 132, blocks: 3, zone });
    }

    // Collectibles: the pillar's skills, evenly spaced, alternating heights.
    const list = skills[pillar];
    list.forEach((label, i) => {
      items.push({
        id: id++,
        x: start + ((i + 0.5) * zoneLength) / list.length,
        y: GROUND_Y - (i % 2 === 0 ? 64 : 150),
        label,
        pillar,
        zone,
        taken: false,
      });
    });

    // Obstacles between collectibles, only on solid ground away from edges.
    if (zone < 2) {
      for (let i = 0; i < list.length; i++) {
        if (i % 2 === 1 && zone === 0) continue;
        const ox = start + ((i + 1) * zoneLength) / list.length;
        const ground = platforms.find(
          (p) =>
            p.y === GROUND_Y && ox > p.x + BLOCK * 1.5 && ox < p.x + p.blocks * BLOCK - BLOCK * 1.5,
        );
        if (!ground) continue;
        const kind = zone === 0 ? 'creep' : 'bug';
        const w = kind === 'bug' ? 34 : 36;
        const h = kind === 'bug' ? 24 : 30;
        obstacles.push({
          id: id++,
          kind,
          x: ox,
          y: GROUND_Y - h,
          w,
          h,
          zone,
          minX: Math.max(ground.x + 8, ox - 48),
          maxX: Math.min(ground.x + ground.blocks * BLOCK - w - 8, ox + 48),
          dir: -1,
          squashed: false,
        });
      }
    }
  });

  const end = START_RUNWAY + ZONES.length * zoneLength;
  // Finish: one long platform past the line.
  platforms.push({ x, y: GROUND_Y, blocks: Math.ceil((end - x + 2000) / BLOCK) + 1, zone: 2 });

  return { zoneLength, zones: ZONES, platforms, items, obstacles, end };
}
