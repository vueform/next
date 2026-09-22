/**
 * Runs the benchmark suite and regenerates the charts and BENCHMARKS.md.
 *
 * Flags:
 *
 * - `--vapor` / `--vdom` run only that rendering mode (default: both)
 * - `--case=a,b` run only the listed cases
 * - `--n=100,500` override the sweep values
 * - `--runs=10` run each measurement this many times
 * - `--dry` print results to the terminal only — nothing is written (no json,
 *   charts or md)
 * - `--no-isolate` run a whole mode in one browser page (faster to start, but
 *   memory retained across sweep points adds up — see README)
 *
 * Partial runs (mode/case/n filters) merge into the persisted
 * results/json/benchmarks.json; charts and the report are always regenerated
 * from the full file.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { resolve } from 'node:path'

import { pkgRoot } from '../../lib/paths'
import { MODES, type Mode } from '../lib/results'
import { generateCharts } from './charts'
import { generateReport } from './report'

const args = process.argv.slice(2)

function flagValue(prefix: string): string | null {
  const arg = args.find((a) => a.startsWith(`${prefix}=`))
  return arg ? arg.split('=')[1] : null
}

const caseArg = flagValue('--case')
const nArg = flagValue('--n')
const runsArg = flagValue('--runs')

const vapor = args.includes('--vapor')
const vdom = args.includes('--vdom')

// `--dry` runs without saving: results are only printed to the terminal, and
// no charts or report are generated.
const dry = args.includes('--dry')

// `--no-isolate` runs a whole mode in one browser page (faster to start, but
// memory retained across sweep points adds up — see README).
const isolate = !args.includes('--no-isolate')

const modes: Mode[] =
  vapor && !vdom ? ['vapor'] : vdom && !vapor ? ['vdom'] : [...MODES]

const knownFlags = args.filter(
  (a) =>
    a === '--vapor' ||
    a === '--vdom' ||
    a === '--dry' ||
    a === '--no-isolate' ||
    ['--case=', '--n=', '--runs='].some((p) => a.startsWith(p))
)
const vitestArgs = args.filter((a) => !knownFlags.includes(a))

const allowedCases = caseArg
  ? caseArg.split(',').map((value) => value.trim())
  : null
const allowedNs = nArg ? nArg.split(',').map((v) => parseInt(v, 10)) : null

/**
 * Reads the case registry from the case files: id (the filename) and the `ns`
 * sweep, so each sweep point can run in its own vitest process (a fresh browser
 * page). The `ns` array is read with a regex — keep it a literal.
 */
function readCases() {
  const dir = resolve(pkgRoot, 'bench/cases')
  const order = fs
    .readFileSync(resolve(dir, 'index.ts'), 'utf8')
    .match(/from '\.\/([\w-]+)'/g)!
    .map((m) => m.match(/'\.\/([\w-]+)'/)![1])

  return order.map((id) => {
    const src = fs.readFileSync(resolve(dir, `${id}.ts`), 'utf8')
    const match = src.match(/\bns:\s*\[([^\]]*)\]/)
    const ns = match
      ? match[1]
          .split(',')
          .map((v) => parseInt(v, 10))
          .filter((v) => !isNaN(v))
      : []
    return { id, ns }
  })
}

if (allowedCases) {
  const known = new Set(readCases().map((c) => c.id))
  const unknown = allowedCases.filter((id) => !known.has(id))
  if (unknown.length) {
    console.error(
      `Unknown case(s): ${unknown.join(', ')}. Available: ${[...known].join(', ')}.`
    )
    process.exit(1)
  }
}

interface Unit {
  caseId?: string
  n?: number
}

/**
 * The (case, n) units to run. Isolated: one unit per sweep point. Otherwise: a
 * single unit covering everything the filters allow.
 */
function units(): Unit[] {
  if (!isolate) return [{}]

  return readCases()
    .filter((c) => !allowedCases || allowedCases.includes(c.id))
    .flatMap((c) =>
      c.ns
        .filter((n) => !allowedNs || allowedNs.includes(n))
        .map((n) => ({ caseId: c.id, n }))
    )
}

function run(mode: Mode, unit: Unit) {
  const env: Record<string, string> = { BENCH_MODE: mode }

  const caseId = unit.caseId ?? caseArg
  const n = unit.n != null ? String(unit.n) : nArg

  if (caseId) env.BENCH_CASE = caseId
  if (n) env.BENCH_N = n
  if (runsArg) env.BENCH_RUNS = runsArg
  if (dry) env.BENCH_SAVE = '0'

  const what = unit.caseId
    ? `${unit.caseId} n=${unit.n}`
    : 'all cases in one page'

  console.log(`\n▸ ${mode}: ${what}\n`)

  // A unit gets one retry: launching a fresh browser process dozens of times
  // in a row occasionally loses the page before the test starts (a transient
  // renderer crash, not a benchmark failure).
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      execSync(`npx vitest run ${vitestArgs.join(' ')}`, {
        cwd: pkgRoot,
        stdio: 'inherit',
        env: { ...process.env, ...env },
      })
      return
    } catch {
      if (attempt === 1) {
        console.error(`\n↻ Retrying once: ${mode}: ${what}\n`)
        continue
      }
      console.error(`\n✗ Benchmark run failed: ${mode}: ${what}\n`)
      process.exit(1)
    }
  }
}

for (const mode of modes) {
  for (const unit of units()) {
    run(mode, unit)
  }
}

if (dry) {
  console.log('\n▸ Dry run — nothing was saved.\n')
} else {
  console.log('\n▸ Generating charts and report...\n')
  generateCharts()
  generateReport()
  console.log('✓ Done\n')
}
