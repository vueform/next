/**
 * Type-level benchmark engine (`vf-bench-dts`): measures how expensive a
 * package's types are to check by running `vue-tsc --extendedDiagnostics` over
 * generated fixtures, each in its own isolated program.
 *
 * Expected package layout (`dir`, default `tests/bench-dts`):
 *
 * - `<dir>/tsconfig.json` — static config whose `include` lists the fixture glob
 *   (any entry containing `suites/`) plus the measured src slices.
 * - `<dir>/suites/*.ts` — one fixture per measurement.
 *
 * Per measurement, a transient `tsconfig.measure.json` (gitignored, removed
 * afterwards) narrows the static config's `include` to one fixture plus the
 * non-suite entries, so fixtures never typecheck each other.
 *
 * The primary metrics are the checker's deterministic counters —
 * instantiations, types, symbols — which are machine-independent and therefore
 * the honest cross-commit regression signal. Wall-clock times and memory are
 * reported as secondary, noisy, local-only color.
 *
 * Comparison mirrors the runtime bench workflow (`vitest bench --outputJson` /
 * `--compare`): nothing is persisted unless asked.
 *
 * - default — measure and print absolutes
 * - `--compare` — also diff against the saved baseline
 * - `--save` — overwrite the baseline with this run (combinable with `--compare`
 *   for a rolling baseline)
 *
 * Baselines live outside git in `.vueform/bench-dts.json` at the
 * workspace root, keyed by package → measurement. Typical flow: `--save` on
 * `main`, switch branch, `--compare`.
 */
import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative } from 'node:path'

/**
 * Full `vue-tsc --extendedDiagnostics` snapshot (numeric fields only). Times
 * are seconds; memory is kilobytes (tsc's `…K` unit).
 */
export type BenchDtsMetrics = {
  files: number
  linesOfLibrary: number
  linesOfDefinitions: number
  linesOfTypeScript: number
  linesOfJavaScript: number
  linesOfJson: number
  linesOfOther: number
  identifiers: number
  symbols: number
  types: number
  instantiations: number
  memoryUsedKb: number
  assignabilityCacheSize: number
  identityCacheSize: number
  subtypeCacheSize: number
  strictSubtypeCacheSize: number
  ioReadTimeSec: number
  parseTimeSec: number
  resolveModuleTimeSec: number
  resolveTypeReferenceTimeSec: number
  resolveLibraryTimeSec: number
  programTimeSec: number
  bindTimeSec: number
  checkTimeSec: number
  printTimeSec: number
  emitTimeSec: number
  totalTimeSec: number
}

/**
 * Label as printed by tsc → metrics key.
 */
const DIAGNOSTIC_FIELDS: {
  label: string
  key: keyof BenchDtsMetrics
  unit?: 'K' | 's'
}[] = [
  { label: 'Files', key: 'files' },
  { label: 'Lines of Library', key: 'linesOfLibrary' },
  { label: 'Lines of Definitions', key: 'linesOfDefinitions' },
  { label: 'Lines of TypeScript', key: 'linesOfTypeScript' },
  { label: 'Lines of JavaScript', key: 'linesOfJavaScript' },
  { label: 'Lines of JSON', key: 'linesOfJson' },
  { label: 'Lines of Other', key: 'linesOfOther' },
  { label: 'Identifiers', key: 'identifiers' },
  { label: 'Symbols', key: 'symbols' },
  { label: 'Types', key: 'types' },
  { label: 'Instantiations', key: 'instantiations' },
  { label: 'Memory used', key: 'memoryUsedKb', unit: 'K' },
  { label: 'Assignability cache size', key: 'assignabilityCacheSize' },
  { label: 'Identity cache size', key: 'identityCacheSize' },
  { label: 'Subtype cache size', key: 'subtypeCacheSize' },
  { label: 'Strict subtype cache size', key: 'strictSubtypeCacheSize' },
  { label: 'I/O Read time', key: 'ioReadTimeSec', unit: 's' },
  { label: 'Parse time', key: 'parseTimeSec', unit: 's' },
  { label: 'ResolveModule time', key: 'resolveModuleTimeSec', unit: 's' },
  {
    label: 'ResolveTypeReference time',
    key: 'resolveTypeReferenceTimeSec',
    unit: 's',
  },
  { label: 'ResolveLibrary time', key: 'resolveLibraryTimeSec', unit: 's' },
  { label: 'Program time', key: 'programTimeSec', unit: 's' },
  { label: 'Bind time', key: 'bindTimeSec', unit: 's' },
  { label: 'Check time', key: 'checkTimeSec', unit: 's' },
  { label: 'printTime time', key: 'printTimeSec', unit: 's' },
  { label: 'Emit time', key: 'emitTimeSec', unit: 's' },
  { label: 'Total time', key: 'totalTimeSec', unit: 's' },
]

