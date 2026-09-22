import { readFileSync } from 'node:fs'

/**
 * One flattened benchmark entry: mean time/heap plus vitest's error margin.
 */
export interface Stat {
  mean: number
  rme?: number
}

/**
 * Flat map of benchmark name → stat, per section (time / memory).
 */
export type StatMap = Record<string, Stat>

/**
 * The shape persisted to current.json / baseline.json.
 */
export interface Results {
  time: StatMap
  memory: StatMap
}

/**
 * Vitest `--outputJson` bench shapes (only the fields walked here).
 */
interface VitestBenchJson {
  files?: VitestBenchFile[]
}

interface VitestBenchFile {
  groups?: {
    fullName?: string
    name?: string
    benchmarks?: { name: string; mean: number; rme?: number }[]
  }[]
}

/**
 * Walks vitest `--outputJson` (files → groups → benchmarks) into a flat map.
 *
 * @param json Parsed vitest bench output.
 */
export function flattenTimeJson(
  json: VitestBenchJson | VitestBenchFile[]
): StatMap {
  const out: StatMap = {}

  const files = Array.isArray(json)
    ? json
    : Array.isArray(json.files)
      ? json.files
      : []

  for (const file of files) {
    for (const group of file.groups ?? []) {
      const parts = String(group.fullName || group.name || '').split(' > ')
      const suite = parts[parts.length - 1] || ''

      for (const b of group.benchmarks ?? []) {
        const name = suite && suite !== b.name ? `${suite} > ${b.name}` : b.name
        out[name] = { mean: b.mean, rme: b.rme }
      }
    }
  }

  return out
}

/**
 * Walks memory.mem.ts output `{ cases: [{ name, mean }] }` into a flat map.
 *
 * @param json Parsed memory results.
 */
export function flattenMemoryJson(json: {
  cases?: { name: string; mean: number }[]
}): StatMap {
  const out: StatMap = {}

  for (const c of json.cases ?? []) {
    out[c.name] = { mean: c.mean }
  }

  return out
}

function pct(current?: number, baseline?: number): number | null {
  if (!baseline || baseline === 0) return null
  return (((current ?? 0) - baseline) / Math.abs(baseline)) * 100
}

function formatPct(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return 'n/a'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

function isSame(
  change: number | null,
  threshold: number,
  current: Stat | undefined,
  baseline: Stat | undefined,
  noiseFloor: number
): boolean {
  if (change == null || !Number.isFinite(change)) return false

  const latest = current?.mean ?? 0
  const base = baseline?.mean ?? 0

  if (Math.abs(latest - base) < noiseFloor) return true

  // Same rule as RESULTS.md: the two runs' error margins widen the threshold.
  const rme = (current?.rme ?? 0) + (baseline?.rme ?? 0)
  return Math.abs(change) <= Math.max(threshold, rme)
}

function row(
  name: string,
  current: Stat | undefined,
  baseline: Stat | undefined,
  threshold: number,
  noiseFloor: number
): string {
  const change = pct(current?.mean, baseline?.mean)
  const same = isSame(change, threshold, current, baseline, noiseFloor)
  const noisy =
    current?.rme != null && current.rme > 5
      ? ' noisy'
      : baseline?.rme != null && baseline.rme > 5
        ? ' noisy'
        : ''
  const tag = !baseline
    ? ' added'
    : !current
      ? ' removed'
      : same
        ? ' ~same'
        : ''

  return `  ${name.padEnd(48)} ${formatPct(change).padStart(8)}${tag}${noisy}`
}

function section(
  title: string,
  threshold: number,
  currentMap: StatMap,
  baselineMap: StatMap,
  noiseFloor: number
): string[] {
  const names = [
    ...new Set([...Object.keys(baselineMap), ...Object.keys(currentMap)]),
  ].sort()

  if (!names.length) {
    return [`${title}\n  (no results)`]
  }

  const lines = [`${title}  (threshold ±${threshold}%)`]

  for (const name of names) {
    lines.push(
      row(name, currentMap[name], baselineMap[name], threshold, noiseFloor)
    )
  }

  return lines
}

/**
 * Prints a relative % table of current vs baseline. Lower time / heap is
 * better, so a negative percentage is an improvement.
 *
 * @param current Latest run.
 * @param baseline Saved run.
 */
export function printComparison(current: Results, baseline: Results): void {
  const lines = [
    '',
    'Perf vs baseline  (negative = faster / less memory)',
    '',
    ...section('Time', 10, current.time, baseline.time, 1),
    '',
    ...section(
      'Memory (retained heap)',
      5,
      current.memory,
      baseline.memory,
      512 * 1024
    ),
    '',
  ]

  console.log(lines.join('\n'))
}

/**
 * Loads a previously written current.json / baseline.json.
 *
 * @param path File path.
 */
export function loadResults(path: string): Results {
  return JSON.parse(readFileSync(path, 'utf8'))
}
