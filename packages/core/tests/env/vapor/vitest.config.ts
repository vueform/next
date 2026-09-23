/**
 * Vapor smoke suite. Runs core source on Vue 3.6 (the `vue-vapor` npm alias)
 * while the workspace stays on 3.5, with every SFC — core's included — compiled
 * by the 3.6 vapor compiler (`vue-compiler-sfc-vapor` alias).
 *
 * Tests run vapor-compiled by default (`pnpm test:vapor`). `test:vapor:vdom`
 * sets VAPOR_ALL=0 to run the same specs with VDOM compilation on Vue 3.6, so a
 * failure can be attributed to vapor codegen vs. 3.6 itself.
 */
import { resolve } from 'node:path'
import Vue, { type Options } from '@vitejs/plugin-vue'
import ts from 'typescript'
import { defineConfig } from 'vitest/config'
import * as VaporCompiler from 'vue-compiler-sfc-vapor'

// The `vue/compiler-sfc` wrapper normally registers TypeScript so imported
// types (defineProps<...>) can be resolved via ts.sys. Using the raw
// @vue/compiler-sfc package (aliased), we must register it ourselves.
// Cast: the vapor compiler's `registerTS` is typed against its own bundled
// `typescript` instance — same version, different package identity.
VaporCompiler.registerTS(() => ts as any)

const vaporAll = process.env.VAPOR_ALL !== '0'

const src = resolve(__dirname, '../../../src')
const rootModules = resolve(__dirname, '../../../../../node_modules')

export default defineConfig({
  plugins: [
    Vue({
      compiler: VaporCompiler as unknown as Options['compiler'],
      features: { vapor: vaporAll },
    }),
  ],
  define: {
    __VAPOR_ALL__: JSON.stringify(vaporAll),
  },
  resolve: {
    alias: [
      // Node's "require" condition would pick vue's CJS build, which has no
      // vapor exports. The self-contained runtime-with-vapor build is the
      // only browser build that includes the vapor runtime, and being a
      // single file it avoids a mixed ESM/CJS graph of @vue/runtime-*
      // packages (dual runtime instances).
      {
        find: /^vue$/,
        replacement: resolve(
          rootModules,
          'vue-vapor/dist/vue.runtime-with-vapor.esm-browser.js'
        ),
      },
      { find: '~', replacement: src },
      { find: '#shorthands', replacement: resolve(src, 'types/shorthands.ts') },
      {
        find: /^@vueform\/core\/components$/,
        replacement: `${src}/components/index.ts`,
      },
      {
        find: /^@vueform\/core\/rules$/,
        replacement: `${src}/rules/index.ts`,
      },
      {
        find: /^@vueform\/core\/modules$/,
        replacement: `${src}/modules/modules.ts`,
      },
      {
        find: /^@vueform\/core\/locales$/,
        replacement: `${src}/locales/index.ts`,
      },
      { find: /^@vueform\/core$/, replacement: `${src}/index.ts` },
    ],
    dedupe: ['vue'],
  },
  test: {
    name: 'vapor',
    environment: 'happy-dom',
    include: [resolve(__dirname, '**/*.test.ts')],
  },
})
