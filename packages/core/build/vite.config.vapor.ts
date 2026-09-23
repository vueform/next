/**
 * Vapor-mode build. Emits the same module tree as the main build into
 * `dist/vapor`, with every SFC compiled by Vue 3.6's vapor compiler. Types and
 * theme assets are not re-emitted — the `./vapor/*` exports reuse the `.d.ts`
 * files from the main dist.
 *
 * The workspace runs Vue 3.5, so the 3.6 compiler is provided via the
 * `vue-compiler-sfc-vapor` npm alias. The emitted code only imports from 'vue'
 * (external), so 3.6 is a runtime requirement for consumers, not a build
 * requirement here.
 */
import { resolve } from 'node:path'
import Vue, { type Options } from '@vitejs/plugin-vue'
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
      '~': srcDir,
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
      template: {
        compilerOptions: {
          comments: false,
        },
      },
    }),
  ],
  logLevel: 'warn',
  build: createBuildOptions('./dist/vapor'),
})
