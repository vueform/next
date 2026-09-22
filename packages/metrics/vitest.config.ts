/**
 * Benchmark vitest config. BENCH_MODE selects vapor or vdom:
 *
 * - `vue` always resolves to the Vue 3.6 runtime-with-vapor production build, so
 *   both modes run on the same runtime.
 * - In vapor mode every `@vueform/ui/...` import is aliased to its
 *   `@vueform/ui/vapor/...` dist twin and BenchRoot.vue is vapor-compiled
 *   (vue-compiler-sfc-vapor with `features.vapor`).
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import { resolve } from 'node:path'
import Vue, { type Options } from '@vitejs/plugin-vue'
import { playwright } from '@vitest/browser-playwright'
import ts from 'typescript'
import { defineConfig } from 'vitest/config'
import * as VaporCompiler from 'vue-compiler-sfc-vapor'

// The `vue/compiler-sfc` wrapper normally registers TypeScript so imported
// types (defineProps<...>) can be resolved via ts.sys. Using the raw
// @vue/compiler-sfc package (aliased), we must register it ourselves.
// The benchmark's `typescript` and the one `vue-compiler-sfc-vapor` was typed
// against differ in version; the runtime contract is the same.
VaporCompiler.registerTS(() => ts as never)

const resultsPath = resolve(__dirname, 'results/json/benchmarks.json')

const mode = process.env.BENCH_MODE === 'vapor' ? 'vapor' : 'vdom'
const vapor = mode === 'vapor'

const runsOverride = process.env.BENCH_RUNS
  ? parseInt(process.env.BENCH_RUNS, 10)
  : 0
const caseFilter = process.env.BENCH_CASE || ''
const nFilter = process.env.BENCH_N || ''
// `pnpm bench --dry` sets BENCH_SAVE=0 so quick sanity runs (e.g. with
// `--runs=3`) don't overwrite the persisted results.
const save = process.env.BENCH_SAVE !== '0'

function readJSON(path: string) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'))
  } catch {
    return {}
  }
}

function pkgVersion(pkg: string): string | null {
  try {
    return JSON.parse(
      fs.readFileSync(
        resolve(__dirname, 'node_modules', pkg, 'package.json'),
        'utf8'
      )
    ).version
  } catch {
    return null
  }
}

function osName(): string {
  if (process.platform === 'darwin') {
    try {
      return `macOS ${execSync('sw_vers -productVersion').toString().trim()}`
    } catch {}
  }
  return `${os.type()} ${os.release()}`
}

/**
 * The machine and version facts stored as `environment` in results.json. The
 * browser version comes from the page's user agent (emitted by the
 * `environment` test); everything else is resolved here in node. `vue` is read
 * from the aliased `vue-vapor` package — the runtime actually measured.
 */
function benchEnvironment(userAgent: string) {
  const browser = userAgent.match(/(?:HeadlessChrome|Chrome)\/([\d.]+)/)

  return {
    cpu: os.cpus()[0]?.model ?? 'unknown',
    arch: os.arch(),
    ramBytes: os.totalmem(),
    os: osName(),
    browser: browser ? `Chromium ${browser[1]}` : userAgent,
    headless: !process.env.BENCH_HEADED,
    vue: pkgVersion('vue-vapor'),
    vueform: pkgVersion('@vueform/ui'),
  }
}

export default defineConfig({
  plugins: [
    Vue({
      compiler: VaporCompiler as unknown as Options['compiler'],
      features: { vapor },
    }),
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
    'import.meta.env.VITE_BENCH_RUNS': JSON.stringify(runsOverride),
    'import.meta.env.VITE_BENCH_CASE': JSON.stringify(caseFilter),
    'import.meta.env.VITE_BENCH_N': JSON.stringify(nFilter),
    __BENCH_VAPOR__: vapor,
    __DEV__: false,
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
  resolve: {
    alias: [
      ...(vapor
        ? [
            {
              // Rewrite every `@vueform/ui/...` import to its vapor twin —
              // except stylesheet imports (`@vueform/ui/form.css` in the
              // styled dist), which only exist on the root entry.
              find: /^@vueform\/ui(?!.*\.(?:css|scss)$)(?=\/|$)/,
              replacement: '@vueform/ui/vapor',
            },
          ]
        : []),
      {
        find: /^vue$/,
        replacement: resolve(
          __dirname,
          'node_modules/vue-vapor/dist/vue.runtime-with-vapor.esm-browser.prod.js'
        ),
      },
    ],
  },
  test: {
    include: ['bench/run.test.ts'],
    testTimeout: 300000,
    onConsoleLog(log) {
      if (log.startsWith('@@BENCH_ENV@@ ')) {
        if (!save) return false

        const { userAgent } = JSON.parse(log.slice('@@BENCH_ENV@@ '.length))
        const results = readJSON(resultsPath)

        results.environment = {
          ...benchEnvironment(userAgent),
          timestamp: Math.floor(Date.now() / 1000),
        }

        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2) + '\n')

        return false
      }

      if (log.startsWith('@@BENCH_JSON@@ ')) {
        if (!save) return false

        const json = log.slice('@@BENCH_JSON@@ '.length)
        const entry = JSON.parse(json)
        const timestamp = Math.floor(Date.now() / 1000)

        const {
          case: caseName,
          label,
          description,
          mode: entryMode,
          n,
          ...stats
        } = entry

        const results = readJSON(resultsPath)

        if (!results[caseName]) {
          results[caseName] = { label, description, results: {} }
        }

        results[caseName].label = label
        results[caseName].description = description

        const caseResults = results[caseName].results
        if (!caseResults[entryMode]) caseResults[entryMode] = {}
        caseResults[entryMode][String(n)] = { ...stats, timestamp }

        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2) + '\n')

        return false
      }

      if (log.startsWith('@@BENCH@@')) {
        process.stdout.write(log.slice('@@BENCH@@'.length) + '\n')
        return false
      }
    },
    browser: {
      enabled: true,
      // Headless by default: every sweep point launches its own browser, and a
      // headed Chromium steals focus on each launch. Headless runs the same
      // renderer on a virtual display (rAF still ticks at 60 Hz). Set
      // BENCH_HEADED=1 to watch a run.
      headless: !process.env.BENCH_HEADED,
      provider: playwright({
        launchOptions: {
          args: [
            '--js-flags=--expose-gc',
            '--enable-precise-memory-info',
            '--force-dark-mode',
          ],
        },
        contextOptions: {
          colorScheme: 'dark',
        },
      }),
      instances: [{ browser: 'chromium' }],
    },
    setupFiles: ['./bench/setup.ts'],
  },
})
