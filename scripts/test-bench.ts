/**
 * Monorepo benchmark orchestrator (`pnpm test:bench`).
 *
 * Without flags, runs every package's own `test:bench` script (alphabetical);
 * packages without one are simply not in the queue. Selection flags work like
 * the test orchestrator's — `--core`, `--pv`, `--adapters`. Durations are
 * persisted in `node_modules/.vueform/times.json`.
 *
 * Nothing is persisted, but unlike `pnpm test:dts` the captured output is
 * replayed after the queue — the benchmark numbers are the whole point of the
 * run, and the task-list renderer can't print into the block mid-run.
 */
import { join } from 'node:path'
import { outputDir, runQueue, selectTasks } from './runner'
import { testBenchTasks } from './tasks'

const DEFAULT_MS = 30_000

const args = process.argv.slice(2)
// --resume: continue a previously failed run from its failed task.
const resume = args.includes('--resume')
const selectors = args.filter((arg) => arg !== '--resume')

runQueue(selectTasks(testBenchTasks(), selectors), {
  resume: {
    path: join(outputDir, 'test-bench-state.json'),
    key: JSON.stringify({ selectors }),
    use: resume,
  },
  timesScope: 'test-bench',
  defaultMs: () => DEFAULT_MS,
  verb: 'benchmarking',
  doneVerb: 'Benchmarked',
  collectNotes: (task, output) => {
    const trimmed = output.trim()
    return trimmed ? `${task.id}:\n${trimmed}` : undefined
  },
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
