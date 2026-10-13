/**
 * Monorepo build (`pnpm build`): one live row per buildable package (tier
 * order: utils → core → adapters → plugins), each row running its vp task
 * (`vpr :build:<dir>`), so vite-plus caching fully applies — warm rows
 * complete instantly. Selection flags work as before (`--core`, `--pv`,
 * `--adapters`). Output goes to `.vueform/build/logs`; failures end with an
 * error-log link.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// `./runner` re-exports the orchestrator from @vueform/utils, which resolves
// to its DIST — absent on a fresh checkout (CI). Warm it here (vp-cached,
// instant on a warm hit) before the dynamic imports below; the GUI's own
// utils row then replays from cache.
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)
const bootstrap = spawnSync('pnpm', ['exec', 'vpr', ':build:utils'], {
  cwd: repoRoot,
  encoding: 'utf8',
})
if (bootstrap.status !== 0) {
  console.error(bootstrap.stdout + bootstrap.stderr)
  process.exit(bootstrap.status ?? 1)
}

async function main(): Promise<void> {
  const { runGui } = await import('./gui')
  const { discoverPackageTasks, selectTasks, tierSort } = await import(
    './runner'
  )

  const tasks = tierSort(
    selectTasks(discoverPackageTasks('build'), process.argv.slice(2))
  )

  const ok = await runGui({
    title: 'Build',
    scope: 'build',
    rows: tasks.map((task) => ({
      name: task.timeKey,
      cmd: 'pnpm',
      args: ['exec', 'vpr', `:build:${task.id}`],
    })),
  })
  if (!ok) process.exit(1)
}

void main()
