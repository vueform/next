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
 * - `--mode=vdom|vapor` — only this rendering mode
 * - `--n=100,250` — only these sweep points
 * - `--reps=5` — repetitions per point
 * - `--warmup=10` / `--iterations=50` — in-page iteration counts
 * - `--no-pack` / `--no-build` — reuse existing tarballs / app builds
 * - `--no-charts` — skip chart regeneration
 *
 * Partial runs merge into the existing results file, so a single case can be
 * refreshed without rerunning the suite.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { chromium } from 'playwright'

import { CASES, MODES, SWEEP, type Mode } from './cases'
import { generateCharts } from './charts'
import { captureEnvironment } from './env'
import {
  APP_DIR,
  BENCH_DIR,
  RESULTS_JSON,
  ROOT,
  buildApp,
  checkAppVueVersion,
  checkDistBuilt,
  installApp,
  pack,
} from './lib'
import { measurePoint, type Sample } from './measure'
import { serve } from './serve'

// The shared display lives in @vueform/utils' DIST — absent on a fresh
// checkout. Warm it (vp-cached, instant on a warm hit) before the dynamic
// import below.
const bootstrap = spawnSync('pnpm', ['exec', 'vpr', ':build:utils'], {
  cwd: ROOT,
  encoding: 'utf8',
})
if (bootstrap.status !== 0) {
  console.error(bootstrap.stdout + bootstrap.stderr)
  process.exit(bootstrap.status ?? 1)
}

// `parseArgs` rejects unknown flags, so the display never reads argv here —
// liveness comes from the TTY alone.
const terminal = await import('@vueform/utils/terminal')
const mode = terminal.resolveTerminalMode({ argv: [] })
const { green, dim } = terminal.createPaint(mode.colors)

/**
 * Row-based progress over the shared rows display: one row per prep step and
 * per case, stacked under a heading — spinner and elapsed (plus the case's
 * point counter) while working, ✓/✗ when done. Cases run SEQUENTIALLY on
 * purpose: timings and heap deltas are only meaningful without CPU
 * contention, so the rows advance one at a time. Child output stays captured
 * (see lib.ts `run`) and only surfaces on failure. Non-TTY keeps the plain
 * `[bench]` lines (the display's own plain mode is off).
 */
interface BenchProgress {
  start(id: string, points?: number): void
  measuring(label: string): void
  /**
   * TTY: the active row's counter advances; non-TTY logs the result line.
   */
  result(line: string): void
  end(id: string, ok?: boolean, detail?: string): void
  /**
   * Marks whatever is still running as failed and closes the display so the
   * error prints below the rows. Idempotent.
   */
  finish(ok: boolean): void
}

