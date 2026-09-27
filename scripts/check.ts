/**
 * Monorepo typecheck orchestrator (`pnpm check`).
 *
 * Without flags, runs every package's own `check` script (alphabetical), then
 * the two root-level programs:
 *
 * - `root` — `vue-tsc` over the root tsconfig (everything outside packages that
 *   needs the DOM settings; docs later)
 * - `node` — `tsc` over `tsconfig.node.json` (scripts, config files)
 *
 * Selection flags work like the build orchestrator's — `--core`, `--pv`,
 * `--adapters`, plus `--root` and `--node` for the root-level programs.
 * Durations are persisted in `node_modules/.vueform/times.json`.
 */
import { join } from 'node:path'
import { outputDir, runQueue, selectTasks, type Task } from './runner'
import { checkTasks } from './tasks'

const DEFAULT_MS: Record<string, number> = {
  adapters: 10_000,
  plugins: 3_000,
  default: 5_000,
}

const args = process.argv.slice(2)
// --resume: continue a previously failed run from its failed task.
const resume = args.includes('--resume')
const selectors = args.filter((arg) => arg !== '--resume')

runQueue(selectTasks(checkTasks(), selectors), {
  resume: {
    path: join(outputDir, 'check-state.json'),
    key: JSON.stringify({ selectors }),
    use: resume,
  },
  timesScope: 'check',
  defaultMs: (task: Task) =>
    DEFAULT_MS[task.group ?? 'default'] ?? DEFAULT_MS.default,
  verb: 'typechecking',
  doneVerb: 'Typechecked',
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
