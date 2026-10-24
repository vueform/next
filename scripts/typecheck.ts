/**
 * Root typecheck runner (`pnpm typecheck`): one live row per typecheck leg —
 * every package with a `typecheck` script plus the root, docs and benchmark
 * legs — each row running its cached `:typecheck:<id>` vp task, so dependent
 * builds and vite-plus caching fully apply. Failing rows show their error
 * count; output goes to `.vueform/typecheck/logs` with an error-log link at
 * the end. `--filter <pkg>` / `-F` / `-f` (package name, dir name, bare name
 * or `vueform.alias`, e.g. `pv`) runs a single leg; `root`, `docs` and
 * `benchmark` select the extra legs.
 */
import type { RunRow } from './terminal'

const { countTsErrors, issuesDetail, runRows } = await import('./terminal')
const { extractFilterFlag } = await import('./runner')
const { typecheckLegs } = await import('./typecheck-legs')

const { filter } = extractFilterFlag(process.argv.slice(2))

const rows: RunRow[] = typecheckLegs(filter).map(({ id, task }) => ({
  name: id,
  cmd: 'pnpm',
  args: ['exec', 'vpr', task],
  summarize: (output, code) => ({
    ...issuesDetail(countTsErrors(output)),
    fail: code !== 0,
  }),
}))

const ok = await runRows({
  title: 'Typecheck',
  scope: 'typecheck',
  rows,
  keepGoing: true,
})
if (!ok) process.exit(1)
