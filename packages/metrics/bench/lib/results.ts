/**
 * Shared plumbing of the benchmark charts and report generators: the
 * benchmarks.json accessors, series collection (one series per rendering mode)
 * and the chart definitions both executables render from.
 */
import fs from 'node:fs'
import { resolve } from 'node:path'

import { jsonDir, pkgRoot } from '../../lib/paths'
import { seriesColor, type LineChartOptions } from './line-chart'

export const MODES = ['vdom', 'vapor'] as const

export type Mode = (typeof MODES)[number]

/**
 * Section order in BENCHMARKS.md (mirrors the case registry). Cases missing
 * from this list are appended in benchmarks.json order.
 */
export const CASE_ORDER = [
  'render-text',
  'render-steps',
  'input-text',
  'input-text-vmodel',
  'update-all',
]

/**
 * One sweep point's persisted statistics.
 */
export interface StatRecord {
  mean: number
  median: number
  min: number
  max: number
  p75: number
  p99: number
  hz: number
  sd: number
  rme: number
  samples: number
  heapAvg: number
  heapMax: number
  timestamp?: number
  [key: string]: number | undefined
}

export interface CaseData {
  label?: string
  description?: string
  /**
   * mode -> n -> stats
   */
  results: Record<string, Record<string, StatRecord>>
}

export interface BenchResults {
  environment?: Record<string, any>
  cases: Record<string, CaseData>
}

export const benchResultsFile = resolve(jsonDir, 'benchmarks.json')

/**
 * Reads benchmarks.json, splitting the environment record from the cases.
 */
export function readBenchResults(): BenchResults {
  let raw: Record<string, any> = {}
  try {
    raw = JSON.parse(fs.readFileSync(benchResultsFile, 'utf8'))
  } catch {}
  const { environment, ...cases } = raw
  return { environment, cases }
}

function vueformVersion(): string | null {
  try {
    return JSON.parse(
      fs.readFileSync(
        resolve(pkgRoot, 'node_modules/@vueform/ui/package.json'),
        'utf8'
      )
    ).version
  } catch {
    return null
  }
}

export interface Series {
  name: string
  mode: Mode
  color: string
  /**
   * n -> stats
   */
  byN: Record<string, StatRecord>
}

/**
 * Flattens a case's results (mode -> n -> stats) into an ordered series list —
 * one series per rendering mode.
 */
export function collectSeries(caseResults: CaseData['results'] = {}): Series[] {
  const version = vueformVersion()
  const label = version ? `Vueform ${version}` : 'Vueform'

  return MODES.flatMap((mode, index) => {
    const byN = caseResults[mode]
    if (!byN) return []
    return [
      { name: `${label} (${mode})`, mode, color: seriesColor(index), byN },
    ]
  })
}

export function fmtMs(n?: number | null): string {
  if (n == null) return '-'
  if (n >= 1000) return `${(n / 1000).toFixed(2)} s`
  return `${n.toFixed(2)} ms`
}

export function fmtBytes(n?: number | null): string {
  if (n == null || n < 0) return '-'
  if (n < 1024) return `${Math.round(n)} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(2)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(2)} MB`
  return `${(n / 1024 ** 3).toFixed(2)} GB`
}

export function fmtDate(timestamp: number): string {
  const d = new Date(timestamp * 1000)
  return d
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, ' UTC')
}

export interface CaseChart {
  /**
   * Chart basename without the theme suffix and extension.
   */
  filename: string
  alt: string
  /**
   * `width` set on the report's img so a time + memory pair sits side by side.
   */
  width?: string
  options: Omit<LineChartOptions, 'theme'>
}

/**
 * The chart definitions of one case: a time chart, plus a memory chart when
 * heap deltas were recorded. The charts executable renders the SVGs from these;
 * the report embeds them by filename.
 */
export function caseCharts(caseId: string, caseData: CaseData): CaseChart[] {
  const series = collectSeries(caseData.results)
  if (series.length === 0) return []

  const label = caseData.label || caseId

  const ns = [
    ...new Set(series.flatMap((s) => Object.keys(s.byN).map(Number))),
  ].sort((a, b) => a - b)

  const hasMemory = series.some((s) =>
    Object.values(s.byN).some((r) => r.heapAvg != null && r.heapAvg >= 0)
  )

  // A time + memory pair shares one row at 49% width each; a lone time chart
  // keeps its natural full width.
  const width = hasMemory ? '49%' : undefined

  const charts: CaseChart[] = [
    {
      filename: `${caseId}-time`,
      alt: `${label} — time`,
      width,
      options: {
        title: `${label} — time`,
        xLabel: 'N (number of elements)',
        yLabel: 'Mean time (ms)',
        series: series.map((s) => ({
          name: s.name,
          color: s.color,
          points: ns
            .filter((n) => s.byN[String(n)])
            .map((n): [number, number] => [n, s.byN[String(n)].mean]),
        })),
        formatY: (v) => (v >= 1000 ? `${v / 1000}s` : `${v}`),
      },
    },
  ]

  if (hasMemory) {
    charts.push({
      filename: `${caseId}-memory`,
      alt: `${label} — memory`,
      width,
      options: {
        title: `${label} — memory`,
        xLabel: 'N (number of elements)',
        yLabel: 'Avg heap delta (MB)',
        series: series
          .map((s) => ({
            name: s.name,
            color: s.color,
            points: ns
              .filter(
                (n) =>
                  s.byN[String(n)] &&
                  s.byN[String(n)].heapAvg != null &&
                  s.byN[String(n)].heapAvg >= 0
              )
              .map((n): [number, number] => [
                n,
                s.byN[String(n)].heapAvg / 1024 ** 2,
              ]),
          }))
          .filter((s) => s.points.length > 0),
        formatY: (v) => `${v}`,
      },
    })
  }

  return charts
}

/**
 * Orders cases by CASE_ORDER, appending unknown cases in json order.
 */
export function orderedCases(
  cases: Record<string, CaseData>
): [string, CaseData][] {
  return Object.entries(cases).sort(([a], [b]) => {
    const ia = CASE_ORDER.indexOf(a)
    const ib = CASE_ORDER.indexOf(b)
    return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib)
  })
}
