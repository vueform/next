import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Measurement that legacy flat `results.json` files are migrated under.
 */
export const DEFAULT_MEASUREMENT = 'define-schema-500'

export const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
export const outDir = join(rootDir, 'tests/perf/types')
export const resultsPath = join(outDir, 'results.json')
export const reportPath = join(outDir, 'RESULTS.md')
export const tsconfigPath = join(rootDir, '.tsconfig/tsconfig.types.perf.json')

export function fixturePathFor(measurement: string) {
  return join(outDir, `${measurement}.ts`)
}

/**
 * Full `vue-tsc --extendedDiagnostics` snapshot (numeric fields only). Times
 * are seconds; memory is kilobytes (tsc's `…K` unit).
 */
export type Metrics = {
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
 * Label as printed by tsc → Metrics key.
 */
const DIAGNOSTIC_FIELDS: {
  label: string
  key: keyof Metrics
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

export type Result = {
  timestamp: string
  ok: boolean
  metrics?: Metrics
}

/**
 * Commit-id → result. Insertion order is chronological.
 */
export type MeasurementResults = Record<string, Result>

/**
 * Measurement → commit → result.
 */
export type ResultsFile = Record<string, MeasurementResults>

export function readResults(): ResultsFile {
  if (!existsSync(resultsPath)) return {}
  try {
    const raw = JSON.parse(readFileSync(resultsPath, 'utf8')) as ResultsFile
    // Migrate legacy flat { commit → result } → wrap under default measurement.
    if (isLegacyFlatResults(raw)) {
      return { [DEFAULT_MEASUREMENT]: raw as unknown as MeasurementResults }
    }
    return raw
  } catch {
    return {}
  }
}

function isLegacyFlatResults(raw: Record<string, unknown>): boolean {
  const values = Object.values(raw)
  if (values.length === 0) return false
  const first = values[0]
  return (
    first != null &&
    typeof first === 'object' &&
    'timestamp' in first &&
    'ok' in first
  )
}

export function writeResults(results: ResultsFile) {
  writeFileSync(resultsPath, `${JSON.stringify(results, null, 2)}\n`)
}

/**
 * Upserts a result for `measurement` / `commit`. Re-running on the same pair
 * overwrites and moves that commit entry to the end (most recent).
 */
export function upsertResult(
  results: ResultsFile,
  measurement: string,
  commit: string,
  result: Result
): ResultsFile {
  const bucket: MeasurementResults = {}
  for (const [id, entry] of Object.entries(results[measurement] ?? {})) {
    if (id !== commit) bucket[id] = entry
  }
  bucket[commit] = result
  return { ...results, [measurement]: bucket }
}

/**
 * What to diff the new run against:
 *
 * 1. If this measurement+commit already has a result (re-run) → that prior result
 *    for the same combo.
 * 2. Otherwise → the previous commit's result for this measurement.
 */
export function comparisonTarget(
  results: ResultsFile,
  measurement: string,
  commit: string
):
  | { kind: 'same-commit'; commit: string; result: Result }
  | { kind: 'previous-commit'; commit: string; result: Result }
  | undefined {
  const bucket = results[measurement] ?? {}
  const same = bucket[commit]
  if (same) {
    return { kind: 'same-commit', commit, result: same }
  }
  const entries = Object.entries(bucket)
  if (entries.length === 0) return undefined
  const [id, result] = entries[entries.length - 1]!
  return { kind: 'previous-commit', commit: id, result }
}

export function gitHead(): string | undefined {
  const r = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
    cwd: rootDir,
    encoding: 'utf8',
  })
  if (r.status !== 0) return undefined
  return r.stdout.trim() || undefined
}

export function parseDiagnostics(output: string): Metrics | undefined {
  const metrics = {} as Metrics

  for (const { label, key, unit } of DIAGNOSTIC_FIELDS) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern =
      unit === 'K'
        ? new RegExp(`${escaped}:\\s+(\\d+)K`)
        : unit === 's'
          ? new RegExp(`${escaped}:\\s+([\\d.]+)s?`)
          : new RegExp(`${escaped}:\\s+([\\d.]+)`)
    const match = output.match(pattern)
    if (match == null) return undefined
    metrics[key] = Number(match[1])
  }

  return metrics
}

