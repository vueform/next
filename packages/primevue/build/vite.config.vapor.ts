/**
 * Vapor-mode build. Emits the same module tree as the main build into
 * `dist/vapor`, with every SFC compiled by Vue 3.6's vapor compiler. Types and
 * theme assets are not re-emitted — the `./vapor/*` exports reuse the `.d.ts`
 * files from the main dist, and CSS/SCSS stay in the main dist.
 *
 * Externalized `@vueform/core` imports are rewritten to
 * `@vueform/core/vapor/...` so the vapor module tree never mixes with the VDOM
 * one (mixing would duplicate shared module state). PrimeVue stays VDOM and is
 * consumed via Vue's vaporInteropPlugin at runtime.
 */
import { resolve } from 'node:path'
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
  define: {
    // Selects the vapor function form of shared dual-mode directives
    // (see src/directives/tooltip.ts).
    __VUEFORM_VAPOR__: JSON.stringify(true),
  },
  resolve: {
    alias: {
      '@': srcDir,
      // Type-only marker stub — same as the vdom build (`vite.config.ts`).
      '#shorthands': resolve(srcDir, 'types/shorthands.ts'),
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
    // barrels pointing at the local tier modules that carry the CSS.
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
