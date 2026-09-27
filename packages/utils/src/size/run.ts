import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { findWorkspaceRoot } from '../shared'
import { adapterScenarios } from './adapter'
import { coreScenarios } from './core'
import { measureDir } from './measure'
import { pluginScenarios } from './plugin'
import { injectReport } from './report'
import type {
  MeasurementType,
  Results,
  Scenario,
  SizeConfig,
} from './types'
import type { Plugin } from 'vite'

export interface RunSizeOptions {
  /**
   * The measured package's directory (the invoking package's cwd).
   */
  packageDir: string
  /**
   * Rerun only the matching scenarios (by name, component, item or plugin),
   * merging into the previous results.
   */
  only?: string[]
  /**
   * Also emit rollup-visualizer treemaps (kept under the package's
   * `node_modules/.cache/vf-size/stats/`).
   */
  stats?: boolean
  /**
   * Print the suite's scenarios without building.
   */
  list?: boolean
  /**
   * Only regenerate the README's size section from the existing `size.json`,
   * without building anything.
   */
  report?: boolean
}

interface Manifest {
  name: string
  version?: string
  vueform?: {
    group?: string
    size?: SizeConfig
  }
}

function readManifest(dir: string): Manifest {
  return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
}

/**
 * The measurement type a package's manifest implies.
 */
function measurementType(manifest: Manifest): MeasurementType {
  const group = manifest.vueform?.group
  if (group === 'adapters') return 'adapter'
  if (group === 'plugins') return 'plugin'
  if (manifest.name === '@vueform/core') return 'core'
  throw new Error(
    `${manifest.name} has no size suite — only @vueform/core, adapters and plugins are measured.`
  )
}

/**
 * The same App.vue is used by every scenario, including the Vueform-free
 * baseline, so only the generated main.ts may pull in Vueform (or PrimeVue).
 */
const FIXTURE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vueform Bundle Size Fixture</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`

const FIXTURE_APP = `<script setup lang="ts">
// No @vueform/* or third-party imports here: the same App.vue is used by
// every scenario, including the Vueform-free baseline, so only the generated
// main.ts may pull them in.
const schema = {
  text: {
    type: 'text',
    label: 'Hello World',
  },
}
</script>

<template>
  <div>
    <VfForm :schema />
  </div>
