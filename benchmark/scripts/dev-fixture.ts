/**
 * DEV ONLY — writes a synthetic full-grid results file (every case × mode ×
 * sweep N, values modeled on the docs' published numbers) so the chart
 * generator and the docs pipeline can be exercised without running the
 * multi-minute real sweep. Never run this before a real `pnpm bench` — it
 * overwrites results/json/benchmarks.json with fabricated data.
 */
import fs from 'node:fs'
import path from 'node:path'
import { CASES, MODES, SWEEP } from './cases'
import { generateCharts } from './charts'
import { RESULTS_JSON } from './lib'

const timestamp = Math.floor(Date.now() / 1000)

const model: Record<
  string,
  Record<string, (n: number) => { mean: number; heapAvg?: number }>
> = {
  'render-text': {
    vdom: (n) => ({ mean: 15 + 0.53 * n, heapAvg: 126_000 * n }),
    vapor: (n) => ({ mean: 15 + 0.535 * n, heapAvg: 124_000 * n }),
  },
  'render-steps': {
    vdom: (n) => ({ mean: 12 + 0.25 * n, heapAvg: 83_000 * n }),
    vapor: (n) => ({ mean: 12 + 0.245 * n, heapAvg: 81_000 * n }),
  },
  'input-text': {
    vdom: () => ({ mean: 0.04 }),
    vapor: () => ({ mean: 0.035 }),
  },
  'input-text-vmodel': {
    vdom: (n) => ({ mean: 0.01 + 0.0006 * n }),
    vapor: (n) => ({ mean: 0.01 + 0.0004 * n }),
  },
  'update-all': {
    vdom: (n) => ({ mean: 0.0139 * n }),
    vapor: (n) => ({ mean: 0.00656 * n }),
  },
}

const results: Record<string, unknown> = {}

for (const benchCase of CASES) {
  const perMode: Record<string, Record<string, unknown>> = {}

  for (const mode of MODES) {
    perMode[mode] = Object.fromEntries(
      SWEEP.map((n) => {
        const { mean, heapAvg } = model[benchCase.id][mode](n)
        // ±2% deterministic wiggle so the lines look like measurements.
        const wiggle = 1 + 0.02 * Math.sin(n * 7 + (mode === 'vdom' ? 1 : 2))
        return [
          n,
          {
            mean: mean * wiggle,
            ...(benchCase.memory ? { heapAvg } : {}),
            timestamp,
          },
        ]
      })
    )
  }

  results[benchCase.id] = {
    label: benchCase.label,
    description: benchCase.description,
    results: perMode,
  }
}

results.environment = {
  cpu: 'Synthetic (placeholder)',
  ramBytes: 16 * 1024 ** 3,
  os: 'macOS 0.0',
  browser: 'Chromium 0.0',
  vue: '3.6.0-rc.5',
  vueform: '2.0.0-alpha.1',
}

fs.mkdirSync(path.dirname(RESULTS_JSON), { recursive: true })
fs.writeFileSync(RESULTS_JSON, JSON.stringify(results, null, 2) + '\n')
console.log('[bench] synthetic fixture →', RESULTS_JSON)

const charts = generateCharts(results as Parameters<typeof generateCharts>[0])
console.log(`[bench] ${charts.length} charts generated`)
