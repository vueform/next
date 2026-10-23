import fs from 'node:fs'
import path from 'node:path'

import { CASES, MODES, type Mode } from './cases'
import { CHARTS_DIR } from './lib'

/**
 * Hand-rolled SVG line charts, one `<case>-time.svg` per case plus
 * `<case>-memory.svg` for the cases that record heap deltas, each with a
 * `-dark` twin. Geometry and palette match the charts the docs already ship, so
 * `docs:gen --benchmark` can mirror the folder as-is.
 */

interface Theme {
  bg: string
  title: string
  text: string
  grid: string
  axis: string
}

const LIGHT: Theme = {
  bg: '#ffffff',
  title: '#1f2328',
  text: '#57606a',
  grid: '#eaeef2',
  axis: '#8c959f',
}

const DARK: Theme = {
  bg: '#0f0f11',
  title: '#e6edf3',
  text: '#8b949e',
  grid: '#21262d',
  axis: '#484f58',
}

const SERIES: Record<Mode, string> = {
  vdom: '#6366f1',
  vapor: '#10b981',
}

// Canvas and plot rectangle, as in the shipped charts — the canvas extends
// below the x-axis legend for the centered meta line.
const W = 720
const H = 470
const PLOT = { x0: 80, x1: 688, y0: 96, y1: 388 }
const Y_INTERVALS = 3

interface CaseSamples {
  label?: string
  results: Partial<
    Record<Mode, Record<string, { mean: number; heapAvg?: number }>>
  >
}

type Results = Record<string, CaseSamples> & {
  environment?: {
    cpu?: string
    ramBytes?: number
    os?: string
    browser?: string
    vue?: string
    vueform?: string
    capturedAt?: string
  }
}

/**
 * Smallest 1/2/5×10^k step whose `Y_INTERVALS` multiples cover `max`; the
 * chart then drops trailing intervals the data never reaches.
 */
function niceStep(max: number): number {
  if (max <= 0) return 1

  const rough = max / Y_INTERVALS
  const magnitude = 10 ** Math.floor(Math.log10(rough))

  for (const base of [1, 2, 5, 10]) {
    if (base * magnitude >= rough) return base * magnitude
  }

  return 10 * magnitude
}

function formatTick(value: number): string {
  if (value >= 1000 && value % 1000 === 0) return `${value / 1000}k`
  return value % 1 === 0 ? String(value) : String(Number(value.toFixed(2)))
}

const fmt = (value: number) => value.toFixed(1)

function seriesPoints(
  samples: Record<string, { value: number }>,
  maxN: number,
  top: number
): { x: number; y: number }[] {
  return Object.entries(samples)
    .map(([n, { value }]) => ({ n: Number(n), value }))
    .sort((a, b) => a.n - b.n)
    .map(({ n, value }) => ({
      x: PLOT.x0 + (n / maxN) * (PLOT.x1 - PLOT.x0),
      y: PLOT.y1 - (value / top) * (PLOT.y1 - PLOT.y0),
    }))
}

function renderChart(
  title: string,
  yLabel: string,
  vueform: string,
  meta: { line: string },
  series: Partial<Record<Mode, Record<string, { value: number }>>>,
  theme: Theme
): string {
  const values = MODES.flatMap((mode) =>
    Object.values(series[mode] ?? {}).map((s) => s.value)
  )
  const ns = MODES.flatMap((mode) =>
    Object.keys(series[mode] ?? {}).map(Number)
  )
  const maxN = Math.max(...ns)
  const maxValue = Math.max(...values)
  const step = niceStep(maxValue)
  const yIntervals = Math.max(1, Math.ceil(maxValue / step))
  const top = step * yIntervals

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">`,
    `<rect width="${W}" height="${H}" fill="${theme.bg}"/>`,
    `<text x="${W / 2}" y="34" font-size="16" font-weight="600" fill="${theme.title}" text-anchor="middle">${title}</text>`,
  ]

  // Legend: swatch + label per mode, the row centered as a whole.
  const legend = MODES.filter((mode) => series[mode]).map((mode) => ({
    mode,
    text: `Vueform ${vueform} (${mode})`,
  }))
  const charW = 6.3
  const gap = 40
  const widths = legend.map(({ text }) => 12 + 5 + text.length * charW)
  const total = widths.reduce((a, b) => a + b, 0) + gap * (legend.length - 1)
  let cursor = W / 2 - total / 2

  legend.forEach(({ mode, text }, i) => {
    parts.push(
      `<rect x="${fmt(cursor)}" y="52" width="12" height="12" rx="2" fill="${SERIES[mode]}"/>` +
        `<text x="${fmt(cursor + 17)}" y="62" font-size="12" fill="${theme.text}">${text}</text>`
    )
    cursor += widths[i] + gap
  })

  // Horizontal gridlines and y tick labels.
  for (let i = 0; i <= yIntervals; i++) {
    const y = PLOT.y1 - (i / yIntervals) * (PLOT.y1 - PLOT.y0)
    parts.push(
      `<line x1="${PLOT.x0}" y1="${y}" x2="${PLOT.x1}" y2="${y}" stroke="${theme.grid}" stroke-width="1"/>`,
      `<text x="${PLOT.x0 - 8}" y="${y + 4}" font-size="11" fill="${theme.text}" text-anchor="end">${formatTick(i * step)}</text>`
    )
  }

  // Vertical gridlines and x tick labels at 0, max/2 and max.
  for (const ratio of [0, 0.5, 1]) {
    const x = PLOT.x0 + ratio * (PLOT.x1 - PLOT.x0)
    parts.push(
      `<line x1="${x}" y1="${PLOT.y0}" x2="${x}" y2="${PLOT.y1}" stroke="${theme.grid}" stroke-width="1"/>`,
      `<text x="${x}" y="${PLOT.y1 + 18}" font-size="11" fill="${theme.text}" text-anchor="middle">${formatTick(ratio * maxN)}</text>`
    )
  }

  parts.push(
    `<line x1="${PLOT.x0}" y1="${PLOT.y1}" x2="${PLOT.x1}" y2="${PLOT.y1}" stroke="${theme.axis}" stroke-width="1"/>`,
    `<line x1="${PLOT.x0}" y1="${PLOT.y0}" x2="${PLOT.x0}" y2="${PLOT.y1}" stroke="${theme.axis}" stroke-width="1"/>`,
    `<text x="${(PLOT.x0 + PLOT.x1) / 2}" y="430" font-size="12" fill="${theme.text}" text-anchor="middle">N (number of elements)</text>`,
    `<text x="28" y="242" font-size="12" fill="${theme.text}" text-anchor="middle" transform="rotate(-90 28 242)">${yLabel}</text>`
  )

  // Run metadata, centered below the x-axis legend — smaller and fainter.
  if (meta.line) {
    parts.push(
      `<text x="${W / 2}" y="450" font-size="10" fill="${theme.axis}" text-anchor="middle">${meta.line}</text>`
    )
  }

  for (const mode of MODES) {
    const samples = series[mode]
    if (!samples) continue

    const points = seriesPoints(samples, maxN, top)
    parts.push(
      `<polyline points="${points.map(({ x, y }) => `${fmt(x)},${fmt(y)}`).join(' ')}" fill="none" stroke="${SERIES[mode]}" stroke-width="2"/>`,
      ...points.map(
        ({ x, y }) =>
          `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="3.5" fill="${SERIES[mode]}"/>`
      )
    )
  }

  parts.push('</svg>')
  return parts.join('\n') + '\n'
}

