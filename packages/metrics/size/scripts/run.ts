/**
 * Measures bundle sizes for core, the adapters and the plugins, writing one
 * json per suite under results/json and regenerating every size md report.
 *
 * Flags:
 *
 * - `--core` / `--ui` / `--primevue` / `--plugins` rerun only the named suites
 *   (default: all); all md reports are regenerated either way
 * - `--only=a,b` rerun only the matching scenarios of the selected suites,
 *   merging into the previous results
 * - `--stats` also emit rollup-visualizer treemaps under .stats/
 * - `--list` print the selected suites' scenarios without building
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { parseArgs } from 'node:util'

import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import { build, type Plugin } from 'vite'

import { jsonDir, monorepoRoot, pkgRoot } from '../../lib/paths'
import { measureDir } from '../lib/measure'
import { coreScenarios } from '../suites/core'
import { pluginsPackages, pluginsScenarios } from '../suites/plugins'
import { primevueScenarios } from '../suites/primevue'
import { uiScenarios } from '../suites/ui'
import { writeAllReports } from './report'
import type { Results, Scenario } from '../lib/types'

interface Suite {
  scenarios: (root: string) => Scenario[]
  /**
   * Package directories (under packages/) whose dist artifacts are needed.
   */
  packages: string[]
  /**
   * Packages whose versions are recorded as the measurement environment.
   */
  deps: string[]
}

const TOOLING = ['vue', 'vite']

const suites: Record<string, Suite> = {
  // Adapter-independent building blocks (modules, rules, locales), measured
  // once against @vueform/core — the numbers apply to every adapter.
  core: {
    scenarios: coreScenarios,
    packages: ['core'],
    deps: ['@vueform/core', ...TOOLING],
  },
  ui: {
    scenarios: uiScenarios,
    packages: ['ui'],
    deps: ['@vueform/ui', '@vueform/core', ...TOOLING],
  },
  primevue: {
    scenarios: primevueScenarios,
    packages: ['primevue'],
    deps: [
      '@vueform/primevue',
      '@vueform/core',
      'primevue',
      '@primeuix/themes',
      'primeicons',
      ...TOOLING,
    ],
  },
  plugins: {
    scenarios: pluginsScenarios,
    packages: pluginsPackages,
    deps: [
      '@vueform/ui',
      '@vueform/core',
      '@vueform/dompurify',
      '@vueform/expr-eval',
      'isomorphic-dompurify',
      'expr-eval-fork',
      ...TOOLING,
    ],
  },
}

const { values } = parseArgs({
  options: {
    core: { type: 'boolean', default: false },
    ui: { type: 'boolean', default: false },
    primevue: { type: 'boolean', default: false },
    plugins: { type: 'boolean', default: false },
    only: { type: 'string' },
    stats: { type: 'boolean', default: false },
    list: { type: 'boolean', default: false },
  },
})

const selectedNames = Object.keys(suites).filter(
  (name) => values[name as 'core' | 'ui' | 'primevue' | 'plugins']
)
const suiteNames = selectedNames.length ? selectedNames : Object.keys(suites)

const neededPackages = new Set(
  suiteNames.flatMap((name) => suites[name].packages)
)

for (const pkg of neededPackages) {
  if (!existsSync(resolve(monorepoRoot, `packages/${pkg}/dist/index.mjs`))) {
    console.error(
      `packages/${pkg}/dist is missing. Run \`pnpm build\` at the monorepo root first — bundle sizes are measured against the built dist artifacts.`
    )
    process.exit(1)
  }
}

if (values.list) {
  for (const name of suiteNames) {
    for (const scenario of suites[name].scenarios(monorepoRoot)) {
      console.log(
        `${name.padEnd(10)} ${scenario.name.padEnd(36)} ${scenario.description}`
      )
    }
  }
  process.exit(0)
}

const filters = values.only
  ?.split(',')
  .map((filter) => filter.trim())
  .filter(Boolean)

function pkgVersion(name: string): string | undefined {
  const file = resolve(pkgRoot, 'node_modules', name, 'package.json')
  return existsSync(file)
    ? (JSON.parse(readFileSync(file, 'utf8')).version as string)
    : undefined
}

/**
 * Fails the build when the same package is bundled from two different pnpm
 * instances (e.g. `primevue@4.5.5(vue@3.5.42)` and `primevue@4.5.5(vue@3.5.35)`
 * after a partial dependency update). Duplicates silently inflate every
 * scenario that pulls the package in, skewing all deltas measured against it.
 */
