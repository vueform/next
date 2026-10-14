/**
 * Monorepo autofix (`pnpm fix`): one live row per tool — oxlint `--fix`,
 * eslint `--fix`, stylelint `--fix`, then oxfmt — run sequentially over the
 * whole repo (they mutate the same files). Rows show fixed counts when the
 * tool reports them, otherwise remaining issues; the exit code is non-zero
 * only when unfixable errors remain. Output goes to `.vueform/fix/logs`.
 */
import { ensureUtilsDist } from './ensure-utils'
import type { RowResult, RunRow } from './terminal'

ensureUtilsDist()

const { countLintIssues, runRows } = await import('./terminal')

/**
 * Remaining errors fail the row; fixed counts (when the tool prints them)
 * become the status text, falling back to the remaining-issue count.
 */
const fixSummary = (output: string, code: number): RowResult => {
  const fixed = output.match(/(\d+) (?:problems? |issues? )?fixed/i)
  const issues = countLintIssues(output)
  if (fixed) {
    return {
      detail: `${fixed[1]} issues fixed${issues ? ` · ${issues} remain` : ''}`,
      issues,
      fail: code !== 0,
    }
  }
  if (issues)
    return { detail: `${issues} issues remain`, issues, fail: code !== 0 }
  return { fail: code !== 0 }
}

const rows: RunRow[] = [
  {
    name: 'oxlint',
    cmd: 'pnpm',
    args: ['exec', 'vp', 'lint', '.', '--fix', '--fix-suggestions'],
    summarize: fixSummary,
  },
  {
    name: 'eslint',
    cmd: 'pnpm',
    args: ['exec', 'eslint', '**/*.vue', '--fix'],
    summarize: fixSummary,
  },
  {
    name: 'stylelint',
    cmd: 'pnpm',
    args: [
      'exec',
      'stylelint',
      '**/*.{scss,css}',
      '--fix',
      '--allow-empty-input',
    ],
    summarize: fixSummary,
  },
  {
    name: 'fmt',
    cmd: 'pnpm',
    args: ['exec', 'vp', 'fmt', '.'],
  },
]

const ok = await runRows({
  title: 'Fix',
  scope: 'fix',
  rows,
  keepGoing: true,
})
if (!ok) process.exit(1)
