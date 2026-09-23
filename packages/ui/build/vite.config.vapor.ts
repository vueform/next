/**
 * Vapor-mode build. Emits the same module tree as the main build into
 * `dist/vapor`, with every SFC compiled by Vue 3.6's vapor compiler. Types and
 * theme assets are not re-emitted — the `./vapor/*` exports reuse the `.d.ts`
 * files from the main dist, and the externalized `@vueform/ui/<chunk>.css`
 * imports (per-component styles.ts) resolve to the main dist's chunks.
 *
 * Externalized `@vueform/core` imports are rewritten to
 * `@vueform/core/vapor/...` so the vapor module tree never mixes with the VDOM
 * one (mixing would duplicate shared module state).
 */
import Vue, { type Options } from '@vitejs/plugin-vue'
import VfBuild from '@vueform/vite/build'
import ts from 'typescript'
import { defineConfig } from 'vite'
import * as VaporCompiler from 'vue-compiler-sfc-vapor'
import { createBuildOptions, srcDir } from './vite.base'

// The `vue/compiler-sfc` wrapper normally registers TypeScript so imported
// types (defineProps<...>) can be resolved via ts.sys. Using the raw
// @vue/compiler-sfc package (aliased), we must register it ourselves.
// @ts-expect-error version skew: the rc compiler's bundled ts typings vs
// the workspace typescript — structurally different, runtime-compatible.
VaporCompiler.registerTS(() => ts)

export default defineConfig({
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
  plugins: [
    Vue({
      compiler: VaporCompiler as unknown as Options['compiler'],
      features: {
        vapor: true,
      },
    }),
    // Barrel/binding rewrites only (no theme emission) — keeps the vapor
    // barrels pointing at the local augment modules that carry the CSS.
    VfBuild(),
  ],
  logLevel: 'warn',
  build: createBuildOptions({
    outDir: './dist/vapor',
    paths: (id) =>
      id === '@vueform/core'
        ? '@vueform/core/vapor'
        : id.startsWith('@vueform/core/')
          ? id.replace('@vueform/core/', '@vueform/core/vapor/')
          : id,
  }),
})
