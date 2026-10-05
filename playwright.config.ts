import { defineConfig, devices } from '@playwright/test';

/**
 * Visual regression tests on the static build (run `npm run build` first).
 * Baselines live in tests/visual/__screenshots__ (Chromium, Linux): update
 * them deliberately with `npm run test:visual:update` after a wanted change.
 */
export default defineConfig({
  testDir: 'tests/visual',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4400',
    contextOptions: { reducedMotion: 'reduce' },
    deviceScaleFactor: 1,
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1 } }],
  webServer: {
    command: 'node scripts/serve-static.mjs out 4400',
    url: 'http://127.0.0.1:4400/en',
    reuseExistingServer: true,
  },
});