/**
 * The meta line under each chart: the run's ISO timestamp followed by the
 * environment summary. Results predating `environment.capturedAt` fall back
 * to the newest sample timestamp.
 */
function buildMeta(results: Results): { line: string } {
  const e = results.environment ?? {}
  const env = [
    e.cpu,
    e.ramBytes ? `${Math.round(e.ramBytes / 1024 ** 3)} GB RAM` : undefined,
    e.os,
    e.browser,
    e.vue ? `vue@${e.vue}` : undefined,
  ]
    .filter(Boolean)
    .join(' • ')

  let capturedAt = e.capturedAt ?? ''
  if (!capturedAt) {
    let latest = 0
    for (const [key, value] of Object.entries(results)) {
      if (key === 'environment') continue
      const caseValue = value as CaseSamples
      for (const samples of Object.values(caseValue.results ?? {})) {
        for (const sample of Object.values(samples ?? {})) {
          const ts = (sample as { timestamp?: number }).timestamp ?? 0
          if (ts > latest) latest = ts
        }
      }
    }
    if (latest) {
      capturedAt = new Date(latest * 1000).toISOString().replace(/\.\d+Z$/, 'Z')
    }
  }

  return { line: [capturedAt, env].filter(Boolean).join(' • ') }
}

/**
 * Regenerates every chart from the full results file, pruning charts of metrics
 * the suite no longer records.
 */
export function generateCharts(results: Results): string[] {
  fs.mkdirSync(CHARTS_DIR, { recursive: true })

  const vueform = results.environment?.vueform ?? ''
  const meta = buildMeta(results)
  const written: string[] = []

  const write = (name: string, content: string) => {
    fs.writeFileSync(path.join(CHARTS_DIR, name), content)
    written.push(name)
  }

  for (const benchCase of CASES) {
    const caseResults = results[benchCase.id]?.results
    if (!caseResults) continue

    const metrics: {
      suffix: string
      yLabel: string
      value: (s: { mean: number; heapAvg?: number }) => number | undefined
    }[] = [
      { suffix: 'time', yLabel: 'Mean time (ms)', value: (s) => s.mean },
      {
        suffix: 'memory',
        yLabel: 'Avg heap delta (MB)',
        value: (s) =>
          s.heapAvg != null && s.heapAvg >= 0
            ? s.heapAvg / 1024 ** 2
            : undefined,
      },
    ]

    for (const metric of metrics) {
      const series: Partial<Record<Mode, Record<string, { value: number }>>> =
        {}

      for (const mode of MODES) {
        for (const [n, sample] of Object.entries(caseResults[mode] ?? {})) {
          const value = metric.value(sample)
          if (value == null) continue
          ;(series[mode] ??= {})[n] = { value }
        }
      }

      if (!Object.keys(series).length) continue

      const title = `${results[benchCase.id].label ?? benchCase.label} — ${metric.suffix}`
      write(
        `${benchCase.id}-${metric.suffix}.svg`,
        renderChart(title, metric.yLabel, vueform, meta, series, LIGHT)
      )
      write(
        `${benchCase.id}-${metric.suffix}-dark.svg`,
        renderChart(title, metric.yLabel, vueform, meta, series, DARK)
      )
    }
  }

  for (const stale of fs.readdirSync(CHARTS_DIR)) {
    if (stale.endsWith('.svg') && !written.includes(stale)) {
      fs.rmSync(path.join(CHARTS_DIR, stale))
    }
  }

  return written
}