export function fmtSec(n: number) {
  return `${n.toFixed(2)}s`
}

export function fmtNum(n: number) {
  return n.toLocaleString('en-US')
}

export function fmtMem(kb: number) {
  return `${(kb / 1024).toFixed(1)} MB`
}

/**
 * Lower is better for total time and memory:
 *
 * - 🟡 |change| < 5% (noise either way)
 * - 🟢 improved by >= 5%
 * - 🔴 regressed by >= 5%
 */
function changeEmoji(latest: number, base: number) {
  if (latest === base || base === 0) return null
  const pct = ((latest - base) / base) * 100
  if (Math.abs(pct) < 5) return '🟡'
  return pct < 0 ? '🟢' : '🔴'
}

export function fmtDelta(
  latest: number,
  base: number,
  kind: 'sec' | 'num' | 'mem'
) {
  const d = latest - base
  if (d === 0) return '—'
  const sign = d > 0 ? '+' : ''
  if (kind === 'sec') return `${sign}${d.toFixed(2)}s`
  if (kind === 'mem') return `${sign}${(d / 1024).toFixed(1)} MB`
  return `${sign}${fmtNum(d)}`
}

function fmtPct(latest: number, base: number) {
  if (base === 0) return 'n/a'
  if (latest === base) return '—'
  const pct = ((latest - base) / base) * 100
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}

function fmtDeltaWithPct(
  latest: number,
  base: number,
  kind: 'sec' | 'num' | 'mem'
) {
  const abs = fmtDelta(latest, base, kind)
  if (abs === '—') return abs
  const emoji = changeEmoji(latest, base)!
  return `${emoji} ${abs} (${fmtPct(latest, base)})`
}

function fmtPctWithEmoji(latest: number, base: number) {
  const pct = fmtPct(latest, base)
  if (pct === '—' || pct === 'n/a') return pct
  return `${changeEmoji(latest, base)} ${pct}`
}

const useColor =
  process.env.NO_COLOR == null &&
  (process.env.FORCE_COLOR != null && process.env.FORCE_COLOR !== '0'
    ? true
    : process.stdout.isTTY === true)

/**
 * ANSI color matching 🟢 / 🟡 / 🔴.
 */
function colorDelta(text: string, latest: number, base: number) {
  if (!useColor || latest === base) return text
  const emoji = changeEmoji(latest, base)
  const code =
    emoji === '🔴' ? '\x1b[31m' : emoji === '🟡' ? '\x1b[33m' : '\x1b[32m'
  return `${code}${text}\x1b[0m`
}

/**
 * Prints absolute values for the current measurement/commit and deltas vs the
 * comparison target (prior same-commit run, or previous commit).
 */
