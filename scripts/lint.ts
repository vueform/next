/**
 * Monorepo lint orchestrator (`pnpm lint`, `pnpm lint --fix`).
 *
 * One task per workspace package (oxlint + stylelint over its directory) plus
 * `root` for everything outside `packages/`. Selection flags work like the
 * build orchestrator's — `--core`, `--pv`, `--adapters`, `--root`.
 *
 * Issue-gathering semantics: every selected target runs even when earlier ones
 * report problems, so one run collects everything. Warn/error counts land on
 * each done line; errors are written to `node_modules/.vueform/lint-errors.md`;
 * the exit code is non-zero only when errors remain.
 */
import { analyzeLintOutput, lintSummary, lintTotals } from './issues'
import { runQueue, selectTasks } from './runner'
import { lintTasks } from './tasks'

const args = process.argv.slice(2)
const fix = args.includes('--fix')
const selectors = args.filter((arg) => arg !== '--fix')

const queue = selectTasks(lintTasks(fix), selectors).map((task) => ({
  ...task,
  keepGoing: true,
  analyze: analyzeLintOutput,
  countFixes: fix,
}))

runQueue(queue, {
  timesScope: 'lint',
  defaultMs: () => 5_000,
  verb: 'linting',
  doneVerb: 'Linted',
  epilogue: () => lintSummary(fix, selectors),
})
  .then(() => {
    if (lintTotals().errors > 0) process.exit(1)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
