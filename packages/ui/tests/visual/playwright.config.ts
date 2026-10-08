/**
 * Playwright config for the visual (screenshot) suite (`pnpm test-visual`).
 *
 * Baselines are committed under `screenshots/<spec>/` and are
 * darwin/chromium-only — the suite is a local gate; other platforms would need
 * their own baselines. Regenerate deliberately with `pnpm test-visual
 * --update-snapshots` after an intended visual change.
 *
 * The fixture app (see `fixtures/`) is served from workspace sources by the
 * webServer below and renders one grid/matrix case per URL
 * (`/?suite=grid&type=text&combination=3`).
 */
// Playwright transpiles this config to CJS (the package is not
// `"type": "module"`), so `import.meta` is unavailable — the CJS `__dirname`
// global is what anchors paths to this file's directory.
import { join } from 'node:path'

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  snapshotPathTemplate:
    '{testDir}/screenshots/{testFileName}/{arg}-{projectName}-{platform}{ext}',
  fullyParallel: true,
  outputDir: join(__dirname, 'test-results'),
  reporter: [
    ['list'],
    [
      'html',
      { outputFolder: join(__dirname, 'playwright-report'), open: 'never' },
    ],
  ],
  use: {
    baseURL: 'http://localhost:4273',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Absolute --config path: `pnpm exec` runs from the nearest package root
    // regardless of the spawn cwd, so a relative path would not resolve.
    command: `pnpm exec vite --config ${join(__dirname, 'fixtures/vite.config.ts')} --port 4273 --strictPort`,
    url: 'http://localhost:4273',
    reuseExistingServer: !process.env.CI,
  },
})
