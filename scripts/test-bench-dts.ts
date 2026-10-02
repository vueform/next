/**
 * Monorepo type-bench orchestrator (`pnpm test:bench-dts`).
 *
 * Without flags, runs every package's own `test:bench-dts` script
 * (alphabetical); packages without one are simply not in the queue. Selection
 * flags work like the test orchestrator's — `--core`, `--pv`, `--adapters`. The
 * engine flags `--save`, `--compare` and `--runs=N` are forwarded to each
 * package (see `vf-bench-dts` in `@vueform/utils`). Durations are persisted in
 * `node_modules/.vueform/times.json`.
 *
 * Like `pnpm test:bench`, the captured output is replayed after the queue — the
 * measurements are the whole point of the run. Baselines are only written with
 * `--save` (to `node_modules/.vueform/bench-dts.json`, outside git).
 */
import { join } from 'node:path'
import { outputDir, runQueue, selectTasks } from './runner'
import { testBenchDtsTasks } from './tasks'

const DEFAULT_MS = 90_000

const PASSTHROUGH = ['--save', '--compare']

const args = process.argv.slice(2)
// --resume: continue a previously failed run from its failed task.
const resume = args.includes('--resume')
const passthrough = args.filter(
  (arg) => PASSTHROUGH.includes(arg) || arg.startsWith('--runs')
)
const selectors = args.filter(
  (arg) => arg !== '--resume' && !passthrough.includes(arg)
)

runQueue(selectTasks(testBenchDtsTasks(passthrough), selectors), {
  resume: {
    path: join(outputDir, 'test-bench-dts-state.json'),
    key: JSON.stringify({ selectors, passthrough }),
    use: resume,
  },
  timesScope: 'test-bench-dts',
  defaultMs: () => DEFAULT_MS,
  verb: 'measuring types of',
  doneVerb: 'Measured',
  collectNotes: (task, output) => {
    const trimmed = output.trim()
    return trimmed ? `${task.id}:\n${trimmed}` : undefined
  },
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
