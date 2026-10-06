import type { Browser } from 'playwright'

import type { BenchCase, Mode } from './cases'
import { mean } from './stats'

// The evaluate/waitForFunction callbacks below run inside the page; this
// config has no DOM lib, so the page global is declared here instead.
declare const window: { __bench: { run(): Promise<unknown> } }

export interface Sample {
  mean: number
  heapAvg?: number
  timestamp: number
}

interface PageBenchResult {
  duration: number
  iterations: number
}

/**
 * One sweep point: `reps` repetitions of the case at element count `n`, each in
 * a fresh browser context and page so no repetition inherits another's heap,
 * JIT state, or DOM.
 *
 * Memory is a forced-GC heap delta around the page's `run()`: GC twice and
 * settle, read `JSHeapUsedSize`, run, GC twice and settle, read again. The page
 * mounts nothing until `run()` is called, so the baseline sees the idle page.
 */
export async function measurePoint(
  browser: Browser,
  origin: string,
  mode: Mode,
  benchCase: BenchCase,
  n: number,
  overrides: { reps?: number; warmup?: number; iterations?: number } = {}
): Promise<Sample> {
  const reps = overrides.reps ?? benchCase.reps
  const durations: number[] = []
  const heapDeltas: number[] = []

  const query = new URLSearchParams({ case: benchCase.id, n: String(n) })
  const warmup = overrides.warmup ?? benchCase.warmup
  const iterations = overrides.iterations ?? benchCase.iterations
  if (warmup != null) query.set('warmup', String(warmup))
  if (iterations != null) query.set('iterations', String(iterations))

  const url = `${origin}/${mode}/index.html?${query}`

  for (let rep = 0; rep < reps; rep++) {
    const context = await browser.newContext()
    const page = await context.newPage()

    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(String(error)))

    try {
      const cdp = await context.newCDPSession(page)
      await cdp.send('Performance.enable')

      const heapUsed = async (): Promise<number> => {
        await cdp.send('HeapProfiler.collectGarbage')
        await cdp.send('HeapProfiler.collectGarbage')
        await page.waitForTimeout(100)
        const { metrics } = await cdp.send('Performance.getMetrics')
        return metrics.find((m) => m.name === 'JSHeapUsedSize')?.value ?? 0
      }

      await page.goto(url, { waitUntil: 'load' })
      await page.waitForFunction(() => '__bench' in window)

      const before = benchCase.memory ? await heapUsed() : 0

      const result = (await page.evaluate(() =>
        window.__bench.run()
      )) as PageBenchResult

      if (errors.length) {
        throw new Error(`page errors: ${errors.join('; ')}`)
      }

      durations.push(result.duration)

      if (benchCase.memory) {
        heapDeltas.push((await heapUsed()) - before)
      }
    } finally {
      await context.close()
    }
  }

  const sample: Sample = {
    mean: mean(durations),
    timestamp: Math.floor(Date.now() / 1000),
  }

  if (benchCase.memory) {
    sample.heapAvg = mean(heapDeltas)
  }

  return sample
}
