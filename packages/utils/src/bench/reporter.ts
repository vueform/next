/**
 * Custom vitest reporter that writes bench results as JSON to the path in
 * `BENCH_OUTPUT_JSON` — vitest 5 removed `benchmark.outputJson`, so a
 * reporter is the supported way to get machine-readable results. Loaded by
 * `compare.ts` via `--reporter <absolute path>`, including in the reference
 * worktrees (type-only imports, so it runs under any tree's vitest 5).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import type { Reporter, TestModule } from 'vitest/node'

interface BenchEntry {
  name: string
  mean: number
  moe: number
  min: number
  p75: number
}

export default class BenchJsonReporter implements Reporter {
  onTestRunEnd(testModules: ReadonlyArray<TestModule>) {
    // The comparator sets the path; a manual `vitest bench` run without it
    // still persists a timestamped log under the repo's .vueform artifacts.
    const file =
      process.env.BENCH_OUTPUT_JSON ??
      `${process.cwd()}/../../.vueform/bench/logs/manual-${new Date()
        .toISOString()
        .replace(/[:.]/g, '-')}.json`

    const benchmarks: BenchEntry[] = []
    for (const module of testModules) {
      for (const test of module.children.allTests()) {
        for (const group of test.benchmarks()) {
          for (const task of group.tasks) {
            benchmarks.push({
              // group.name is the full test name; the task usually repeats
              // its last segment (single-bench groups).
              name: group.name.endsWith(task.name)
                ? group.name
                : `${group.name} > ${task.name}`,
              mean: task.latency.mean,
              moe: task.latency.moe,
              // The comparator works on `min`: noise (GC, scheduler, thermal)
              // only ever ADDS time, so the per-leg minimum is the most
              // drift-resistant statistic this environment can produce.
              min: task.latency.min,
              p75: (task.latency as any).p75 ?? task.latency.mean,
            })
          }
        }
      }
    }

    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(
      file,
      JSON.stringify({ date: new Date().toISOString(), benchmarks }, null, 2)
    )
    if (!process.env.BENCH_OUTPUT_JSON) {
      console.log(`\n[bench] log: ${file}`)
    }
  }
}
