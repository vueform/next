import { defineConfig } from 'tsdown'

/**
 * cli builds itself with tsdown (bundled ESM + d.ts): bundling inlines
 * src/components.json, leaving the single dist/index.js the committed bin
 * shim imports and the exports map points at.
 */
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  outDir: 'dist',
  platform: 'node',
  minify: false,
  target: false,
  // tsconfig.app.json explicitly: the package's default tsconfig.json is a
  // solution file (files: [] + references) the dts plugin cannot use.
  tsconfig: 'tsconfig.app.json',
  dts: true,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
})
