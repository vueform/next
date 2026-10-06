/**
 * Monorepo autofix orchestrator (`pnpm fix`): per target, oxlint `--fix`,
 * stylelint `--fix`, then oxfmt — one task (and bar) per workspace
 * package plus `root`. Selection flags work like the build orchestrator's —
 * `--core`, `--pv`, `--adapters`, `--root`.
 *
 * Every target runs even when earlier ones report problems; done lines show
 * applied fixes plus remaining warn/error counts, and the exit code is non-zero
 * only when unfixable errors remain.
 */
import { analyzeLintOutput, lintSummary, lintTotals } from './issues'
import { runQueue, selectTasks } from './runner'
import { fixTasks } from './tasks'

const selectors = process.argv.slice(2)

const queue = selectTasks(fixTasks(), selectors).map((task) => ({
  ...task,
  keepGoing: true,
  analyze: analyzeLintOutput,
  countFixes: true,
}))

runQueue(queue, {
  timesScope: 'fix',
  defaultMs: () => 8_000,
  verb: 'fixing',
  doneVerb: 'Fixed',
  epilogue: () => lintSummary(true, selectors),
})
  .then(() => {
    if (lintTotals().errors > 0) process.exit(1)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
