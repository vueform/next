import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Publishes the benchmark suite's output to the docs: copies the generated SVG
 * charts into `src/public/charts` and fills the measured numbers of each
 * adapter's performance guide from
 * `packages/metrics/results/json/benchmarks.json`.
 *
 * The page is authored by hand; this script only replaces the values between
 * `<!-- @bench:<key> -->` and `<!-- /@bench -->` markers, written as inline
 * code (backtick-wrapped). The key names a measurement rather than a
 * hand-maintained stat, so the page stays readable and no key table has to be
 * kept in sync:
 *
 * - `<case>.<mode>.<n>.time` — mean time of one run (`242 ms`)
 * - `<case>.<mode>.<n>.per-element` — that mean divided by N (`0.24 ms`)
 * - `<case>.<mode>.<n>.memory` — average heap delta (`69.1 MB`)
 * - `<case>.<mode>.<n>.memory-per-element` — that delta divided by N (`123 KB`)
 * - `<case>.<n>.vapor-ratio` — vapor ÷ vdom (`×0.40`)
 * - `<case>.<n>.vapor-speedup` — vdom ÷ vapor (`2.5×`)
 * - `<caseA>/<caseB>.<mode>.<n>.percent` — A's time as a share of B's (`45%`)
 * - `<caseA>/<caseB>.<mode>.<n>.memory-percent` — the same for heap deltas
 * - `updated` — the date of the newest sample (`2026-09-09`)
 * - `env.<fact>` — the suite's `environment` record: `cpu`, `ram`, `os`,
 *   `browser`, `vue`, `vueform`
 *
 * `<case>` is a case id from `benchmarks.json` (`render-text`, `render-steps`,
 * `input-text`, `input-text-vmodel`, `update-all`), `<mode>` is `vdom` or
 * `vapor`, and `<n>` is one of the case's sweep values. Charts referenced by
 * the page but missing from `packages/metrics/results/charts` are reported.
 *
 * Run `pnpm bench` in `packages/metrics/` to refresh the measurements first —
 * this script never runs them.
 */

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(SCRIPT_DIR, '..', '..')
const ROOT = path.resolve(DOCS_ROOT, '..')
const METRICS_RESULTS = path.join(ROOT, 'packages', 'metrics', 'results')
const RESULTS_JSON = path.join(METRICS_RESULTS, 'json', 'benchmarks.json')
const CHARTS_SRC = path.join(METRICS_RESULTS, 'charts')
const CHARTS_DEST = path.join(DOCS_ROOT, 'src', 'public', 'charts')
const DOCS_CONFIG_JSON = path.join(DOCS_ROOT, 'config.json')

type Mode = 'vdom' | 'vapor'

interface Sample {
  mean: number
  heapAvg?: number
  timestamp?: number
}

interface CaseResult {
  label?: string
  description?: string
  /**
   * mode -> n -> stats
   */
  results: Partial<Record<Mode, Record<string, Sample>>>
}

type Results = Record<string, CaseResult>

// ---------------------------------------------------------------------------
// Values
// ---------------------------------------------------------------------------

function sampleOf(
  results: Results,
  caseId: string,
  mode: Mode,
  n: string
): Sample | undefined {
  return results[caseId]?.results?.[mode]?.[n]
}

/**
 * Milliseconds at a precision that stays readable across three orders.
 */
function ms(value: number): string {
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2
  return `${value.toFixed(digits)} ms`
}

function mb(bytes: number): string {
  const value = bytes / 1024 ** 2
  return `${value.toFixed(value >= 100 ? 0 : 1)} MB`
}

/**
 * Bytes at KB/MB precision for small per-element quantities.
 */
function bytes(value: number): string {
  if (value >= 1024 ** 2) return mb(value)
  const kb = value / 1024
  return `${kb.toFixed(kb >= 10 ? 0 : 1)} KB`
}

/**
 * The value a `@bench:<key>` marker stands for, or undefined when the key names
 * a case, mode, sweep value or metric the results don't have.
 */
