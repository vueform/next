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
}

export default class BenchJsonReporter implements Reporter {
  onTestRunEnd(testModules: ReadonlyArray<TestModule>) {
    const file = process.env.BENCH_OUTPUT_JSON
    if (!file) return

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
            })
          }
        }
      }
    }

    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, JSON.stringify({ benchmarks }, null, 2))
  }
}
