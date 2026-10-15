/**
 * Monorepo build (`pnpm build`): one live row per buildable package (tier
 * order: utils → core → adapters → plugins), each row running its vp task
 * (`vpr :build:<dir>`), so vite-plus caching fully applies — warm rows
 * complete instantly. Selection flags work as before (`--core`, `--pv`,
 * `--adapters`). Output goes to `.vueform/build/logs`; failures end with an
 * error-log link.
 */

// `./terminal` and `./runner` re-export from @vueform/utils, which resolves
// to its DIST — absent on a fresh checkout. Build it first there:
// `pnpm exec vpr :build:utils` (CI runs it before any root runner).

const { runRows, stripDisplayFlags } = await import('./terminal')
const { discoverPackageTasks, selectTasks, tierSort } = await import('./runner')

const tasks = tierSort(
  selectTasks(
    discoverPackageTasks('build'),
    stripDisplayFlags(process.argv.slice(2))
  )
)

const ok = await runRows({
  title: 'Build',
  scope: 'build',
  rows: tasks.map((task) => ({
    name: task.timeKey,
    cmd: 'pnpm',
    args: ['exec', 'vpr', `:build:${task.id}`],
  })),
})
if (!ok) process.exit(1)
