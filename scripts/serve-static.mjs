// Minimal static server for out/ with Cloudflare-like clean URLs
// (/en → en.html, unknown → 404.html with a 404 status). No dependencies.
// Usage: node scripts/serve-static.mjs [dir=out] [port=4400]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'out');
const port = Number(process.argv[3] ?? 4400);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

async function isFile(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const clean = decodeURIComponent(url.pathname).replace(/\/+$/, '') || '/';
  const base = path.join(root, path.normalize(clean).replace(/^(\.\.[/\\])+/, ''));
  const candidates = [base, `${base}.html`, path.join(base, 'index.html')];
  for (const file of candidates) {
    if (file.startsWith(root) && (await isFile(file))) {
      const type =
        TYPES[path.extname(file)] ??
        (/-image$|apple-icon$/.test(file) ? 'image/png' : 'application/octet-stream');
      res.writeHead(200, { 'Content-Type': type });
      res.end(await readFile(file));
      return;
    }
  }
  res.writeHead(404, { 'Content-Type': TYPES['.html'] });
  res.end(await readFile(path.join(root, '404.html')).catch(() => 'Not found'));
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} on http://127.0.0.1:${port}`));
