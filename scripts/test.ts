/**
 * Monorepo test orchestrator (`pnpm test`).
 *
 * Without flags, runs every package's own `test` script (alphabetical);
 * packages without one are simply not in the queue. Selection flags work like
 * the build orchestrator's — `--core`, `--pv`, `--adapters`. Durations are
 * persisted in `.output/times.json` (gitignored).
 *
 * The runner spawns without a TTY, so vitest runs in single-pass mode rather
 * than watch mode. Console output captured during tests is aggregated and
 * reported after the queue (see `warns.ts`), with the full messages in
 * `.output/tests.md`.
 */
import { join } from 'node:path'
import { outputDir, runQueue, selectTasks, type Task } from './runner'
import { testTasks } from './tasks'
import { collectWarns, warnSummary } from './warns'

const DEFAULT_MS: Record<string, number> = {
  adapters: 10_000,
  plugins: 5_000,
  default: 20_000,
}

const args = process.argv.slice(2)
// --resume: continue a previously failed run from its failed task.
const resume = args.includes('--resume')
const selectors = args.filter((arg) => arg !== '--resume')

runQueue(selectTasks(testTasks(), selectors), {
  resume: {
    path: join(outputDir, 'test-state.json'),
    key: JSON.stringify({ selectors }),
    use: resume,
  },
  timesScope: 'test',
  defaultMs: (task: Task) =>
    DEFAULT_MS[task.group ?? 'default'] ?? DEFAULT_MS.default,
  verb: 'testing',
  doneVerb: 'Tested',
  collectNotes: collectWarns,
  epilogue: warnSummary,
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
