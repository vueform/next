/**
 * Regenerates every benchmark chart SVG (light + `-dark` variants) under
 * results/charts from the current results/json/benchmarks.json.
 */
import fs from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chartsDir } from '../../lib/paths'
import { lineChart } from '../lib/line-chart'
import { caseCharts, orderedCases, readBenchResults } from '../lib/results'

export function generateCharts(): string[] {
  const { cases } = readBenchResults()

  fs.mkdirSync(chartsDir, { recursive: true })

  const files: string[] = []

  for (const [caseId, caseData] of orderedCases(cases)) {
    for (const chart of caseCharts(caseId, caseData)) {
      for (const theme of ['light', 'dark'] as const) {
        const suffix = theme === 'dark' ? '-dark' : ''
        const file = resolve(chartsDir, `${chart.filename}${suffix}.svg`)
        fs.writeFileSync(file, lineChart({ ...chart.options, theme }))
        files.push(file)
      }
    }
  }

  return files
}

const isMain =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  const files = generateCharts()
  console.log(`✓ ${files.length} chart SVGs generated`)
}
