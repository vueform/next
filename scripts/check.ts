/**
 * Monorepo check (`pnpm check`): one live row per gate — oxlint, stylelint,
 * eslint, ls-lint, fmt, then every typecheck leg (per package + root/node via
 * `:typecheck:root`, docs, benchmark) — each row running its vp task, so
 * vite-plus caching fully applies. Failing rows show their issue count;
 * output goes to `.vueform/check/logs` with an error-log link at the end.
 */
import fs from 'node:fs'
import path from 'node:path'

import { ensureUtilsDist } from './ensure-utils'
import type { RunRow } from './terminal'

ensureUtilsDist()

async function main(): Promise<void> {
  const {
    countFormatIssues,
    countLintIssues,
    countTsErrors,
    issuesDetail,
    runRows,
  } = await import('./terminal')
  const { discoverPackages, repoRoot } = await import('./runner')

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

  const typecheckPackages = discoverPackages().filter(
    (pkg) => pkg.scripts.typecheck
  )

  const rows: RunRow[] = [
    lintRow('oxlint', ':oxlint'),
    lintRow('stylelint', ':stylelint'),
    lintRow('eslint', ':eslint'),
    lintRow('ls-lint', ':ls-lint'),
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

  const ok = await runRows({
    title: 'Check',
    scope: 'check',
    rows,
    keepGoing: true,
  })
  if (!ok) process.exit(1)
}

void main()
