/**
 * Single vitest entry for the package: every suite is a project here.
 *
 * - `integration` / `security` / `ssr` — the regular suites (`pnpm test`).
 * - `vapor` — core source compiled by the Vue 3.6 vapor compiler and run on the
 *   `vue-vapor` runtime (`pnpm test:vapor`; `test:vapor:vdom` sets
 *   `VAPOR_ALL=0` to compile the same specs as VDOM on 3.6).
 * - `bench` / `memory` — tool-invoked perf projects
 *   (`benchmarks/runtime/scripts/run.ts`). They contribute nothing to a normal
 *   test sweep: `bench` only declares benchmark files, and `memory` only
 *   includes its specs when `PERF_MEMORY` is set by the runner.
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
const src = resolve(__dirname, 'src')
const exprEvalSrc = resolve(__dirname, '../expr-eval/src')
const dompurifySrc = resolve(__dirname, '../dompurify/src')

const vaporAll = process.env.VAPOR_ALL !== '0'

const baseTest = {
  globals: true,
  environment: 'happy-dom',
}

const srcAliases = [
  { find: '~', replacement: src },
  { find: '#shorthands', replacement: resolve(src, 'types/shorthands.ts') },
  { find: /^@vueform\/expr-eval$/, replacement: `${exprEvalSrc}/index.ts` },
  { find: /^@vueform\/dompurify$/, replacement: `${dompurifySrc}/index.ts` },
  {
    find: /^@vueform\/core\/blueprints\/(.+)$/,
    replacement: `${src}/blueprints/$1.ts`,
  },
  {
    find: /^@vueform\/core\/components\/(.+)\/raw$/,
    replacement: `${src}/components/$1/index.ts`,
  },
  {
    find: /^@vueform\/core\/components\/(.+)$/,
    replacement: `${src}/components/$1/unstyled.ts`,
  },
  {
    find: /^@vueform\/core\/components$/,
    replacement: `${src}/components/index.ts`,
  },
  {
    find: /^@vueform\/core\/modules$/,
    replacement: `${src}/modules/modules.ts`,
  },
  { find: /^@vueform\/core\/rules$/, replacement: `${src}/rules/index.ts` },
  {
    find: /^@vueform\/core\/locales$/,
    replacement: `${src}/locales/index.ts`,
  },
  { find: /^@vueform\/core$/, replacement: `${src}/index.ts` },
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
    ...baseTest,
    projects: [
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['./tests/integration/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'security',
          include: ['./tests/security/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'ssr',
          environment: 'node',
          include: ['./tests/env/ssr/*.test.ts'],
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
        },
        resolve: {
          alias: [
            // Node's "require" condition would pick vue's CJS build, which
            // has no vapor exports. The self-contained runtime-with-vapor
            // build is the only browser build that includes the vapor
            // runtime, and being a single file it avoids a mixed ESM/CJS
            // graph of @vue/runtime-* packages (dual runtime instances).
            {
              find: /^vue$/,
              replacement:
                require.resolve('vue-vapor/dist/vue.runtime-with-vapor.esm-browser.js'),
            },
            ...srcAliases,
          ],
          dedupe: ['vue'],
        },
        test: {
          ...baseTest,
          name: 'vapor',
          include: ['./tests/env/vapor/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'bench',
          include: [],
          fileParallelism: false,
          maxWorkers: 1,
          testTimeout: 60_000,
          hookTimeout: 60_000,
          benchmark: {
            include: ['./benchmarks/**/*.bench.ts'],
            reporters: ['verbose'],
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'memory',
          include: process.env.PERF_MEMORY ? ['./benchmarks/**/*.mem.ts'] : [],
          fileParallelism: false,
          isolate: false,
          maxWorkers: 1,
          testTimeout: 120_000,
          hookTimeout: 120_000,
          pool: 'forks',
          execArgv: ['--expose-gc'],
        },
      },
    ],
  },
})
