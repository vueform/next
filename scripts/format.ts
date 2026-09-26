/**
 * Monorepo format orchestrator (`pnpm format`, `pnpm format --check`).
 *
 * One prettier task per workspace package plus `root` for everything outside
 * `packages/`. Selection flags work like the build orchestrator's — `--core`,
 * `--pv`, `--adapters`, `--root`.
 *
 * Issue-gathering semantics: every selected target runs even when earlier ones
 * report problems. In check mode any finding fails the run (after all targets);
 * in write mode only syntax errors do.
 */
import { analyzeFormatOutput, formatSummary, formatTotals } from './issues'
import { runQueue, selectTasks } from './runner'
import { formatTasks } from './tasks'

const args = process.argv.slice(2)
const write = !args.includes('--check')
const selectors = args.filter((arg) => arg !== '--check')

const queue = selectTasks(formatTasks(write), selectors).map((task) => ({
  ...task,
  keepGoing: true,
  analyze: analyzeFormatOutput,
  countFixes: write,
}))

runQueue(queue, {
  timesScope: 'format',
  defaultMs: () => 3_000,
  verb: write ? 'formatting' : 'checking format of',
  doneVerb: write ? 'Formatted' : 'Format-checked',
  epilogue: () => formatSummary(write, selectors),
})
  .then(() => {
    const { warns, errors } = formatTotals()
    if (errors > 0 || (!write && warns > 0)) process.exit(1)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
