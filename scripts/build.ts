/**
 * Monorepo build (`pnpm build`): one live row per buildable package (tier
 * order: utils → core → adapters → plugins), each row running its vp task
 * (`vpr :build:<dir>`), so vite-plus caching fully applies — warm rows
 * complete instantly. Selection flags work as before (`--core`, `--pv`,
 * `--adapters`). Output goes to `.vueform/build/logs`; failures end with an
 * error-log link.
 */
import { runGui } from './gui'
import { discoverPackageTasks, selectTasks, tierSort } from './runner'

const tasks = tierSort(
  selectTasks(discoverPackageTasks('build'), process.argv.slice(2))
)

void runGui({
  title: 'Build',
  scope: 'build',
  rows: tasks.map((task) => ({
    name: task.timeKey,
    cmd: 'pnpm',
    args: ['exec', 'vpr', `:build:${task.id}`],
  })),
}).then((ok) => {
  if (!ok) process.exit(1)
})