interface BaselineEntry {
  commit: string | undefined
  timestamp: string
  metrics: BenchDtsMetrics
}

/**
 * Package name → measurement → baseline.
 */
type BaselineFile = Record<string, Record<string, BaselineEntry>>

export interface BenchDtsOptions {
  /**
   * The invoking package's root (where its `package.json` lives), typically
   * `process.cwd()`.
   */
  packageDir: string
  /**
   * The bench directory relative to `packageDir`.
   */
  dir?: string
  /**
   * Measurement names (fixture basenames) to run; every fixture when empty.
   */
  measurements?: string[]
  /**
   * Diff this run against the saved baseline.
   */
  compare?: boolean
  /**
   * Overwrite the baseline with this run.
   */
  save?: boolean
  /**
   * Measurement repetitions; the run with the median total time is reported.
   * Counters are deterministic across runs — repetition only steadies the
   * secondary time/memory numbers.
   */
  runs?: number
}

function parseDiagnostics(output: string): BenchDtsMetrics | undefined {
  const metrics = {} as BenchDtsMetrics
  for (const { label, key, unit } of DIAGNOSTIC_FIELDS) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern =
      unit === 'K'
        ? new RegExp(`${escaped}:\\s+(\\d+)K`)
        : new RegExp(`${escaped}:\\s+([\\d.]+)s?`)
    const match = output.match(pattern)
    if (match == null) return undefined
    metrics[key] = Number(match[1])
  }
  return metrics
}

/**
 * Nearest ancestor with `pnpm-workspace.yaml` — the baseline's home — or the
 * package itself outside a workspace.
 */
function workspaceRoot(packageDir: string): string {
  let current = packageDir
  while (true) {
    if (existsSync(join(current, 'pnpm-workspace.yaml'))) return current
    const parent = dirname(current)
    if (parent === current) return packageDir
    current = parent
  }
}

function gitHead(cwd: string): string | undefined {
  const r = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
    cwd,
    encoding: 'utf8',
  })
  if (r.status !== 0) return undefined
  return r.stdout.trim() || undefined
}

const fmtNum = (n: number) => n.toLocaleString('en-US')
const fmtSec = (n: number) => `${n.toFixed(2)}s`
const fmtMem = (kb: number) => `${(kb / 1024).toFixed(1)} MB`

const useColor = process.env.NO_COLOR == null && process.stdout.isTTY === true
const paint = (code: string, text: string) =>
  useColor ? `\x1b[${code}m${text}\x1b[0m` : text

type DeltaKind = 'num' | 'sec' | 'mem'

/**
 * One comparison row. Counters are deterministic, so any drift ≥1% is a real
 * change; times/memory get the wider 5% noise band.
 */
