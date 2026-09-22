import { test } from 'vitest'

import { defaultRuns, defaultWarmup, type BenchCase } from './case'
import cases from './cases'
import { bench } from './helpers'
import { MODE, mount } from './mount'

const caseFilter = (import.meta as any).env.VITE_BENCH_CASE as string
const nFilter = (import.meta as any).env.VITE_BENCH_N as string

const allowedCases = caseFilter ? caseFilter.split(',') : null

const allowedNs = nFilter
  ? nFilter.split(',').map((value: string) => parseInt(value, 10))
  : null

function resolveCount(
  value: number | ((n: number) => number) | undefined,
  n: number,
  fallback: (n: number) => number
) {
  if (typeof value === 'function') return value(n)
  return value ?? fallback(n)
}

const activeCases = cases.filter(
  (benchCase: BenchCase) => !allowedCases || allowedCases.includes(benchCase.id)
)

// The browser side of the environment record: the config resolves the machine
// facts (CPU, RAM, OS, versions) in node and merges this in as the browser
// version. Emitted per process; the write is idempotent.
test('environment', () => {
  // eslint-disable-next-line no-console
  console.log(
    '@@BENCH_ENV@@ ' + JSON.stringify({ userAgent: navigator.userAgent })
  )
})

for (const benchCase of activeCases) {
  test(`${benchCase.id} (${MODE})`, async () => {
    const ns = allowedNs
      ? benchCase.ns.filter((n) => allowedNs.includes(n))
      : benchCase.ns

    for (const n of ns) {
      const instance = benchCase.setup
        ? await benchCase.setup({ mount, n })
        : undefined

      await bench(
        {
          case: benchCase.id,
          label: benchCase.label,
          description: benchCase.description,
          n,
          mode: MODE,
        },
        {
          runs: resolveCount(benchCase.runs, n, defaultRuns),
          warmup: resolveCount(benchCase.warmup, n, defaultWarmup),
          memory: benchCase.memory ?? true,
          batch: benchCase.batch ?? 1,
        },
        () => benchCase.run({ mount, n, instance })
      )

      instance?.unmount()
    }
  })
}