function valueOf(results: Results, key: string): string | undefined {
  if (key === 'updated') {
    let latest = 0

    for (const caseResult of Object.values(results)) {
      for (const samples of Object.values(caseResult.results ?? {})) {
        for (const sample of Object.values(samples ?? {})) {
          latest = Math.max(latest, sample.timestamp ?? 0)
        }
      }
    }

    return latest
      ? new Date(latest * 1000).toISOString().slice(0, 10)
      : undefined
  }

  // env.<fact> — the machine/version record captured by the benchmark run
  if (key.startsWith('env.')) {
    const env = (results as { environment?: Record<string, unknown> })
      .environment
    if (!env) return undefined

    switch (key.slice('env.'.length)) {
      case 'cpu':
        return typeof env.cpu === 'string' ? env.cpu : undefined
      case 'ram':
        return typeof env.ramBytes === 'number'
          ? `${Math.round(env.ramBytes / 1024 ** 3)} GB`
          : undefined
      case 'os':
        return typeof env.os === 'string' ? env.os : undefined
      case 'browser':
        return typeof env.browser === 'string' ? env.browser : undefined
      case 'vue':
        return typeof env.vue === 'string' ? env.vue : undefined
      case 'vueform':
        return typeof env.vueform === 'string' ? env.vueform : undefined
      default:
        return undefined
    }
  }

  const parts = key.split('.')

  // <case>.<n>.vapor-ratio | <case>.<n>.vapor-speedup
  if (parts.length === 3 && parts[2].startsWith('vapor-')) {
    const [caseId, n, kind] = parts
    const vdom = sampleOf(results, caseId, 'vdom', n)
    const vapor = sampleOf(results, caseId, 'vapor', n)
    if (!vdom || !vapor) return undefined

    return kind === 'vapor-ratio'
      ? `×${(vapor.mean / vdom.mean).toFixed(2)}`
      : `${(vdom.mean / vapor.mean).toFixed(1)}×`
  }

  if (parts.length !== 4) return undefined

  const [caseKey, mode, n, metric] = parts as [string, Mode, string, string]

  // <caseA>/<caseB>.<mode>.<n>.percent | .memory-percent
  if (caseKey.includes('/')) {
    const [a, b] = caseKey.split('/')
    const left = sampleOf(results, a, mode, n)
    const right = sampleOf(results, b, mode, n)
    if (!left || !right) return undefined

    if (metric === 'percent') {
      return `${Math.round((left.mean / right.mean) * 100)}%`
    }

    if (metric === 'memory-percent') {
      return left.heapAvg != null &&
        right.heapAvg != null &&
        left.heapAvg >= 0 &&
        right.heapAvg > 0
        ? `${Math.round((left.heapAvg / right.heapAvg) * 100)}%`
        : undefined
    }

    return undefined
  }

  const sample = sampleOf(results, caseKey, mode, n)
  if (!sample) return undefined

  switch (metric) {
    case 'time':
      return ms(sample.mean)
    case 'per-element':
      return ms(sample.mean / Number(n))
    case 'memory':
      return sample.heapAvg !== undefined && sample.heapAvg >= 0
        ? mb(sample.heapAvg)
        : undefined
    case 'memory-per-element':
      return sample.heapAvg !== undefined && sample.heapAvg >= 0
        ? bytes(sample.heapAvg / Number(n))
        : undefined
    default:
      return undefined
  }
}

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

/**
 * Mirrors `packages/metrics/results/charts` into the docs' public directory,
 * removing charts that the suite no longer produces. Returns the published file
 * names.
 */
function publishCharts(): string[] {
  if (!fs.existsSync(CHARTS_SRC)) {
    throw new Error(
      `${path.relative(ROOT, CHARTS_SRC)} does not exist — run \`pnpm bench\` in packages/metrics/ first`
    )
  }

  const charts = fs
    .readdirSync(CHARTS_SRC)
    .filter((file) => file.endsWith('.svg'))
    .sort()

  fs.mkdirSync(CHARTS_DEST, { recursive: true })

  for (const stale of fs.readdirSync(CHARTS_DEST)) {
    if (!charts.includes(stale)) {
      fs.rmSync(path.join(CHARTS_DEST, stale), { recursive: true })
    }
  }

  for (const chart of charts) {
    fs.copyFileSync(path.join(CHARTS_SRC, chart), path.join(CHARTS_DEST, chart))
  }

  return charts
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageUpdate {
  content: string
  filled: number
  unknown: string[]
  missingCharts: string[]
}

function updatePage(
  content: string,
  results: Results,
  charts: string[]
): PageUpdate {
  const unknown: string[] = []
  let filled = 0

  const next = content.replace(
    /(<!-- @bench:([\w./-]+) -->)[\s\S]*?(<!-- \/@bench -->)/g,
    (match, open: string, key: string, close: string) => {
      const value = valueOf(results, key)

      if (value === undefined) {
        unknown.push(key)
        return match
      }

      filled++
      return `${open}\`${value}\`${close}`
    }
  )

  const referenced = [...next.matchAll(/\/charts\/([\w-]+\.svg)/g)].map(
    (match) => match[1]
  )

  const missingCharts = [...new Set(referenced)].filter(
    (chart) => !charts.includes(chart)
  )

  return { content: next, filled, unknown, missingCharts }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function pageFor(adapter: string): string {
  return adapter === 'ui'
    ? path.join(DOCS_ROOT, 'src', 'guide', 'performance.md')
    : path.join(DOCS_ROOT, 'src', 'guide', `_${adapter}`, 'performance.md')
}

function main(): void {
  if (!fs.existsSync(RESULTS_JSON)) {
    throw new Error(
      `${path.relative(ROOT, RESULTS_JSON)} does not exist — run \`pnpm bench\` in packages/metrics/ first`
    )
  }

  const results = JSON.parse(fs.readFileSync(RESULTS_JSON, 'utf-8')) as Results

  const charts = publishCharts()

  console.log(
    `[benchmark] ${charts.length} charts → ${path.relative(ROOT, CHARTS_DEST)}`
  )

  const adapters = Object.keys(
    JSON.parse(fs.readFileSync(DOCS_CONFIG_JSON, 'utf-8')).adapters as Record<
      string,
      unknown
    >
  )

  for (const adapter of adapters) {
    const page = pageFor(adapter)

    if (!fs.existsSync(page)) {
      console.log(
        `[benchmark] ${adapter}: no ${path.relative(ROOT, page)}, skipped`
      )
      continue
    }

    const content = fs.readFileSync(page, 'utf-8')
    const update = updatePage(content, results, charts)

    fs.writeFileSync(page, update.content)

    for (const key of update.unknown) {
      console.warn(`[benchmark] ${adapter}: no measurement for @bench:${key}`)
    }

    for (const chart of update.missingCharts) {
      console.warn(
        `[benchmark] ${adapter}: ${chart} is referenced but not in packages/metrics/results/charts`
      )
    }

    console.log(
      `[benchmark] ${adapter}: ${update.filled} values from ${path.relative(ROOT, RESULTS_JSON)} → ${path.relative(ROOT, page)}`
    )
  }
}

main()