function duplicateGuard(scenarioName: string): Plugin {
  const instances = new Map<string, Set<string>>()

  return {
    name: 'metrics:duplicate-guard',
    moduleParsed({ id }) {
      // Only store-installed packages can be duplicated; workspace packages
      // are linked from a single location.
      const instance = id.match(/\/node_modules\/\.pnpm\/([^/]+)\//)?.[1]
      if (!instance) return

      const segments = id.split('/node_modules/')
      const tail = segments[segments.length - 1]
      const name = tail.startsWith('@')
        ? tail.split('/').slice(0, 2).join('/')
        : tail.split('/')[0]

      let set = instances.get(name)
      if (!set) instances.set(name, (set = new Set()))
      set.add(instance)
    },
    buildEnd() {
      const duplicates = [...instances].filter(([, set]) => set.size > 1)
      if (duplicates.length) {
        throw new Error(
          `Scenario "${scenarioName}" bundles multiple instances of the same package — the measured sizes would be skewed. Run \`pnpm bump\` (or \`pnpm dedupe\`) at the monorepo root to converge versions:\n${duplicates
            .map(([name, set]) => `  ${name}: ${[...set].join(' | ')}`)
            .join('\n')}`
        )
      }
    },
  }
}

async function runSuite(suiteName: string) {
  const suite = suites[suiteName]
  const scenarios = suite.scenarios(monorepoRoot)

  let selected = scenarios

  if (filters) {
    const matched = scenarios.filter((scenario) =>
      filters.some(
        (filter) =>
          scenario.name === filter ||
          scenario.component === filter ||
          scenario.item === filter ||
          scenario.plugin === filter
      )
    )
    // A scenario's delta needs its PrimeVue-only counterpart and its delta
    // base (e.g. `no-modules` for the model module) too.
    const names = new Set(
      matched.flatMap((s) => [
        s.name,
        ...(s.pv ? [s.pv] : []),
        ...(s.base ? [s.base] : []),
      ])
    )
    selected = scenarios.filter((scenario) => names.has(scenario.name))

    if (!selected.length) {
      console.log(`▸ ${suiteName}: no scenarios match --only, skipping.`)
      return
    }
  }

  const fixtureDir = resolve(pkgRoot, 'size/fixtures', suiteName)
  const resultsFile = resolve(jsonDir, `${suiteName}.json`)

  const previous: Results | undefined = existsSync(resultsFile)
    ? JSON.parse(readFileSync(resultsFile, 'utf8'))
    : undefined

  const results: Results = {
    adapter: suiteName,
    generatedAt: new Date().toISOString(),
    environment: {
      node: process.version,
      // "pnpm/10.0.0 npm/? node/v22.14.0 darwin arm64" → "pnpm@10.0.0"
      packageManager: process.env.npm_config_user_agent
        ?.split(' ')[0]
        ?.replace('/', '@'),
      packages: Object.fromEntries(
        suite.deps.flatMap((name) => {
          const version = pkgVersion(name)
          return version ? [[name, version]] : []
        })
      ),
    },
    // Partial runs (--only) merge into previous results instead of dropping them.
    scenarios: filters && previous ? { ...previous.scenarios } : {},
  }

  async function buildScenario(scenario: Scenario) {
    writeFileSync(resolve(fixtureDir, 'src/main.ts'), scenario.entry)

    const outDir = resolve(fixtureDir, 'dist', scenario.name)
    rmSync(outDir, { recursive: true, force: true })

    await build({
      configFile: false,
      root: fixtureDir,
      logLevel: 'error',
      plugins: [
        vue(),
        duplicateGuard(scenario.name),
        ...(values.stats
          ? [
              visualizer({
                open: false,
                gzipSize: true,
                brotliSize: true,
                filename: resolve(
                  pkgRoot,
                  '.stats',
                  suiteName,
                  `${scenario.name}.html`
                ),
              }),
            ]
          : []),
      ],
      build: {
        outDir,
        emptyOutDir: true,
        reportCompressedSize: false,
      },
    })
  }

  for (const [index, scenario] of selected.entries()) {
    const label = `[${suiteName} ${index + 1}/${selected.length}] ${scenario.name}`
    process.stdout.write(`${label} ... `)

    const scenarioStart = Date.now()
    await buildScenario(scenario)
    const measured = measureDir(resolve(fixtureDir, 'dist', scenario.name))

    results.scenarios[scenario.name] = {
      group: scenario.group,
      component: scenario.component,
      item: scenario.item,
      base: scenario.base,
      plugin: scenario.plugin,
      dep: scenario.dep,
      pv: scenario.pv,
      description: scenario.description,
      themed: scenario.themed,
      ...measured,
    }

    const gzipKb = (measured.total.gzip / 1024).toFixed(2)
    console.log(
      `${gzipKb} kB gzip (${((Date.now() - scenarioStart) / 1000).toFixed(1)}s)`
    )
  }

  mkdirSync(dirname(resultsFile), { recursive: true })
  writeFileSync(resultsFile, JSON.stringify(results, null, 2) + '\n')
  console.log(`▸ ${suiteName}: ${resultsFile}`)
}

const started = Date.now()

for (const suiteName of suiteNames) {
  await runSuite(suiteName)
}

// Every report embeds shared numbers (the core building blocks), so all md
// files are regenerated regardless of which suites ran.
const reportFiles = writeAllReports()

console.log(
  `\nDone in ${((Date.now() - started) / 1000).toFixed(1)}s.\n${reportFiles
    .map((file) => `- ${file}`)
    .join('\n')}`
)
