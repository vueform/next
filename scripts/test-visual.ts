/**
 * Monorepo visual-test orchestrator (`pnpm test:visual`).
 *
 * Without flags, runs every package's own `test:visual` script (alphabetical);
 * packages without one are simply not in the queue. Selection flags work like
 * the test orchestrator's — `--core`, `--pv`, `--adapters`. `--update` (or
 * Playwright's own `--update-snapshots`/`-u`) regenerates the committed
 * screenshot baselines, and `--grep=…`/`-g=…` narrows the cases; both are
 * forwarded to each package. Durations are persisted in
 * `node_modules/.vueform/times.json`.
 *
 * A failing package dumps Playwright's output (with the diff artifact paths)
 * and stops the queue; successful output is not replayed.
 */
import { join } from 'node:path'
import { outputDir, runQueue, selectTasks } from './runner'
import { testVisualTasks } from './tasks'

const DEFAULT_MS = 120_000

const args = process.argv.slice(2)
// --resume: continue a previously failed run from its failed task.
const resume = args.includes('--resume')
const forwarded = (arg: string) =>
  arg === '--update' ||
  arg === '--update-snapshots' ||
  arg === '-u' ||
  arg.startsWith('--grep') ||
  arg.startsWith('-g')
const passthrough = args
  .filter(forwarded)
  // `--update` is this orchestrator's spelling of Playwright's flag.
  .map((arg) => (arg === '--update' ? '--update-snapshots' : arg))
const selectors = args.filter((arg) => arg !== '--resume' && !forwarded(arg))

runQueue(selectTasks(testVisualTasks(passthrough), selectors), {
  resume: {
    path: join(outputDir, 'test-visual-state.json'),
    key: JSON.stringify({ selectors, passthrough }),
    use: resume,
  },
  timesScope: 'test-visual',
  defaultMs: () => DEFAULT_MS,
  verb: 'visually testing',
  doneVerb: 'Visually tested',
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
