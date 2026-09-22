import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/screenshots',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: 'list',
  timeout: 60_000,

  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 10,
    },
  },

  use: {
    baseURL: 'http://localhost:5180',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  webServer: {
    // Kill leftover Vite (pnpm exec doesn't always forward SIGTERM), clear
    // all dep caches, then exec Vite directly so Playwright can kill it cleanly.
    command: [
      'lsof -ti :5180 | xargs kill -9 2>/dev/null || true',
      'rm -rf tests/screenshots/fixture/node_modules/.vite node_modules/.vite',
      'sleep 0.5',
      'exec ../../node_modules/.bin/vite --port 5180 --force --config tests/screenshots/fixture/vite.config.ts',
    ].join(' && '),
    url: 'http://localhost:5180',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