function deltaRow(
  label: string,
  latest: number,
  base: number,
  kind: DeltaKind
): string {
  const fmt = kind === 'sec' ? fmtSec : kind === 'mem' ? fmtMem : fmtNum
  if (latest === base) return `  ${label.padEnd(16)} — (${fmt(latest)})`
  const d = latest - base
  const sign = d > 0 ? '+' : ''
  const abs =
    kind === 'sec'
      ? `${sign}${d.toFixed(2)}s`
      : kind === 'mem'
        ? `${sign}${(d / 1024).toFixed(1)} MB`
        : `${sign}${fmtNum(d)}`
  const pct = base === 0 ? Infinity : ((latest - base) / base) * 100
  const noise = kind === 'num' ? 1 : 5
  const emoji = Math.abs(pct) < noise ? '🟡' : pct < 0 ? '🟢' : '🔴'
  const code = emoji === '🔴' ? '31' : emoji === '🟡' ? '33' : '32'
  const pctText = base === 0 ? 'n/a' : `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`
  return `  ${label.padEnd(16)} ${paint(code, `${emoji} ${abs} (${pctText})`)}`
}

/**
 * Generates `<dir>/tsconfig.measure.json`: the static config's `include`
 * narrowed to one fixture plus every non-suite entry (src slices, ambient
 * declarations).
 */
function writeMeasureTsconfig(benchDir: string, measurement: string): string {
  const staticPath = join(benchDir, 'tsconfig.json')
  const staticConfig = JSON.parse(readFileSync(staticPath, 'utf8')) as {
    include?: string[]
  }
  const shared = (staticConfig.include ?? []).filter(
    (entry) => !entry.includes('suites/')
  )
  const measurePath = join(benchDir, 'tsconfig.measure.json')
  writeFileSync(
    measurePath,
    `${JSON.stringify(
      {
        extends: './tsconfig.json',
        include: [`./suites/${measurement}.ts`, ...shared],
      },
      null,
      2
    )}\n`
  )
  return measurePath
}

function measureOnce(
  packageDir: string,
  measurePath: string
): { ok: boolean; output: string; metrics?: BenchDtsMetrics } {
  const result = spawnSync(
    'pnpm',
    [
      'exec',
      'vue-tsc',
      '--project',
      relative(packageDir, measurePath),
      '--extendedDiagnostics',
    ],
    {
      cwd: packageDir,
      encoding: 'utf8',
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        // tsc's "Memory used" is `heapUsed`, preceded by `global.gc()` only
        // when it exists. Exposing gc makes it post-collection live heap
        // instead of whatever garbage happens to be pending — far less noisy.
        NODE_OPTIONS: [process.env.NODE_OPTIONS, '--expose-gc']
          .filter(Boolean)
          .join(' '),
      },
    }
  )
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  const metrics = parseDiagnostics(output)
  return {
    ok: (result.status ?? 1) === 0 && metrics != null,
    output,
    metrics,
  }
}

function printAbsolutes(metrics: BenchDtsMetrics) {
  console.log(`  Instantiations:  ${fmtNum(metrics.instantiations)}`)
  console.log(`  Types:           ${fmtNum(metrics.types)}`)
  console.log(`  Symbols:         ${fmtNum(metrics.symbols)}`)
  console.log(`  Check time:      ${fmtSec(metrics.checkTimeSec)}`)
  console.log(`  Total time:      ${fmtSec(metrics.totalTimeSec)}`)
  console.log(`  Memory:          ${fmtMem(metrics.memoryUsedKb)}`)
}

function printComparison(current: BenchDtsMetrics, base: BaselineEntry) {
  const b = base.metrics
  console.log(
    `  vs baseline${base.commit ? ` @ ${base.commit}` : ''} (${base.timestamp.slice(0, 10)}):`
  )
  console.log(
    deltaRow('Instantiations', current.instantiations, b.instantiations, 'num')
  )
  console.log(deltaRow('Types', current.types, b.types, 'num'))
  console.log(deltaRow('Symbols', current.symbols, b.symbols, 'num'))
  console.log(
    deltaRow('Check time', current.checkTimeSec, b.checkTimeSec, 'sec')
  )
  console.log(
    deltaRow('Total time', current.totalTimeSec, b.totalTimeSec, 'sec')
  )
  console.log(deltaRow('Memory', current.memoryUsedKb, b.memoryUsedKb, 'mem'))
}

