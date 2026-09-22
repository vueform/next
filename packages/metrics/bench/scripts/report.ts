/**
 * Regenerates results/BENCHMARKS.md from the current
 * results/json/benchmarks.json. Charts are embedded by filename; run
 * `bench:charts` to (re)render the SVGs themselves.
 */
import fs from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { resultsDir } from '../../lib/paths'
import {
  caseCharts,
  collectSeries,
  fmtBytes,
  fmtDate,
  fmtMs,
  orderedCases,
  readBenchResults,
  type CaseData,
} from '../lib/results'

/**
 * The `<picture>` markup switching between a chart's light and dark SVG by
 * color scheme. Paths are relative to results/BENCHMARKS.md.
 */
function pictureMarkup(filename: string, alt: string, width?: string): string {
  const widthAttr = width ? ` width="${width}"` : ''

  return [
    '<picture>',
    `  <source media="(prefers-color-scheme: dark)" srcset="charts/${filename}-dark.svg">`,
    `  <img${widthAttr} alt="${alt}" src="charts/${filename}.svg">`,
    '</picture>',
  ].join('\n')
}

function generateSection(caseId: string, caseData: CaseData): string {
  const series = collectSeries(caseData.results)
  if (series.length === 0) return ''

  const ns = [
    ...new Set(series.flatMap((s) => Object.keys(s.byN).map(Number))),
  ].sort((a, b) => a - b)

  const hasMemory = series.some((s) =>
    Object.values(s.byN).some((r) => r.heapAvg != null && r.heapAvg >= 0)
  )

  const lines = []

  lines.push(`## ${caseData.label || caseId}`)
  lines.push('')

  if (caseData.description) {
    lines.push(caseData.description)
    lines.push('')
  }

  // --- Charts ---
  lines.push(
    caseCharts(caseId, caseData)
      .map((chart) => pictureMarkup(chart.filename, chart.alt, chart.width))
      .join('\n')
  )
  lines.push('')

  // --- Summary table ---
  const vdomSeries = series.find((s) => s.mode === 'vdom')
  const vaporSeries = series.find((s) => s.mode === 'vapor')
  const showFactor = series.length === 2 && vdomSeries && vaporSeries

  const header = ['N']
  for (const s of series) header.push(`Time — ${s.name}`)
  if (showFactor) header.push('vapor / vdom')
  if (hasMemory) {
    for (const s of series) header.push(`Memory — ${s.name}`)
  }

  lines.push(`| ${header.join(' | ')} |`)
  lines.push(`| ${header.map(() => '---').join(' | ')} |`)

  for (const n of ns) {
    const row = [String(n)]

    for (const s of series) {
      const r = s.byN[String(n)]
      row.push(r ? `${fmtMs(r.mean)} (±${r.rme.toFixed(1)}%)` : '-')
    }

    if (showFactor) {
      const vd = vdomSeries.byN[String(n)]
      const va = vaporSeries.byN[String(n)]
      row.push(
        vd && va && vd.mean > 0 ? `×${(va.mean / vd.mean).toFixed(2)}` : '-'
      )
    }

    if (hasMemory) {
      for (const s of series) {
        const r = s.byN[String(n)]
        row.push(r ? fmtBytes(r.heapAvg) : '-')
      }
    }

    lines.push(`| ${row.join(' | ')} |`)
  }

  lines.push('')

  // --- Details ---
  lines.push('<details>')
  lines.push('<summary>Details</summary>')
  lines.push('')

  const detailHeader = [
    '',
    'N',
    'hz (ops/s)',
    'Mean',
    'Median',
    'Min',
    'Max',
    'p75',
    'p99',
    'SD',
    'RME',
    'Samples',
  ]
  lines.push(`| ${detailHeader.join(' | ')} |`)
  lines.push(`| ${detailHeader.map(() => '---').join(' | ')} |`)

  for (const s of series) {
    for (const n of ns) {
      const r = s.byN[String(n)]
      if (!r) continue
      lines.push(
        `| ${[
          s.name,
          String(n),
          r.hz.toFixed(2),
          fmtMs(r.mean),
          fmtMs(r.median),
          fmtMs(r.min),
          fmtMs(r.max),
          fmtMs(r.p75),
          fmtMs(r.p99),
          fmtMs(r.sd),
          `±${r.rme.toFixed(2)}%`,
          String(r.samples),
        ].join(' | ')} |`
      )
    }
  }

  lines.push('')
  lines.push('</details>')
  lines.push('')

  return lines.join('\n')
}

export function generateReport(): string {
  const { environment, cases } = readBenchResults()

  const sections = []

  sections.push('# Benchmark Results')
  sections.push('')
  sections.push(
    'Real browser measurements (Playwright + Chromium, production mode, Vue ' +
      '3.6 runtime) of Vueform rendering performance as the number of ' +
      'elements N grows. Each case runs in both vdom and vapor mode.'
  )
  sections.push('')

  const allTimestamps = Object.values(cases)
    .flatMap((caseData) => Object.values(caseData.results || {}))
    .flatMap((byN) => Object.values(byN).map((r) => r.timestamp))
    .filter((t): t is number => !!t)

  if (allTimestamps.length > 0) {
    sections.push(`*Last updated: ${fmtDate(Math.max(...allTimestamps))}*`)
    sections.push('')
  }

  if (environment) {
    const parts = [
      environment.cpu,
      environment.ramBytes
        ? `${Math.round(environment.ramBytes / 1024 ** 3)} GB RAM`
        : null,
      environment.os,
      environment.browser
        ? `${environment.browser}${environment.headless ? ' (headless)' : ''}`
        : null,
      environment.vue ? `Vue ${environment.vue}` : null,
      environment.vueform ? `Vueform ${environment.vueform}` : null,
    ].filter(Boolean)

    sections.push(`*Environment: ${parts.join(' · ')}*`)
    sections.push('')
  }

  for (const [caseId, caseData] of orderedCases(cases)) {
    sections.push(generateSection(caseId, caseData))
  }

  const file = resolve(resultsDir, 'BENCHMARKS.md')
  fs.writeFileSync(file, sections.join('\n'))
  return file
}

const isMain =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  generateReport()
  console.log('✓ BENCHMARKS.md generated')
}
