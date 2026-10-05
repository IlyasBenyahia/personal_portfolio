import 'server-only';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export interface OptimizedImage {
  width: number;
  height: number;
  sources: Record<'avif' | 'webp', { src: string; width: number }[]>;
}

let manifest: Record<string, OptimizedImage> | null = null;

/**
 * Optimised variants of src/assets/images/<key>, produced by
 * scripts/optimize-images.mjs (run before dev/build). Throws on an unknown
 * key so a typo fails the build instead of shipping a broken image.
 */
export function getImage(key: string): OptimizedImage {
  manifest ??= (() => {
    try {
      return JSON.parse(
        readFileSync(path.join(process.cwd(), 'src/assets/images/.manifest.json'), 'utf8'),
      ) as Record<string, OptimizedImage>;
    } catch {
      return {};
    }
  })();
  const image = manifest[key];
  if (!image) {
    throw new Error(
      `Image "${key}" not found in src/assets/images (run \`npm run images\` after adding it).`,
    );
  }
  return image;
}
