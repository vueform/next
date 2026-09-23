/**
 * Single vitest entry for the package: every suite is a project here.
 *
 * - `integration` — the regular suite (`pnpm test`).
 * - `vapor` — adapter + core source on Vue 3.6 (the `vue-vapor` npm alias)
 *   compiled by the 3.6 vapor compiler, PrimeVue itself staying VDOM under
 *   `vaporInteropPlugin` (`pnpm test:vapor`; `test:vapor:vdom` sets
 *   `VAPOR_ALL=0` to compile the same specs as VDOM on 3.6).
 */
import { createRequire } from 'node:module'
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

const require = createRequire(import.meta.url)

const vaporAll = process.env.VAPOR_ALL !== '0'

const src = resolve(__dirname, 'src')
const coreSrc = resolve(__dirname, '../core/src')
const exprEvalSrc = resolve(__dirname, '../expr-eval/src')
const dompurifySrc = resolve(__dirname, '../dompurify/src')

// The self-contained runtime-with-vapor build is the only browser build that
// includes the vapor runtime; a single file avoids a mixed ESM/CJS graph of
// @vue/runtime-* packages (dual runtime instances).
const vueVapor =
  require.resolve('vue-vapor/dist/vue.runtime-with-vapor.esm-browser.js')

const srcAliases = [
  { find: '@', replacement: src },
  { find: '#shorthands', replacement: resolve(src, 'types/shorthands.ts') },
  { find: '~', replacement: coreSrc },
  { find: /^@vueform\/expr-eval$/, replacement: `${exprEvalSrc}/index.ts` },
  { find: /^@vueform\/dompurify$/, replacement: `${dompurifySrc}/index.ts` },
  {
    find: /^@vueform\/core\/components\/([^/]+)\/raw$/,
    replacement: `${coreSrc}/components/$1/index.ts`,
  },
  {
    find: /^@vueform\/core\/components\/([^/]+)$/,
    replacement: `${coreSrc}/components/$1/unstyled.ts`,
  },
  {
    find: /^@vueform\/core\/components$/,
    replacement: `${coreSrc}/components/index.ts`,
  },
  {
    find: /^@vueform\/core\/blueprints\/(.+)$/,
    replacement: `${coreSrc}/blueprints/$1`,
  },
  {
    find: /^@vueform\/core\/([\w-]+)\.s?css$/,
    replacement: `${coreSrc}/scss/$1.scss`,
  },
  { find: '@vueform/core/rules', replacement: `${coreSrc}/rules/index.ts` },
  {
    find: '@vueform/core/modules',
    replacement: `${coreSrc}/modules/modules.ts`,
  },
  {
    find: '@vueform/core/locales',
    replacement: `${coreSrc}/locales/index.ts`,
  },
  { find: '@vueform/core/tokens', replacement: `${coreSrc}/tokens/index.ts` },
  { find: /^@vueform\/core$/, replacement: `${coreSrc}/index.ts` },
]

export default defineConfig({
  plugins: [Vue()],
  resolve: {
    alias: [
      { find: /^vue$/, replacement: 'vue/dist/vue.esm-bundler.js' },
      ...srcAliases,
    ],
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    projects: [
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['./tests/integration/**/*.test.ts'],
        },
      },
      {
        // Own compiler and runtime — deliberately no `extends`.
        plugins: [
          Vue({
            compiler: VaporCompiler as unknown as Options['compiler'],
            features: { vapor: vaporAll },
          }),
        ],
        define: {
          __VAPOR_ALL__: JSON.stringify(vaporAll),
          // Align dual-mode directives (tooltip) with the SFC compile mode.
          __VUEFORM_VAPOR__: JSON.stringify(vaporAll),
        },
        resolve: {
          alias: [
            // Alias the @vue/* packages too so PrimeVue (which imports them
            // directly) shares the same Vue 3.6 copy.
            { find: /^vue$/, replacement: vueVapor },
            { find: /^@vue\/runtime-dom$/, replacement: vueVapor },
            { find: /^@vue\/runtime-core$/, replacement: vueVapor },
            { find: /^@vue\/reactivity$/, replacement: vueVapor },
            ...srcAliases,
          ],
          dedupe: [
            'vue',
            '@vue/runtime-core',
            '@vue/runtime-dom',
            '@vue/reactivity',
          ],
        },
        test: {
          name: 'vapor',
          environment: 'happy-dom',
          include: ['./tests/env/vapor/**/*.{test,spec}.ts'],
          server: {
            deps: {
              // Re-bundle PrimeVue against the aliased Vue 3.6 runtime.
              inline: ['primevue', '@primevue/core', '@primeuix/styles'],
            },
          },
        },
      },
    ],
  },
})
