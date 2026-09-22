import { nextTick } from 'vue'

/**
 * Optional handle returned by a timed function; cleaned up after each run.
 */
interface RenderResult {
  unmount?: () => void
  container?: HTMLElement
}

/**
 * Identifies a single benchmark measurement: which case, sweep value, library
 * and rendering mode produced it.
 */
export interface BenchMeta {
  case: string
  label: string
  description?: string
  n: number
  mode: string
}

/**
 * A single measurement's metadata plus the computed statistics.
 */
export interface BenchResult extends BenchMeta {
  mean: number
  min: number
  max: number
  median: number
  p75: number
  p99: number
  p995: number
  hz: number
  sd: number
  rme: number
  samples: number
  heapAvg: number
  heapMax: number
  [key: string]: any
}

/**
 * Forces V8 garbage collection when exposed (--js-flags=--expose-gc), keeping
 * heap deltas comparable between runs.
 */
function forceGC() {
  ;(globalThis as any).gc?.()
}

async function readHeap(): Promise<number> {
  const anyPerf = performance as any
  if (typeof anyPerf.measureUserAgentSpecificMemory === 'function') {
    try {
      const r = await anyPerf.measureUserAgentSpecificMemory()
      return r.bytes as number
    } catch {}
  }
  const m = anyPerf.memory
  if (m && typeof m.usedJSHeapSize === 'number') {
    return m.usedJSHeapSize
  }
  return 0
}

function percentile(sorted: number[], p: number) {
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, idx)]
}

function computeStats(times: number[]) {
  const sorted = [...times].sort((a, b) => a - b)
  const n = sorted.length

  const mean = sorted.reduce((a, b) => a + b, 0) / n
  const min = sorted[0]
  const max = sorted[n - 1]
  const median = percentile(sorted, 50)
  const p75 = percentile(sorted, 75)
  const p99 = percentile(sorted, 99)
  const p995 = percentile(sorted, 99.5)

  const hz = 1000 / mean

  const variance =
    n > 1 ? sorted.reduce((sum, t) => sum + (t - mean) ** 2, 0) / (n - 1) : 0
  const sd = Math.sqrt(variance)
  const sem = n > 1 ? sd / Math.sqrt(n) : 0
  const moe = sem * 1.96
  const rme = mean > 0 ? (moe / mean) * 100 : 0

  return {
    mean,
    min,
    max,
    median,
    p75,
    p99,
    p995,
    hz,
    sd,
    sem,
    rme,
    samples: n,
  }
}

function fmtBytes(n: number) {
  if (n < 1024) return `${Math.round(n)} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(2)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(2)} MB`
  return `${(n / 1024 ** 3).toFixed(2)} GB`
}

/**
 * Waits for Vue's reactivity queue plus two animation frames so painted output
 * is included in the timing window.
 */
export async function settle() {
  await nextTick()
  await new Promise(requestAnimationFrame)
  await new Promise(requestAnimationFrame)
}

/**
 * Runs a timed function `runs` times (after `warmup` untimed runs), computes
 * timing statistics and heap deltas, and reports the result via console for the
 * vitest config to persist.
 *
 * @param meta Identification of the measurement (case, n, mode).
 * @param options Run counts, heap recording, and per-run batch size. Timing and
 *   heap results are divided by `batch` so they read as per-operation
 *   averages.
 * @param fn The timed function. May return a mount handle which is cleaned up
 *   after each run.
 */
export async function bench(
  meta: BenchMeta,
  options: { runs: number; warmup: number; memory: boolean; batch?: number },
  fn: () => void | RenderResult | Promise<void | RenderResult>
): Promise<BenchResult> {
  const runsOverride = (import.meta as any).env.VITE_BENCH_RUNS
  const { runs: configRuns, warmup: configWarmup, memory } = options
  const batch = options.batch || 1
  const runs = runsOverride > 0 ? runsOverride : configRuns
  const warmup =
    runsOverride > 0 ? Math.min(configWarmup, runsOverride) : configWarmup
  const times: number[] = []
  const heapDeltas: number[] = []

  for (let i = 0; i < warmup; i++) {
    const result = await fn()
    await settle()
    result?.unmount?.()
    result?.container?.remove?.()
    await settle()
    forceGC()
  }

  for (let i = 0; i < runs; i++) {
    const heapBefore = memory ? await readHeap() : 0

    performance.clearMarks()
    performance.clearMeasures()
    performance.mark('b:s')

    const result = await fn()
    await settle()

    performance.mark('b:e')
    performance.measure('bench', 'b:s', 'b:e')
    const t = performance.getEntriesByName('bench').at(-1)!.duration

    if (memory) {
      const heapAfter = await readHeap()
      heapDeltas.push(Math.max(0, heapAfter - heapBefore) / batch)
    }

    result?.unmount?.()
    result?.container?.remove?.()
    await settle()
    forceGC()

    times.push(t / batch)
  }

  const stats = computeStats(times)
  const heapAvg = memory
    ? heapDeltas.reduce((a, b) => a + b, 0) / heapDeltas.length
    : -1
  const heapMax = memory ? Math.max(...heapDeltas) : -1

  // Absolute heap after the last run's cleanup and GC. Every case runs in the
  // same page, so a value that climbs across sweep points is retained memory
  // (a leak in the library or the harness), not per-run cost.
  forceGC()
  const heapNow = await readHeap()

  const name = `${meta.case} n=${meta.n} (${meta.mode})`
  const line = [
    `[bench] ${name}`,
    `  hz:      ${stats.hz.toFixed(2)} ops/s`,
    `  mean:    ${stats.mean.toFixed(2)} ms`,
    `  median:  ${stats.median.toFixed(2)} ms`,
    `  min:     ${stats.min.toFixed(2)} ms`,
    `  max:     ${stats.max.toFixed(2)} ms`,
    `  p75:     ${stats.p75.toFixed(2)} ms`,
    `  p99:     ${stats.p99.toFixed(2)} ms`,
    `  p99.5:   ${stats.p995.toFixed(2)} ms`,
    `  sd:      ${stats.sd.toFixed(2)} ms`,
    `  rme:     ±${stats.rme.toFixed(2)}%`,
    `  samples: ${stats.samples} (warmup: ${warmup})`,
    ...(memory
      ? [`  heap Δ:  ${fmtBytes(heapAvg)} avg, ${fmtBytes(heapMax)} max`]
      : []),
    `  heap now: ${fmtBytes(heapNow)} (after cleanup + GC)`,
  ].join('\n')

  // eslint-disable-next-line no-console
  console.log('@@BENCH@@\n' + line)

  const result: BenchResult = {
    ...meta,
    ...stats,
    heapAvg,
    heapMax,
  }

  // eslint-disable-next-line no-console
  console.log('@@BENCH_JSON@@ ' + JSON.stringify(result))

  return result
}
