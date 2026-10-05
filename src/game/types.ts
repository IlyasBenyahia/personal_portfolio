import type { Pillar } from '@/content/types';

/** Logical canvas size; the canvas is scaled to fit (letterboxed). */
export const VIEW_W = 960;
export const VIEW_H = 540;
/** Top of the ground platforms. */
export const GROUND_Y = 452;
/** Size of one zellige block of the platforms. */
export const BLOCK = 44;

export interface Platform {
  x: number;
  y: number;
  /** Width in blocks. */
  blocks: number;
  zone: number;
}

export interface Item {
  id: number;
  x: number;
  y: number;
  label: string;
  pillar: Pillar;
  zone: number;
  taken: boolean;
}

export type ObstacleKind = 'creep' | 'bug';

export interface Obstacle {
  id: number;
  kind: ObstacleKind;
  x: number;
  y: number;
  w: number;
  h: number;
  zone: number;
  /** Bugs patrol between minX and maxX. */
  minX: number;
  maxX: number;
  dir: 1 | -1;
  squashed: boolean;
}

export interface Level {
  zoneLength: number;
  zones: Pillar[];
  platforms: Platform[];
  items: Item[];
  obstacles: Obstacle[];
  /** World x of the finish line. */
  end: number;
}

export interface GameResult {
  score: number;
  collected: Item[];
  total: number;
  skipped: boolean;
}

export interface GameCallbacks {
  onScore: (score: number, combo: number) => void;
  onCollect: (item: Item) => void;
  onZone: (zone: number) => void;
  onHit: (reason: 'obstacle' | 'fall') => void;
  onProgress: (ratio: number) => void;
  onEnd: (result: GameResult) => void;
}

/** Colours resolved from the page's CSS tokens (light or dark theme). */
export interface GameColors {
  bg: string;
  surface: string;
  fg: string;
  muted: string;
  line: string;
  zPrimary: string;
  zSecondary: string;
  zTertiary: string;
  zNeutral: string;
  zInk: string;
  pillar: Record<Pillar, string>;
}