/**
 * Runs the configured measurements. Resolves `false` when any measurement fails
 * to typecheck or parse (callers exit non-zero on it).
 */
export async function runBenchDts(options: BenchDtsOptions): Promise<boolean> {
  const { packageDir } = options
  const benchDir = join(packageDir, options.dir ?? 'tests/bench-dts')
  const suitesDir = join(benchDir, 'suites')
  const runs = Math.max(1, options.runs ?? 1)

  if (!existsSync(suitesDir)) {
    throw new Error(`No fixtures directory at ${suitesDir}`)
  }

  const all = readdirSync(suitesDir)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => f.slice(0, -'.ts'.length))
    .sort()
  const measurements = options.measurements?.length ? options.measurements : all
  for (const measurement of measurements) {
    if (!all.includes(measurement)) {
      throw new Error(
        `Unknown measurement "${measurement}". Available: ${all.join(', ')}`
      )
    }
  }
  if (measurements.length === 0) {
    throw new Error(`No fixtures found in ${suitesDir}`)
  }

  const packageName = (
    JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8')) as {
      name: string
    }
  ).name
  const root = workspaceRoot(packageDir)
  const baselineDir = join(root, '.vueform')
  const baselinePath = join(baselineDir, 'bench-dts.json')
  let baselines: BaselineFile = {}
  try {
    baselines = JSON.parse(readFileSync(baselinePath, 'utf8')) as BaselineFile
  } catch {
    // No baseline yet.
  }
  const commit = gitHead(packageDir)

  let allOk = true
  const measurePath = join(benchDir, 'tsconfig.measure.json')

  try {
    for (const measurement of measurements) {
      writeMeasureTsconfig(benchDir, measurement)
      process.stdout.write(
        `Measuring ${measurement}${runs > 1 ? ` (×${runs})` : ''}…\n`
      )

      const attempts: {
        ok: boolean
        output: string
        metrics?: BenchDtsMetrics
      }[] = []
      for (let i = 0; i < runs; i++) {
        const attempt = measureOnce(packageDir, measurePath)
        attempts.push(attempt)
        if (!attempt.ok) break
      }

      const failed = attempts.find((a) => !a.ok)
      if (failed) {
        process.stdout.write(failed.output)
        console.error(
          `\n${measurement}: vue-tsc failed or produced no diagnostics.`
        )
        allOk = false
        continue
      }

      // Counters are identical across runs; times/memory come from the
      // median-total-time run to tame cold-start noise.
      const byTotal = [...attempts].sort(
        (a, b) => a.metrics!.totalTimeSec - b.metrics!.totalTimeSec
      )
      const metrics = byTotal[Math.floor((byTotal.length - 1) / 2)]!.metrics!

      console.log(`\n${measurement}${commit ? ` @ ${commit}` : ''}:`)
      printAbsolutes(metrics)

      const base = baselines[packageName]?.[measurement]
      if (options.compare) {
        if (base) {
          printComparison(metrics, base)
        } else {
          console.log('  No saved baseline — run with --save first.')
        }
      }

      if (options.save) {
        baselines[packageName] ??= {}
        baselines[packageName][measurement] = {
          commit,
          timestamp: new Date().toISOString(),
          metrics,
        }
      }
      console.log('')
    }
  } finally {
    rmSync(measurePath, { force: true })
  }

  if (options.save) {
    mkdirSync(baselineDir, { recursive: true })
    writeFileSync(baselinePath, `${JSON.stringify(baselines, null, 2)}\n`)
    console.log(`Baseline saved → ${relative(packageDir, baselinePath)}`)
  }

  return allOk
}
