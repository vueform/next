/**
 * Monorepo smoke orchestrator (`pnpm test:smoke`).
 *
 * Without flags, runs every adapter's own `test:smoke` script (alphabetical);
 * packages without one are simply not in the queue. Selection flags work like
 * the test orchestrator's — `--pv`, `--ui`, `--adapters`. The smoke CLI's own
 * flags (cell filters like `--vite`/`--ssr`/`--vapor`, `--tiers=…`,
 * `--skip-pack`, package-manager picks) are forwarded to each adapter — see
 * `pnpm --filter @vueform/ui test:smoke --help`. Durations are persisted in
 * `node_modules/.vueform/times.json`.
 *
 * A failing adapter dumps the smoke harness output and stops the queue;
 * successful output is not replayed.
 */
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { outputDir, runQueue, selectTasks } from './runner'
import { testSmokeTasks } from './tasks'

const DEFAULT_MS = 300_000

const args = process.argv.slice(2)
// --resume: continue a previously failed run from its failed task.
const resume = args.includes('--resume')
const forwarded = (arg: string) =>
  [
    '--vite',
    '--nuxt',
    '--ssr',
    '--spa',
    '--vapor',
    '--vdom',
    '--pnpm',
    '--npm',
    '--yarn',
    '--bun',
    '--skip-pack',
  ].includes(arg) ||
  arg.startsWith('--tiers') ||
  arg.startsWith('--vite-major')
const passthrough = args.filter(forwarded)
const selectors = args.filter((arg) => arg !== '--resume' && !forwarded(arg))

// --help: print the per-adapter smoke CLI's help directly, without the queue
// renderer (which captures output and only dumps it on failure).
if (args.includes('--help')) {
  const [task] = testSmokeTasks(['--help'])
  spawnSync(task.cmd, task.args, { cwd: task.cwd, stdio: 'inherit' })
  process.exit(0)
}

runQueue(selectTasks(testSmokeTasks(passthrough), selectors), {
  resume: {
    path: join(outputDir, 'test-smoke-state.json'),
    key: JSON.stringify({ selectors, passthrough }),
    use: resume,
  },
  timesScope: 'test-smoke',
  defaultMs: () => DEFAULT_MS,
  verb: 'smoke testing',
  doneVerb: 'Smoke tested',
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
