/**
 * Dist type-test orchestrator (`pnpm test:dts-dist`).
 *
 * Runs every package's `test:dts-dist` script — type tests that resolve the
 * package (and its workspace dependencies) through the published `exports` maps
 * to the **built dist types**, not source. Unlike `pnpm test:dts`, this gate
 * requires a prior `pnpm build`: it verifies what a consumer of the published
 * package sees (module-augmentation rewrites, shorthand-injected props,
 * exports-map type targets), which makes it the fast d.ts gate for toolchain
 * changes.
 *
 * Selection flags work like the other orchestrators' (`--core`, `--pv`);
 * `--resume` continues a previously failed run.
 */
import { join } from 'node:path'
import { outputDir, runQueue, selectTasks } from './runner'
import { testDtsDistTasks } from './tasks'

const DEFAULT_MS = 10_000

const args = process.argv.slice(2)
const resume = args.includes('--resume')
const selectors = args.filter((arg) => arg !== '--resume')

runQueue(selectTasks(testDtsDistTasks(), selectors), {
  resume: {
    path: join(outputDir, 'test-dts-dist-state.json'),
    key: JSON.stringify({ selectors }),
    use: resume,
  },
  timesScope: 'test-dts-dist',
  defaultMs: () => DEFAULT_MS,
  verb: 'typechecking',
  doneVerb: 'Typechecked',
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
