/**
 * Vite config for the visual-test fixture app. Served by Playwright's webServer
 * (see `../playwright.config.ts`); everything resolves to workspace sources via
 * the shared alias derivation, never dist.
 */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { workspaceSourceAliases } from '@vueform/utils'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packages = resolve(__dirname, '../../../..')

export default defineConfig({
  root: __dirname,
  // Keep the Vite cache inside the fixture so screenshot runs can wipe it
  // without touching the package-level optimizer cache.
  cacheDir: resolve(__dirname, 'node_modules/.vite'),
  plugins: [vue()],
  server: {
    fs: {
      allow: [resolve(packages, '..')],
    },
  },
  resolve: {
    alias: [
      { find: /^vue$/, replacement: 'vue/dist/vue.esm-bundler.js' },
      ...workspaceSourceAliases(packages, { styles: true }),
    ],
  },
})
