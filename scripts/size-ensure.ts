/**
 * Measures the sized packages whose git-tracked `size.json` is missing — and
 * only those (`vpr :size:ensure`, a dependency of `:docs:gen`). Packages with
 * a size.json present are trusted as-is; re-measuring existing results is
 * `pnpm size`'s job. Runs the measurements directly (`pnpm --filter <pkg> run
 * size`, tier order so core's json exists before an adapter report embeds
 * it), never through a nested vp invocation — the `:size:ensure` task's
 * `dependsOn` materializes the dists the measurement bundles.
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const { discoverPackageTasks, tierSort } = await import('./runner')

const missing = tierSort(discoverPackageTasks('size')).filter(
  (task) => !existsSync(join(task.cwd, 'size.json'))
)

if (missing.length === 0) {
  console.log('Every sized package has its size.json — nothing to measure.')
  process.exit(0)
}

for (const task of missing) {
  console.log(`${task.timeKey} has no size.json — measuring.`)
  const result = spawnSync(task.cmd, task.args, {
    cwd: task.cwd,
    stdio: 'inherit',
  })
  if (result.status !== 0) {
    console.error(`${task.id}: size measurement failed.`)
    process.exit(result.status ?? 1)
  }
}
