/**
 * Validation orchestrator (`pnpm validate`): runs every adapter's `validate`
 * script (the styles.ts import validation, see utils' validateBuild.ts) as a
 * task list with per-adapter progress bars — the same renderer as `pnpm
 * build` / `pnpm check`. The chunks are compiled from the scss sources, so no
 * build is needed first; each adapter's output is captured and dumped only on
 * failure.
 *
 * Flags: `--ui`, `--primevue` / `--pv`, `--adapters` run only the selected
 * adapters (default: every package with a `validate` script).
 */
import {
  discoverPackageTasks,
  runQueue,
  selectTasks,
  tierSort,
  type Task,
} from './runner'

const queue = tierSort(
  selectTasks(discoverPackageTasks('validate'), process.argv.slice(2))
)

runQueue(queue, {
  timesScope: 'validate',
  defaultMs: (_task: Task) => 5_000,
  verb: 'validating',
  doneVerb: 'Validated',
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
