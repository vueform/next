/**
 * Monorepo type-test orchestrator (`pnpm test:dts`).
 *
 * Without flags, runs every package's own `test:dts` script (alphabetical);
 * packages without one are simply not in the queue. Selection flags work like
 * the test orchestrator's — `--core`, `--pv`, `--adapters`. Durations are
 * persisted in `node_modules/.vueform/times.json`.
 *
 * Unlike `pnpm test`, captured console output is not aggregated or persisted —
 * type tests produce none worth keeping.
 */
import { join } from 'node:path'

import { outputDir, runQueue, selectTasks } from './runner'
import { testDtsTasks } from './tasks'

const DEFAULT_MS = 10_000

const args = process.argv.slice(2)
// --resume: continue a previously failed run from its failed task.
const resume = args.includes('--resume')
const selectors = args.filter((arg) => arg !== '--resume')

runQueue(selectTasks(testDtsTasks(), selectors), {
  resume: {
    path: join(outputDir, 'test-dts-state.json'),
    key: JSON.stringify({ selectors }),
    use: resume,
  },
  timesScope: 'test-dts',
  defaultMs: () => DEFAULT_MS,
  verb: 'typechecking',
  doneVerb: 'Typechecked',
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
