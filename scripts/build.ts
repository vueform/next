/**
 * Monorepo build orchestrator (`pnpm build`).
 *
 * Without flags, builds every package that has a `build` script, tiered: utils
 * → core → adapters → plugins → anything else. Selection flags narrow the run
 * while keeping that order:
 *
 * - `pnpm build --core --primevue` — by package short name
 * - `pnpm build --pv` — by `vueform.alias`
 * - `pnpm build --adapters` — by `vueform.group`
 *
 * The whole queue is rendered upfront as a task list; the active package shows
 * a progress bar sized by its previous build time, persisted in
 * `.output/times.json` (gitignored). Unknown packages fall back to per-group
 * defaults. Build output is captured and only shown when a build fails.
 */
import { join } from 'node:path'
import { outputDir, runQueue, selectTasks, type Task } from './runner'
import { buildTasks } from './tasks'

const DEFAULT_MS: Record<string, number> = {
  adapters: 10_000,
  plugins: 3_000,
  default: 5_000,
}

const args = process.argv.slice(2)
// --resume: continue a previously failed run from its failed task.
const resume = args.includes('--resume')
const selectors = args.filter((arg) => arg !== '--resume')

runQueue(selectTasks(buildTasks(), selectors), {
  resume: {
    path: join(outputDir, 'build-state.json'),
    key: JSON.stringify({ selectors }),
    use: resume,
  },
  timesScope: 'build',
  defaultMs: (task: Task) =>
    DEFAULT_MS[task.group ?? 'default'] ?? DEFAULT_MS.default,
  verb: 'building',
  doneVerb: 'Built',
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