function createBenchProgress(
  rowDefs: { id: string; label: string }[]
): BenchProgress {
  const labels = new Map(rowDefs.map(({ id, label }) => [id, label]))
  const rows = terminal.createRows({
    title: 'Benchmark',
    rows: rowDefs.map(({ id, label }) => ({ id, label, detail: 'waiting' })),
    mode,
    plain: 'none',
  })

  // Sweep state of the active case: completed / total points, current point.
  let active: string | undefined
  let done = 0
  let points: number | undefined
  let current = ''

  const sweepProgress = () => {
    if (active === undefined || points === undefined) return
    rows.progress(active, `${done}/${points}${current ? ` · ${current}` : ''}`)
  }

  return {
    start(id, sweepPoints?) {
      active = id
      done = 0
      points = sweepPoints
      current = ''
      rows.start(id)
      sweepProgress()
      if (!mode.live) console.log(`[bench] ${labels.get(id) ?? id}`)
    },
    measuring(label) {
      current = label
      sweepProgress()
    },
    result(line) {
      if (points !== undefined) {
        done++
        current = ''
        sweepProgress()
      }
      if (!mode.live) console.log(line)
    },
    end(id, ok = true, detail?) {
      if (ok) rows.pass(id, detail)
      else {
        rows.fail(id, detail ?? 'failed')
        if (!mode.live) {
          console.log(`[bench] ${labels.get(id) ?? id}: ${detail ?? 'failed'}`)
        }
      }
    },
    finish(ok) {
      if (!ok) {
        for (const { id } of rowDefs) {
          if (rows.status(id) === 'active') rows.fail(id, 'failed')
        }
      }
      rows.finish()
    },
  }
}

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

  const rowDefs: { id: string; label: string }[] = [
    ...(options.pack
      ? [
          { id: 'pack', label: 'pack' },
          { id: 'install', label: 'install app' },
        ]
      : []),
    ...(options.build
      ? options.modes.map((mode) => ({
          id: `build:${mode}`,
          label: `build app (${mode})`,
        }))
      : []),
    { id: 'launch', label: 'launch' },
    ...CASES.filter((c) => options.cases.includes(c.id)).map((c) => ({
      id: c.id,
      label: c.id,
    })),
    ...(options.charts ? [{ id: 'charts', label: 'charts' }] : []),
  ]
  const progress = createBenchProgress(rowDefs)

  try {
    if (options.pack) {
      progress.start('pack')
      pack()
      progress.end('pack')
      progress.start('install')
      installApp()
      progress.end('install')
    }

    if (options.build) {
      for (const mode of options.modes) {
        progress.start(`build:${mode}`)
        buildApp(mode)
        progress.end(`build:${mode}`)
      }
    }

    for (const mode of options.modes) {
      if (!fs.existsSync(path.join(APP_DIR, 'dist', mode, 'index.html'))) {
        throw new Error(
          `app dist/${mode} is missing — rerun without --no-build`
        )
      }
    }

    progress.start('launch')
    const server = await serve(path.join(APP_DIR, 'dist'))
    const browser = await chromium.launch({ headless: true })
    progress.end('launch')

    try {
      await runSweep(options, progress, server.origin, browser)
    } finally {
      await browser.close()
      await server.close()
    }

    progress.finish(true)
  } finally {
    // On failure rows are still up — close with the running row marked ✗ so
    // the error (with any captured child output) prints below; a no-op after
    // a successful close.
    progress.finish(false)
  }
}

async function runSweep(
  options: Options,
  progress: BenchProgress,
  origin: string,
  browser: Awaited<ReturnType<typeof chromium.launch>>
): Promise<void> {
  const results = loadResults()
  const environment = captureEnvironment(browser.version())
  const points = options.cases.length * options.modes.length * options.ns.length
  const casePoints = options.modes.length * options.ns.length
  let done = 0

  for (const benchCase of CASES) {
    if (!options.cases.includes(benchCase.id)) continue

    progress.start(benchCase.id, casePoints)

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
        progress.measuring(`${mode} n=${n}`)
        const sample = await measurePoint(
          browser,
          origin,
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
        progress.result(
          `[bench] (${done}/${points}) ${benchCase.id} ${mode} n=${n}: ` +
            `${sample.mean.toFixed(2)} ms${memory}`
        )
      }
    }

    progress.end(benchCase.id)
  }

  results.environment = environment

  fs.mkdirSync(path.dirname(RESULTS_JSON), { recursive: true })
  fs.writeFileSync(RESULTS_JSON, JSON.stringify(results, null, 2) + '\n')

  if (options.charts) {
    progress.start('charts')
    const charts = generateCharts(
      results as Parameters<typeof generateCharts>[0]
    )
    progress.end('charts', true, `${charts.length} regenerated`)
  }

  progress.finish(true)
  console.log(`\n${green(`${points} sweep points measured.`)}`)
  console.log(
    dim(
      `vue ${environment.vue}, vueform ${environment.vueform}, ${environment.browser}`
    )
  )
  console.log(
    `${dim('results:')} ${path.relative(process.cwd(), RESULTS_JSON)}\n`
  )
}

main().catch((error) => {
  console.error(`[bench] ${error instanceof Error ? error.message : error}`)
  process.exit(1)
})
