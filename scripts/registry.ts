/**
 * Registry generation (`pnpm registry`): one live row per adapter with a
 * `registry` script, each row running `vp run --filter <pkg> registry`, so
 * the packages' vp caching applies. Rows end with the item count from the
 * generator's `[registry] wrote … (N items)` line. utils' dist is ensured
 * upfront (vp-cached, instant when warm). Selection flags work as before
 * (`--pv`, `--ui`). Output goes to `.vueform/registry/logs`.
 */
import { ensureUtilsDist } from './ensure-utils'

// The generator (and the orchestrator import below) runs from utils' dist —
// make sure it is current before anything resolves it.
ensureUtilsDist()

const { runRows, stripDisplayFlags } = await import('./terminal')
const { discoverPackageTasks, selectTasks } = await import('./runner')

const tasks = selectTasks(
  discoverPackageTasks('registry'),
  stripDisplayFlags(process.argv.slice(2))
)

const ok = await runRows({
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
    summarize: (output: string, code: number) => {
      const items = output.match(/\((\d+) items\)/)
      return {
        detail: items ? `${items[1]} registry items built` : '',
        fail: code !== 0,
      }
    },
  })),
})
if (!ok) process.exit(1)
