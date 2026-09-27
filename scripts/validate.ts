/**
 * Validation orchestrator (`pnpm validate`): runs every adapter's `validate`
 * script (the styles.ts import validation, see utils' validateBuild.ts). Each
 * adapter's output is captured and shown only when it fails — a clean run
 * prints nothing but the closing summary.
 *
 * Flags: `--ui`, `--primevue` / `--pv`, `--adapters` run only the selected
 * adapters (default: every package with a `validate` script).
 */
import { spawnSync } from 'node:child_process'

import {
  discoverPackageTasks,
  green,
  red,
  selectTasks,
  tierSort,
} from './runner'

const queue = tierSort(
  selectTasks(discoverPackageTasks('validate'), process.argv.slice(2))
)

const failed: string[] = []

for (const task of queue) {
  const result = spawnSync(task.cmd, task.args, {
    cwd: task.cwd,
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    failed.push(task.id)
    process.stdout.write(result.stdout)
    process.stderr.write(result.stderr)
  }
}

if (failed.length) {
  console.error(
    red(
      `✗ ${failed.length} of ${queue.length} adapter(s) failed validation: ${failed.join(', ')}`
    )
  )
  process.exit(1)
}
console.log(green(`✓ ${queue.length} adapter(s) validated`))
