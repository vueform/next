/**
 * Monorepo check (`pnpm check`): one live row per gate — oxlint, stylelint,
 * eslint, lslint, fmt, then every typecheck leg (per package + root/node via
 * `:typecheck:root`, docs, benchmark) — each row running its vp task, so
 * vite-plus caching fully applies. `--filter <pkg>` / `-F` / `-f` (package
 * name, dir name, bare name or `vueform.alias`, e.g. `pv`) narrows the
 * typecheck legs to that one package while the lint and fmt gates still run
 * in full. Failing rows show their issue count; output goes to
 * `.vueform/check/logs` with an error-log link at the end.
 */
import type { RunRow } from './terminal'

const {
  countFormatIssues,
  countLintIssues,
  countTsErrors,
  issuesDetail,
  runRows,
} = await import('./terminal')
const { extractFilterFlag } = await import('./runner')
const { typecheckLegs } = await import('./typecheck-legs')

const { filter } = extractFilterFlag(process.argv.slice(2))

const lintRow = (name: string, task: string): RunRow => ({
  name,
  cmd: 'pnpm',
  args: ['exec', 'vpr', task],
  summarize: (output, code) => ({
    ...issuesDetail(countLintIssues(output)),
    fail: code !== 0,
  }),
})

const typecheckRow = (name: string, task: string): RunRow => ({
  name: `typecheck ${name}`,
  cmd: 'pnpm',
  args: ['exec', 'vpr', task],
  summarize: (output, code) => ({
    ...issuesDetail(countTsErrors(output)),
    fail: code !== 0,
  }),
})

const rows: RunRow[] = [
  lintRow('oxlint', ':oxlint'),
  lintRow('stylelint', ':stylelint'),
  lintRow('eslint', ':eslint'),
  lintRow('lslint', ':lslint'),
  {
    name: 'fmt',
    cmd: 'pnpm',
    args: ['exec', 'vpr', ':fmt:check'],
    summarize: (output, code) => ({
      ...issuesDetail(countFormatIssues(output)),
      fail: code !== 0,
    }),
  },
  ...typecheckLegs(filter).map(({ id, task }) => typecheckRow(id, task)),
]

const ok = await runRows({
  title: 'Check',
  scope: 'check',
  rows,
  keepGoing: true,
})
if (!ok) process.exit(1)