export function printComparison(
  measurement: string,
  commit: string,
  current: Result,
  previous?:
    | { kind: 'same-commit'; commit: string; result: Result }
    | { kind: 'previous-commit'; commit: string; result: Result }
) {
  const l = current.metrics
  if (!l) {
    console.log('\nNo metrics to compare (run failed).')
    return
  }

  console.log(`\nResults (${measurement} @ ${commit}):`)
  console.log(`  Total time:      ${fmtSec(l.totalTimeSec)}`)
  console.log(`  Types:           ${fmtNum(l.types)}`)
  console.log(`  Instantiations:  ${fmtNum(l.instantiations)}`)
  console.log(`  Memory:          ${fmtMem(l.memoryUsedKb)}`)

  const b = previous?.result.metrics
  if (!b || !previous) {
    console.log(
      `\nNo previous run for "${measurement}" in results.json — nothing to diff.`
    )
    return
  }

  const rows: {
    label: string
    latest: number
    base: number
    text: string
    changed: boolean
  }[] = [
    {
      label: 'Total time',
      latest: l.totalTimeSec,
      base: b.totalTimeSec,
      text: fmtDeltaWithPct(l.totalTimeSec, b.totalTimeSec, 'sec'),
      changed: l.totalTimeSec !== b.totalTimeSec,
    },
    {
      label: 'Types',
      latest: l.types,
      base: b.types,
      text: fmtDeltaWithPct(l.types, b.types, 'num'),
      changed: l.types !== b.types,
    },
    {
      label: 'Instantiations',
      latest: l.instantiations,
      base: b.instantiations,
      text: fmtDeltaWithPct(l.instantiations, b.instantiations, 'num'),
      changed: l.instantiations !== b.instantiations,
    },
    {
      label: 'Memory',
      latest: l.memoryUsedKb,
      base: b.memoryUsedKb,
      text: fmtDeltaWithPct(l.memoryUsedKb, b.memoryUsedKb, 'mem'),
      changed: l.memoryUsedKb !== b.memoryUsedKb,
    },
  ]

  const changed = rows.filter((r) => r.changed)
  const header =
    previous.kind === 'same-commit'
      ? '\nChanges vs previous run:'
      : `\nChanges vs ${previous.commit}:`
  console.log(header)
  if (changed.length === 0) {
    console.log('  (none)')
    return
  }
  for (const row of changed) {
    console.log(
      `  ${row.label.padEnd(16)} ${colorDelta(row.text, row.latest, row.base)}`
    )
  }
}

export function writeReport(results: ResultsFile) {
  const measurements = Object.keys(results).sort()
  const lines: string[] = [
    '# TypeScript Performance',
    '',
    'Cold `vue-tsc --extendedDiagnostics` measurements. Results are keyed by',
    '`measurement → commit` in `results.json`.',
    '',
    'Memory is post-GC live heap (vue-tsc runs with `--expose-gc`). Rows',
    'before 2026-08-31 were measured without it and are noisier / not directly',
    'comparable.',
    '',
    '- `pnpm tsc:perf` → run every `tests/perf/types/*.ts` fixture',
    '- `pnpm tsc:perf -- <measurement>` → run a specific fixture',
    '- `pnpm tsc:perf -- report` → regenerate this file',
    '',
    `_Last updated: ${new Date()
      .toISOString()
      .replace('T', ' ')
      .replace(/\.\d{3}Z$/, ' UTC')}_`,
    '',
  ]

  if (measurements.length === 0) {
    lines.push('_No results yet._', '')
    writeFileSync(reportPath, lines.join('\n'))
    return
  }

  for (const measurement of measurements) {
    // Newest first; each row (except the last/oldest) shows % vs the older row below.
    const rows = [...Object.entries(results[measurement] ?? {})].reverse()
    lines.push(
      `## ${measurement}`,
      '',
      '| Commit | Total | Memory | When (UTC) |',
      '| --- | ---: | ---: | --- |'
    )

    for (let i = 0; i < rows.length; i++) {
      const [commit, entry] = rows[i]!
      const m = entry.metrics
      const when = entry.timestamp.replace('T', ' ').replace(/\.\d{3}Z$/, '')
      if (!m || !entry.ok) {
        lines.push(`| ${commit} | — | — | ${when} |`)
        continue
      }

      const older = rows[i + 1]?.[1]?.metrics
      const total = older
        ? `${fmtSec(m.totalTimeSec)} (${fmtPctWithEmoji(m.totalTimeSec, older.totalTimeSec)})`
        : fmtSec(m.totalTimeSec)
      const memory = older
        ? `${fmtMem(m.memoryUsedKb)} (${fmtPctWithEmoji(m.memoryUsedKb, older.memoryUsedKb)})`
        : fmtMem(m.memoryUsedKb)

      lines.push(`| ${commit} | ${total} | ${memory} | ${when} |`)
    }

    lines.push('')
  }

  writeFileSync(reportPath, lines.join('\n'))
}
