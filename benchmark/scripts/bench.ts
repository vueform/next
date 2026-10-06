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
// Vueform brand green (#17c495), as 24-bit truecolor (matches scripts/runner.ts).
const green = (text: string) => paint('38;2;23;196;149', text)
const red = (text: string) => paint('31', text)
const dim = (text: string) => paint('2', text)

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const BAR_WIDTH = 22

/**
 * Sticky one-line progress renderer (TTY only): the whole run lives on a single
 * rewritten line — prep phases spin with the phase name, the sweep fills the
 * bar with completed points and names the one being measured, and the run
 * closes with a ✓/✗ line. Everything else stays off the terminal: child output
 * is captured (see lib.ts `run`) and only a failure dumps it, after the bar has
 * closed. Non-TTY logs plain sequential lines instead.
 */
class BenchProgress {
  private phaseLabel = 'start'
  private sweeping = false
  private done = 0
  private points = 0
  private current = ''
  private tick = 0
  private started = Date.now()
  private timer: NodeJS.Timeout | undefined
  private finished = false

  constructor() {
    if (!isTTY) return
    process.stdout.write(`${this.line()}\n`)
    this.timer = setInterval(() => this.redraw(), 100)
  }

  private elapsed() {
    return `${((Date.now() - this.started) / 1000).toFixed(1)}s`
  }

  private line() {
    const ratio = this.sweeping && this.points ? this.done / this.points : 0
    const filled = Math.round(ratio * BAR_WIDTH)
    const bar = green('█'.repeat(filled)) + dim('░'.repeat(BAR_WIDTH - filled))
    const spinner = green(SPINNER[this.tick % SPINNER.length])
    const status = this.sweeping
      ? `${this.done}/${this.points}${this.current ? dim(` · ${this.current}`) : ''}`
      : dim(this.phaseLabel)
    return `${spinner} bench ${bar} ${status} ${dim(this.elapsed())}`
  }

  private redraw() {
    this.tick++
    process.stdout.write(`\x1b[1A\x1b[2K\r${this.line()}\n`)
  }

  phase(label: string) {
    this.phaseLabel = label
    if (isTTY) this.redraw()
    else console.log(`[bench] ${label}`)
  }

  /**
   * Switches from phases to the sweep: the bar now fills with completed points.
   */
  sweep(points: number) {
    this.sweeping = true
    this.points = points
  }

  measuring(label: string) {
    this.current = label
    if (isTTY) this.redraw()
  }

  /**
   * TTY: the bar's count advances; non-TTY logs the point's result line.
   */
  result(line: string) {
    this.done++
    this.current = ''
    if (isTTY) this.redraw()
    else console.log(line)
  }

  /**
   * Replaces the bar with its ✓/✗ done line. Idempotent, so the error path can
   * close an already-closed bar without harm.
   */
  finish(ok: boolean) {
    if (this.finished) return
    this.finished = true
    if (this.timer) clearInterval(this.timer)
    if (!isTTY) return
    const mark = ok ? green('✓') : red('✗')
    const counts = this.sweeping ? ` ${this.done}/${this.points}` : ''
    process.stdout.write(
      `\x1b[1A\x1b[2K\r${mark} bench${counts} ${dim(this.elapsed())}\n`
    )
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

  const progress = new BenchProgress()

  try {
    if (options.pack) {
      progress.phase('pack dist tarballs')
      pack()
      progress.phase('install app (pnpm install --ignore-workspace)')
      installApp()
    }

    if (options.build) {
      for (const mode of options.modes) {
        progress.phase(`build app (${mode})`)
        buildApp(mode)
      }
    }

    for (const mode of options.modes) {
      if (!fs.existsSync(path.join(APP_DIR, 'dist', mode, 'index.html'))) {
        throw new Error(
          `app dist/${mode} is missing — rerun without --no-build`
        )
      }
    }

    progress.phase('launch browser')
    const server = await serve(path.join(APP_DIR, 'dist'))
    const browser = await chromium.launch({ headless: true })

    try {
      await runSweep(options, progress, server.origin, browser)
    } finally {
      await browser.close()
      await server.close()
    }
  } finally {
    // On failure the bar is still up — close it with ✗ so the error (with any
    // captured child output) prints below it; a no-op after a ✓ close.
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
  let done = 0

  progress.sweep(points)

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
        progress.measuring(`${benchCase.id} ${mode} n=${n}`)
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
  }

  results.environment = environment

  fs.mkdirSync(path.dirname(RESULTS_JSON), { recursive: true })
  fs.writeFileSync(RESULTS_JSON, JSON.stringify(results, null, 2) + '\n')

  progress.finish(true)
  console.log(
    `[bench] ${points} sweep points — vue ${environment.vue}, ` +
      `vueform ${environment.vueform}, ${environment.browser}`
  )
  console.log(`[bench] results → ${path.relative(process.cwd(), RESULTS_JSON)}`)

  if (options.charts) {
    const charts = generateCharts(
      results as Parameters<typeof generateCharts>[0]
    )
    console.log(`[bench] ${charts.length} charts regenerated`)
  }
}

main().catch((error) => {
  console.error(`[bench] ${error instanceof Error ? error.message : error}`)
  process.exit(1)
})
