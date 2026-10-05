import { expect, test, type Page } from '@playwright/test';

/**
 * Zellige regression guard.
 *
 * 1. Page screenshots (hero + mosaic band, footer) compared to baselines,
 *    light / dark, desktop / mobile.
 * 2. Engine-independent check: every zellige SVG is re-rendered in isolation
 *    (as a standalone image: theme custom properties only, no page
 *    selectors). Firefox and Safari do not match page selectors inside <use>
 *    clones, so anything that only renders thanks to page CSS shows up here
 *    as black fills (the phase 6 regression), even though Chrome hides it.
 */

const SCHEMES = ['light', 'dark'] as const;
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;

async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
}

for (const scheme of SCHEMES) {
  for (const [device, viewport] of Object.entries(VIEWPORTS)) {
    test(`hero and mosaic band · ${scheme} · ${device}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      await page.setViewportSize(viewport);
      await open(page, '/en');
      await expect(page).toHaveScreenshot(`home-${scheme}-${device}.png`);
    });

    test(`footer line band · ${scheme} · ${device}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      await page.setViewportSize(viewport);
      await open(page, '/en');
      const footer = page.locator('footer');
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toHaveScreenshot(`footer-${scheme}-${device}.png`);
    });
  }
}

/** Renders each svg.zellige as a standalone image and measures its pixels. */
async function isolatedStats(page: Page) {
  return page.evaluate(async () => {
    const vars = [
      '--z-primary',
      '--z-secondary',
      '--z-tertiary',
      '--z-neutral',
      '--z-ink',
      '--z-grout',
      '--bg',
    ];
    const results: { variant: string; dark: number; ink: number; colourful: number }[] = [];
    for (const svg of document.querySelectorAll<SVGSVGElement>('svg.zellige')) {
      const cs = getComputedStyle(svg);
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.removeAttribute('class');
      clone.setAttribute(
        'style',
        vars.map((v) => `${v}:${cs.getPropertyValue(v)}`).join(';') + `;color:${cs.color}`,
      );
      const vb = svg.viewBox.baseVal;
      const w = 600;
      const h = Math.max(40, Math.round((w * vb.height) / vb.width));
      clone.setAttribute('width', String(w));
      clone.setAttribute('height', String(h));
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(clone.outerHTML);
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);
      let dark = 0;
      let ink = 0;
      let colourful = 0;
      const bg = getComputedStyle(document.body).backgroundColor.match(/\d+/g)!.map(Number);
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = [data[i]!, data[i + 1]!, data[i + 2]!];
        if (r + g + b < 40) dark++;
        if (Math.abs(r - bg[0]!) + Math.abs(g - bg[1]!) + Math.abs(b - bg[2]!) > 40) ink++;
        if (Math.max(r, g, b) - Math.min(r, g, b) > 60) colourful++;
      }
      const n = data.length / 4;
      results.push({
        variant: svg.classList.contains('zellige--mosaic') ? 'mosaic' : 'line',
        dark: dark / n,
        ink: ink / n,
        colourful: colourful / n,
      });
    }
    return results;
  });
}

for (const scheme of SCHEMES) {
  test(`zellige renders without page CSS (Firefox/Safari-safe) · ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await open(page, '/en');
    const stats = await isolatedStats(page);
    expect(stats.length).toBeGreaterThan(3);
    for (const s of stats) {
      if (s.variant === 'mosaic') {
        // Coloured pieces, not a black band.
        expect(s.colourful, `mosaic colourful ${JSON.stringify(s)}`).toBeGreaterThan(0.3);
        if (scheme === 'light')
          expect(s.dark, `mosaic black ${JSON.stringify(s)}`).toBeLessThan(0.1);
      } else {
        // Thin outlines: visible strokes, no filled shapes (broken render: > 90 %).
        expect(s.ink, `line strokes ${JSON.stringify(s)}`).toBeGreaterThan(0.01);
        expect(s.ink, `line filled ${JSON.stringify(s)}`).toBeLessThan(0.6);
      }
    }
  });
}

test('game platforms are drawn with the zellige tile', async ({ page }) => {
  await open(page, '/en');
  await page.getByRole('button', { name: /play/i }).click();
  await page.getByRole('button', { name: 'Start' }).click();
  await page.waitForTimeout(1500);
  const colourful = await page.locator('dialog canvas').evaluate((c: HTMLCanvasElement) => {
    const { data } = c.getContext('2d')!.getImageData(0, 0, c.width, c.height);
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (
        Math.max(data[i]!, data[i + 1]!, data[i + 2]!) -
          Math.min(data[i]!, data[i + 1]!, data[i + 2]!) >
        60
      )
        n++;
    }
    return n / (data.length / 4);
  });
  expect(colourful).toBeGreaterThan(0.02);
});

test('favicon is the computed zellige star', async ({ request }) => {
  const res = await request.get('/icon.svg');
  expect(res.ok()).toBe(true);
  expect(await res.text()).toContain('M28 16L24.49 19.51');
});
