import { readFileSync } from 'node:fs'

import { defineConfig } from 'tsdown'

// Inline twin of shared.ts' indexBanner — see the self-contained note below.
const { name, version } = JSON.parse(readFileSync('./package.json', 'utf8'))
const banner = `/*!\n * ${name} v${version}\n * (c) 2020-present Adam Berecz\n * @license MIT\n */\n`

/**
 * utils builds itself with tsdown (CJS, 1:1 src mirror — the layout the
 * committed bin shims `require()` and the vite/vitest configs import).
 * Self-contained on purpose: this config cannot import `@vueform/utils` (its
 * own, possibly not-yet-built dist).
 */
export default defineConfig({
  entry: ['src/**/*.ts'],
  format: ['cjs'],
  outDir: 'dist',
  unbundle: true,
  platform: 'node',
  minify: false,
  target: false,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  deps: { neverBundle: true },
  outputOptions: {
    banner: (chunk: { name: string }) => (chunk.name === 'index' ? banner : ''),
  },
})
