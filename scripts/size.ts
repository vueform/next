/**
 * Bundle-size orchestrator (`pnpm size`): runs every package's `size` script
 * (or the ones selected by flags) as a task list with per-package progress
 * bars — the same renderer as `pnpm build` / `pnpm check`. Packages run in
 * dependency-tier order (core → adapters → plugins), so adapter reports embed
 * fresh core numbers.
 *
 * Flags:
 *
 * - `--core`, `--ui`, `--primevue` / `--pv`, `--dompurify`, `--expr-eval`,
 *   `--adapters`, `--plugins` run only the selected packages (default: all)
 * - `--report` only regenerate the README size sections from the existing
 *   size.json files instead of measuring (each package's `size:report`; plain
 *   output, no progress bars — it is near-instant)
 */
import { spawnSync } from 'node:child_process'

import {
  discoverPackageTasks,
  green,
  red,
  runQueue,
  selectTasks,
  tierSort,
  type Task,
} from './runner'

const args = process.argv.slice(2)
const report = args.includes('--report')
const selectors = args.filter((arg) => arg !== '--report')

// In report mode only the packages with a markdown report qualify (core has
// none — its size.json is embedded into the adapter reports).
const script = report ? 'size:report' : 'size'
const queue = tierSort(selectTasks(discoverPackageTasks(script), selectors))

const DEFAULT_MS: Record<string, number> = {
  core: 20_000,
  ui: 25_000,
  primevue: 160_000,
  default: 5_000,
}

if (report) {
  for (const task of queue) {
    console.log(green(`▸ ${task.id}`))
    const result = spawnSync(task.cmd, task.args, {
      cwd: task.cwd,
      stdio: 'inherit',
    })
    if (result.status !== 0) {
      console.error(red(`${task.id} failed.`))
      process.exit(result.status ?? 1)
    }
  }
} else {
  runQueue(queue, {
    timesScope: 'size',
    defaultMs: (task: Task) => DEFAULT_MS[task.id] ?? DEFAULT_MS.default,
    verb: 'measuring',
    doneVerb: 'Measured',
  }).catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
