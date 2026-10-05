// Build-time image optimisation (next/image cannot optimise a static export).
// Every image in src/assets/images/ is resized to several widths and encoded
// as AVIF + WebP into public/images/opt/, with a manifest read by <Picture>.
// Runs before `dev` and `build`; unchanged images are skipped.
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src/assets/images');
const OUT = path.join(ROOT, 'public/images/opt');
const MANIFEST = path.join(SRC, '.manifest.json');
const WIDTHS = [480, 800, 1200, 1600, 2000];
const FORMATS = {
  avif: (img) => img.avif({ quality: 55, effort: 4 }),
  webp: (img) => img.webp({ quality: 76 }),
};

async function walk(dir) {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])),
  );
  return files.flat().filter((f) => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f));
}

const mtime = (f) =>
  stat(f).then(
    (s) => s.mtimeMs,
    () => 0,
  );

const manifest = {};
const files = await walk(SRC);
await mkdir(OUT, { recursive: true });

for (const file of files) {
  const key = path.relative(SRC, file).split(path.sep).join('/');
  const base = key.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9/_-]/g, '-');
  const meta = await sharp(file).rotate().metadata();
  const width = meta.autoOrient?.width ?? meta.width;
  const height = meta.autoOrient?.height ?? meta.height;
  const widths = [...new Set([...WIDTHS.filter((w) => w < width), Math.min(width, 2000)])];
  const sourceTime = await mtime(file);
  const entry = { width, height, sources: {} };

  for (const [format, encode] of Object.entries(FORMATS)) {
    entry.sources[format] = [];
    for (const w of widths) {
      const name = `${base}-${w}.${format}`;
      const out = path.join(OUT, name);
      if ((await mtime(out)) < sourceTime) {
        await mkdir(path.dirname(out), { recursive: true });
        await encode(sharp(file).rotate().resize({ width: w, withoutEnlargement: true })).toFile(
          out,
        );
      }
      entry.sources[format].push({ src: `/images/opt/${name}`, width: w });
    }
  }
  manifest[key] = entry;
}

await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`optimize-images: ${files.length} image(s) → public/images/opt`);
