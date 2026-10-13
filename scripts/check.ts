/**
 * Monorepo check (`pnpm check`): one live row per gate — oxlint, stylelint,
 * eslint, fmt, then every typecheck leg (per package + root/node via
 * `:typecheck:root`, docs, benchmark) — each row running its vp task, so
 * vite-plus caching fully applies. Failing rows show their issue count;
 * output goes to `.vueform/check/logs` with an error-log link at the end.
 */
import fs from 'node:fs'
import path from 'node:path'

import {
  countFormatIssues,
  countLintIssues,
  countTsErrors,
  issuesDetail,
  runGui,
  type GuiRow,
} from './gui'
import { discoverPackages, repoRoot } from './runner'

const lintRow = (name: string, task: string): GuiRow => ({
  name,
  cmd: 'pnpm',
  args: ['exec', 'vpr', task],
  summarize: (output, code) => ({
    ...issuesDetail(countLintIssues(output)),
    fail: code !== 0,
  }),
})

const typecheckRow = (name: string, task: string): GuiRow => ({
  name: `typecheck ${name}`,
  cmd: 'pnpm',
  args: ['exec', 'vpr', task],
  summarize: (output, code) => ({
    ...issuesDetail(countTsErrors(output)),
    fail: code !== 0,
  }),
})

const typecheckPackages = discoverPackages().filter(
  (pkg) => pkg.scripts.typecheck
)

const rows: GuiRow[] = [
  lintRow('oxlint', ':oxlint'),
  lintRow('stylelint', ':stylelint'),
  lintRow('eslint', ':eslint'),
  {
    name: 'fmt',
    cmd: 'pnpm',
    args: ['exec', 'vpr', ':fmt:check'],
    summarize: (output, code) => ({
      ...issuesDetail(countFormatIssues(output)),
      fail: code !== 0,
    }),
  },
  ...typecheckPackages.map((pkg) =>
    typecheckRow(pkg.id, `:typecheck:${pkg.id}`)
  ),
  typecheckRow('root', ':typecheck:root'),
  ...(fs.existsSync(path.join(repoRoot, 'docs'))
    ? [typecheckRow('docs', ':typecheck:docs')]
    : []),
  ...(fs.existsSync(path.join(repoRoot, 'benchmark'))
    ? [typecheckRow('benchmark', ':typecheck:benchmark')]
    : []),
]

void runGui({ title: 'Check', scope: 'check', rows, keepGoing: true }).then(
  (ok) => {
    if (!ok) process.exit(1)
  }
)
