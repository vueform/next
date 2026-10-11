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
import { execFileSync } from 'node:child_process'
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
  buildApp,
  checkAppVueVersion,
  checkDistBuilt,
  installApp,
  pack,
} from './lib'
import { measurePoint, type Sample } from './measure'
import { serve } from './serve'

const isTTY = process.stdout.isTTY === true
const paint = (code: string, text: string) =>
  isTTY ? `\x1b[${code}m${text}\x1b[0m` : text
const green = (text: string) => paint('32', text)
const red = (text: string) => paint('31', text)
const dim = (text: string) => paint('2', text)

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

/**
 * Row-based progress renderer in the style of the root api/docs runners: one
 * row per prep step and per case, stacked under a heading — spinner and
 * elapsed (plus the case's point counter) while working, ✓/✗ when done.
 * Cases run SEQUENTIALLY on purpose: timings and heap deltas are only
 * meaningful without CPU contention, so the rows advance one at a time.
 * Child output stays captured (see lib.ts `run`) and only surfaces on
 * failure. Non-TTY logs plain lines instead.
 */
interface RowState {
  label: string
  status: 'pending' | 'running' | 'pass' | 'fail'
  detail: string
  startedAt: number
  /**
   * Sweep rows: completed / total points within the case.
   */
  done?: number
  points?: number
  current?: string
}

class BenchProgress {
  private rows: RowState[] = []
  private byId = new Map<string, RowState>()
  private tick = 0
  private printedLines = 0
  private timer: NodeJS.Timeout | undefined
  private active: RowState | undefined

  constructor(rowDefs: { id: string; label: string }[]) {
    for (const { id, label } of rowDefs) {
      const row: RowState = {
        label,
        status: 'pending',
        detail: '',
        startedAt: 0,
      }
      this.rows.push(row)
      this.byId.set(id, row)
    }
    if (!isTTY) return
    process.stdout.write('\x1b[?25l')
    this.repaint()
    this.timer = setInterval(() => {
      this.tick++
      this.repaint()
    }, 100)
  }

  private elapsed(row: RowState) {
    return `${((Date.now() - row.startedAt) / 1000).toFixed(1)}s`
  }

  private rowText(row: RowState, spin: string, width: number) {
    const mark =
      row.status === 'running'
        ? paint('36', spin)
        : row.status === 'pass'
          ? green('✓')
          : row.status === 'fail'
            ? red('✗')
            : dim('·')
    const sweep =
      row.points !== undefined
        ? `${row.done}/${row.points}${row.current ? dim(` · ${row.current}`) : ''} `
        : ''
    const detail =
      row.status === 'running'
        ? `${sweep}${dim(this.elapsed(row))}`
        : row.status === 'pass'
          ? green(row.detail)
          : row.status === 'fail'
            ? red(row.detail)
            : dim('waiting')
    return `  ${mark} ${row.label.padEnd(width)}${detail}`
  }

  private repaint() {
    const width = Math.max(...this.rows.map((r) => r.label.length)) + 2
    const spin = SPINNER[this.tick % SPINNER.length]
    const lines = [
      paint('1', 'Benchmark'),
      ...this.rows.map((row) => this.rowText(row, spin, width)),
    ]
    let out = ''
    if (this.printedLines > 0) out += `\x1b[${this.printedLines}A`
    for (const line of lines) out += `\x1b[2K${line}\n`
    process.stdout.write(out)
    this.printedLines = lines.length
  }

  start(id: string, points?: number) {
    const row = this.byId.get(id)
    if (!row) return
    this.active = row
    row.status = 'running'
    row.startedAt = Date.now()
    if (points !== undefined) {
      row.done = 0
      row.points = points
    }
    if (isTTY) this.repaint()
    else console.log(`[bench] ${row.label}`)
  }

  measuring(label: string) {
    if (this.active) this.active.current = label
    if (isTTY) this.repaint()
  }

  /**
   * TTY: the active row's counter advances; non-TTY logs the result line.
   */
  result(line: string) {
    if (this.active && this.active.done !== undefined) {
      this.active.done++
      this.active.current = ''
    }
    if (isTTY) this.repaint()
    else console.log(line)
  }

  end(id: string, ok = true, detail?: string) {
    const row = this.byId.get(id)
    if (!row) return
    row.status = ok ? 'pass' : 'fail'
    row.detail = detail ?? (ok ? `done in ${this.elapsed(row)}` : 'failed')
    if (isTTY) this.repaint()
    else if (!ok) console.log(`[bench] ${row.label}: ${row.detail}`)
  }

  /**
   * Marks whatever is still running as failed and closes the display so the
   * error prints below the rows. Idempotent.
   */
  finish(ok: boolean) {
    if (this.timer) clearInterval(this.timer)
    this.timer = undefined
    if (!ok) {
      for (const row of this.rows) {
        if (row.status === 'running') {
          row.status = 'fail'
          row.detail = 'failed'
        }
      }
    }
    if (isTTY) {
      this.repaint()
      process.stdout.write('\x1b[?25h')
    }
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
  const progress = new BenchProgress(rowDefs)

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