</template>
`

/**
 * Fails the build when the same package is bundled from two different pnpm
 * instances (e.g. `primevue@4.5.5(vue@3.5.42)` and `primevue@4.5.5(vue@3.5.35)`
 * after a partial dependency update). Duplicates silently inflate every
 * scenario that pulls the package in, skewing all deltas measured against it.
 */
function duplicateGuard(scenarioName: string): Plugin {
  const instances = new Map<string, Set<string>>()

  return {
    name: 'vf-size:duplicate-guard',
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

/**
 * Measures the invoking package's bundle-size suite: generates a transient
 * fixture app under the package's node_modules cache (removed after the run),
 * builds every scenario with Vite, and writes the raw results to `size.json`
 * plus — for adapters and plugins — the markdown report into the README's
 * size section. Adapter reports embed the core package's building-block
 * numbers from its committed `size.json`.
 */
export async function runSize(options: RunSizeOptions): Promise<void> {
  const pkgDir = resolve(options.packageDir)
  const manifest = readManifest(pkgDir)
  const type = measurementType(manifest)
  const config = manifest.vueform?.size ?? {}
  const root = findWorkspaceRoot(pkgDir)
  const coreDir = resolve(root, 'packages/core')
  const uiDir = resolve(root, 'packages/ui')

  // Committed results live directly in the package; the fixture is scratch —
  // it only has to sit inside the package so its imports resolve against the
  // package's node_modules, so it is generated into the node_modules cache
  // and removed after the run.
  const resultsFile = resolve(pkgDir, 'size.json')
  const cacheDir = resolve(pkgDir, 'node_modules/.cache/vf-size')
  const fixtureDir = resolve(cacheDir, 'fixture')

  /**
   * Injects the report rendered from `results` into the package's README,
   * embedding the core package's committed building blocks for adapters.
   */
  function writeReadme(results: Results): string {
    const sharedFile = resolve(coreDir, 'size.json')
    const shared: Results | undefined =
      type === 'adapter' && existsSync(sharedFile)
        ? JSON.parse(readFileSync(sharedFile, 'utf8'))
        : undefined

    if (type === 'adapter' && !shared) {
      console.warn(
        'packages/core/size.json is missing — the report will lack the module/rule/locale tables. Run `pnpm size` in packages/core first.'
      )
    }

    const readmeFile = resolve(pkgDir, 'README.md')
    injectReport(readmeFile, results, shared)
    return readmeFile
  }

  if (options.report) {
    // Core has no markdown report — its results.json is embedded into the
    // adapter reports.
    if (type === 'core') {
      throw new Error(
        `${manifest.name} has no markdown report — its results.json is embedded into the adapter reports.`
      )
    }
    if (!existsSync(resultsFile)) {
      throw new Error(`${resultsFile} is missing — run \`pnpm size\` first.`)
    }
    const readme = writeReadme(JSON.parse(readFileSync(resultsFile, 'utf8')))
    console.log(`- ${readme}`)
    return
  }

  const scenarios: Scenario[] =
    type === 'core'
      ? coreScenarios(pkgDir, manifest.name)
      : type === 'adapter'
        ? adapterScenarios(pkgDir, manifest.name, config)
        : pluginScenarios(manifest.name, config, {
            dir: uiDir,
            pkg: '@vueform/ui',
            config: readManifest(uiDir).vueform?.size ?? {},
          })

  // Sizes are measured against the built dist artifacts.
  const needed = [
    pkgDir,
    ...(type !== 'core' ? [coreDir] : []),
    ...(type === 'plugin' ? [uiDir] : []),
  ]
  for (const dir of needed) {
    if (!existsSync(resolve(dir, 'dist/index.mjs'))) {
      throw new Error(
        `${readManifest(dir).name} has no dist — run its build (or \`pnpm build\` at the monorepo root) first: bundle sizes are measured against the built dist artifacts.`
      )
    }
  }

  if (options.list) {
    for (const scenario of scenarios) {
      console.log(`${scenario.name.padEnd(36)} ${scenario.description}`)
    }
    return
  }

  // The adapter report embeds the core building blocks from the core
  // package's size.json (gitignored) — measure core first when it is missing.
  if (type === 'adapter' && !existsSync(resolve(coreDir, 'size.json'))) {
    console.log('packages/core/size.json is missing — measuring core first.\n')
    await runSize({ packageDir: coreDir })
    console.log('')
  }

  let selected = scenarios
  const filters = options.only?.map((f) => f.trim()).filter(Boolean)

  if (filters?.length) {
    const matched = scenarios.filter((scenario) =>
      filters.some(
        (filter) =>
          scenario.name === filter ||
          scenario.component === filter ||
          scenario.item === filter ||
          scenario.plugin === filter
      )
    )
    // A scenario's delta needs its third-party-only counterpart and its delta
    // base (e.g. `core` for the model module) too.
    const names = new Set(
      matched.flatMap((s) => [
        s.name,
        ...(s.pv ? [s.pv] : []),
        ...(s.base ? [s.base] : []),
      ])
    )
    selected = scenarios.filter((scenario) => names.has(scenario.name))

    if (!selected.length) {
      console.log('No scenarios match --only, skipping.')
      return
    }
  }

  mkdirSync(resolve(fixtureDir, 'src'), { recursive: true })
  writeFileSync(resolve(fixtureDir, 'index.html'), FIXTURE_HTML)
  writeFileSync(resolve(fixtureDir, 'src/App.vue'), FIXTURE_APP)

  const previous: Results | undefined = existsSync(resultsFile)
    ? JSON.parse(readFileSync(resultsFile, 'utf8'))
    : undefined

  /**
   * A participating package's installed version — the measured package's own
   * manifest for itself, its node_modules (falling back to the workspace
   * root's) for everything else.
   */
  function pkgVersion(name: string): string | undefined {
    if (name === manifest.name) return manifest.version
    for (const base of [pkgDir, root]) {
      const file = resolve(base, 'node_modules', name, 'package.json')
      if (existsSync(file)) {
        return JSON.parse(readFileSync(file, 'utf8')).version as string
      }
    }
    return undefined
  }

  const envDeps = [
    manifest.name,
    ...(type !== 'core' ? ['@vueform/core'] : []),
    ...(type === 'plugin' ? ['@vueform/ui'] : []),
    ...(config.envDeps ?? []),
    ...(config.dep ? [config.dep] : []),
    'vue',
    'vite',
  ]

  const results: Results = {
    pkg: manifest.name,
    type,
    generatedAt: new Date().toISOString(),
    environment: {
      node: process.version,
      // "pnpm/10.0.0 npm/? node/v22.14.0 darwin arm64" → "pnpm@10.0.0"
      packageManager: process.env.npm_config_user_agent
        ?.split(' ')[0]
        ?.replace('/', '@'),
      packages: Object.fromEntries(
        envDeps.flatMap((name) => {
          const version = pkgVersion(name)
          return version ? [[name, version]] : []
        })
      ),
    },
    // Partial runs (--only) merge into previous results instead of dropping
    // them.
    scenarios: filters?.length && previous ? { ...previous.scenarios } : {},
  }

  // The Vite Node API and the plugins are ESM-only; this module compiles to
  // CJS, so they are pulled in dynamically.
  const { build } = await import('vite')
  const { default: vue } = await import('@vitejs/plugin-vue')
  const visualizer = options.stats
    ? (await import('rollup-plugin-visualizer')).visualizer
    : undefined

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
        ...(visualizer
          ? [
              visualizer({
                open: false,
                gzipSize: true,
                brotliSize: true,
                filename: resolve(cacheDir, 'stats', `${scenario.name}.html`),
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

  const started = Date.now()

  try {
    for (const [index, scenario] of selected.entries()) {
      process.stdout.write(
        `[${index + 1}/${selected.length}] ${scenario.name} ... `
      )

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
  } finally {
    // The fixture is scratch either way; only the stats treemaps (when
    // requested) stay in the cache for inspection.
    rmSync(options.stats ? fixtureDir : cacheDir, {
      recursive: true,
      force: true,
    })
  }

  mkdirSync(dirname(resultsFile), { recursive: true })
  writeFileSync(resultsFile, JSON.stringify(results, null, 2) + '\n')

  const written = [resultsFile]

  // Core has no report of its own — its building blocks are embedded into
  // every adapter report from its committed size.json.
  if (type !== 'core') {
    written.push(writeReadme(results))
  }

  if (options.stats) {
    written.push(resolve(cacheDir, 'stats'))
  }

  console.log(
    `\nDone in ${((Date.now() - started) / 1000).toFixed(1)}s.\n${written
      .map((file) => `- ${file}`)
      .join('\n')}`
  )
}
