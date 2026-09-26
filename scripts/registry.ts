/**
 * Registry orchestrator (`pnpm registry`): regenerates the `.registry` folder
 * of every adapter that has a `registry` script (see `@vueform/utils`'s
 * `vf-registry`). Selection flags work like the build orchestrator's — `pnpm
 * registry --pv` narrows to one adapter.
 */
import {
  discoverPackageTasks,
  runQueue,
  selectTasks,
  type Task,
} from './runner'

runQueue(selectTasks(discoverPackageTasks('registry'), process.argv.slice(2)), {
  timesScope: 'registry',
  defaultMs: (_task: Task) => 10_000,
  verb: 'generating registry for',
  doneVerb: 'Generated',
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
