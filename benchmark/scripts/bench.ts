/**
 * The benchmark suite's entry point (root `pnpm bench`).
 *
 * Flow: verify prerequisites → pack the local dist into the app's tarballs →
 * standalone-install and production-build the app in both rendering modes →
 * serve it statically → sweep every case × mode × N in headless Chromium →
 * merge the samples into results/json/benchmarks.json → regenerate the SVG
 * charts. `pnpm docs:gen -- --benchmark` publishes the results to the docs.
 *
 * Flags (all optional, defaults run the full suite):
 *
 * - `--case=render-text[,update-all]` — only these cases
 * - `--mode=vdom|vapor`               — only this rendering mode
 * - `--n=100,250`                     — only these sweep points
 * - `--reps=5`                        — repetitions per point
 * - `--warmup=10` / `--iterations=50` — in-page iteration counts
 * - `--no-pack` / `--no-build`        — reuse existing tarballs / app builds
 * - `--no-charts`                     — skip chart regeneration
 *
 * Partial runs merge into the existing results file, so a single case can be
 * refreshed without rerunning the suite.
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { chromium } from 'playwright'
import { CASES, MODES, SWEEP, type Mode } from './cases'
import { generateCharts } from './charts'
import { captureEnvironment } from './env'
import {
  APP_DIR,
  BENCH_DIR,
  RESULTS_JSON,
  buildApp,
  checkAppVueVersion,
  checkDistBuilt,
  installApp,
  pack,
} from './lib'
import { measurePoint, type Sample } from './measure'
import { serve } from './serve'

interface Options {
  cases: string[]
  modes: Mode[]
  ns: number[]
  reps?: number
  warmup?: number
  iterations?: number
  pack: boolean
  build: boolean
  charts: boolean
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    cases: CASES.map((c) => c.id),
    modes: [...MODES],
    ns: [...SWEEP],
    pack: true,
    build: true,
    charts: true,
  }

  for (const arg of argv) {
    const [flag, value = ''] = arg.split('=')

    switch (flag) {
      case '--case': {
        const ids = value.split(',').filter(Boolean)
        const unknown = ids.filter((id) => !CASES.some((c) => c.id === id))
        if (unknown.length) {
          throw new Error(
            `unknown case(s) ${unknown.join(', ')} — known: ${CASES.map((c) => c.id).join(', ')}`
          )
        }
        options.cases = ids
        break
      }
      case '--mode':
        if (value !== 'vdom' && value !== 'vapor') {
          throw new Error('--mode must be vdom or vapor')
        }
        options.modes = [value]
        break
      case '--n':
        options.ns = value.split(',').map(Number)
        if (options.ns.some((n) => !Number.isInteger(n) || n < 1)) {
          throw new Error('--n expects positive integers, e.g. --n=100,250')
        }
        break
      case '--reps':
        options.reps = Number(value)
        break
      case '--warmup':
        options.warmup = Number(value)
        break
      case '--iterations':
        options.iterations = Number(value)
        break
      case '--no-pack':
        options.pack = false
        break
      case '--no-build':
        options.build = false
        break
      case '--no-charts':
        options.charts = false
        break
      default:
        throw new Error(`unknown flag ${flag}`)
    }
  }

  return options
}

type Results = Record<string, unknown> & {
  environment?: unknown
}

function loadResults(): Results {
  if (!fs.existsSync(RESULTS_JSON)) return {}
  return JSON.parse(fs.readFileSync(RESULTS_JSON, 'utf8'))
}

function ensureChromium(): void {
  if (fs.existsSync(chromium.executablePath())) return

  console.log('[bench] downloading Chromium (first run only)…')
  execFileSync('pnpm', ['exec', 'playwright', 'install', 'chromium'], {
    cwd: BENCH_DIR,
    stdio: 'inherit',
  })
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))

  checkDistBuilt()
  checkAppVueVersion()
  ensureChromium()

  if (options.pack) {
    pack()
    installApp()
  }

  if (options.build) {
    for (const mode of options.modes) buildApp(mode)
  }

  for (const mode of options.modes) {
    if (!fs.existsSync(path.join(APP_DIR, 'dist', mode, 'index.html'))) {
      throw new Error(`app dist/${mode} is missing — rerun without --no-build`)
    }
  }

  const server = await serve(path.join(APP_DIR, 'dist'))
  const browser = await chromium.launch({ headless: true })

  try {
    const results = loadResults()
    const environment = captureEnvironment(browser.version())
    const points = options.cases.length * options.modes.length * options.ns.length
    let done = 0

    console.log(
      `[bench] ${points} sweep points — vue ${environment.vue}, ` +
        `vueform ${environment.vueform}, ${environment.browser}`
    )

    for (const benchCase of CASES) {
      if (!options.cases.includes(benchCase.id)) continue

      const entry = (results[benchCase.id] ??= {
        label: benchCase.label,
        description: benchCase.description,
        results: {},
      }) as {
        label: string
        description: string
        results: Partial<Record<Mode, Record<string, Sample>>>
      }
      entry.label = benchCase.label
      entry.description = benchCase.description

      for (const mode of options.modes) {
        for (const n of options.ns) {
          const sample = await measurePoint(
            browser,
            server.origin,
            mode,
            benchCase,
            n,
            options
          )

          ;(entry.results[mode] ??= {})[n] = sample
          done++

          const memory = sample.heapAvg
            ? `, heap +${(sample.heapAvg / 1024 ** 2).toFixed(1)} MB`
            : ''
          console.log(
            `[bench] (${done}/${points}) ${benchCase.id} ${mode} n=${n}: ` +
              `${sample.mean.toFixed(2)} ms${memory}`
          )
        }
      }
    }

    results.environment = environment

    fs.mkdirSync(path.dirname(RESULTS_JSON), { recursive: true })
    fs.writeFileSync(RESULTS_JSON, JSON.stringify(results, null, 2) + '\n')
    console.log(`[bench] results → ${path.relative(process.cwd(), RESULTS_JSON)}`)

    if (options.charts) {
      const charts = generateCharts(results as Parameters<typeof generateCharts>[0])
      console.log(`[bench] ${charts.length} charts regenerated`)
    }
  } finally {
    await browser.close()
    await server.close()
  }
}

main().catch((error) => {
  console.error(`[bench] ${error instanceof Error ? error.message : error}`)
  process.exit(1)
})
