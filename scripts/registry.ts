/**
 * Registry generation (`pnpm registry`): one live row per adapter with a
 * `registry` script, each row running `vp run --filter <pkg> registry`, so
 * the packages' vp caching applies. Rows end with the item count from the
 * generator's `[registry] wrote … (N items)` line. utils' dist is ensured
 * upfront (vp-cached, instant when warm). Selection flags work as before
 * (`--pv`, `--ui`). Output goes to `.vueform/registry/logs`.
 */
import { spawnSync } from 'node:child_process'

import { runGui } from './gui'
import { discoverPackageTasks, repoRoot, selectTasks } from './runner'

const tasks = selectTasks(
  discoverPackageTasks('registry'),
  process.argv.slice(2)
)

// The generator runs from utils' dist — make sure it is current.
const build = spawnSync('pnpm', ['exec', 'vpr', ':build:utils'], {
  cwd: repoRoot,
  encoding: 'utf8',
})
if (build.status !== 0) {
  console.error(build.stdout + build.stderr)
  process.exit(build.status ?? 1)
}

void runGui({
  title: 'Registry',
  scope: 'registry',
  rows: tasks.map((task) => ({
    name: task.timeKey,
    cmd: 'pnpm',
    args: [
      'exec',
      'vp',
      'run',
      '--filter',
      `./packages/${task.id}`,
      'registry',
    ],
    summarize: (output, code) => {
      const items = output.match(/\((\d+) items\)/)
      return {
        detail: items ? `${items[1]} registry items built` : '',
        fail: code !== 0,
      }
    },
  })),
}).then((ok) => {
  if (!ok) process.exit(1)
})
