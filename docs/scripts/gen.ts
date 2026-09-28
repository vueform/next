/**
 * Docs generator orchestrator (`pnpm gen` in docs/, `pnpm docs:gen` at the
 * root): runs every docs generator (or the ones selected by flags) as a single
 * cumulative progress bar naming the running generator — the same renderer as
 * `pnpm build` / `pnpm extract`, in its `singleBar` mode. The generators' own
 * output stays captured (dumped only on failure).
 *
 * Structural json extraction (blueprints, classes, components, composables,
 * contexts, helpers, locales, modules, tokens) lives in scripts/api-extractor
 * and writes to `.api/` at the monorepo root — run `pnpm extract` there first
 * when those are stale. The generators here only produce docs content from
 * those jsons.
 *
 * Selector flags (default: every generator): `--json-types`, `--guide-tokens`,
 * … or the short aliases `--types`, `--tokens`, `--locales`, `--composables`,
 * `--helpers`, `--keywords`, `--components` — combinable (`pnpm gen --types
 * --keywords`). Selection keeps the canonical order, so generators reading
 * earlier output always run after their inputs.
 */
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import { runQueue, selectTasks, type Task } from '../../scripts/runner'

const DOCS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)

/**
 * Canonical order: generators reading the pages earlier ones write close the
 * queue. Selectable by the generator script's name or its short alias.
 */
const GENERATORS: { id: string; alias: string }[] = [
  { id: 'guide-tokens', alias: 'tokens' },
  { id: 'guide-locales', alias: 'locales' },
  { id: 'guide-code-splitting', alias: 'code-splitting' },
  { id: 'guide-benchmark', alias: 'benchmark' },
  { id: 'reference-composables', alias: 'composables' },
  { id: 'reference-helpers', alias: 'helpers' },
  { id: 'reference-components', alias: 'components' },
  { id: 'json-types', alias: 'types' },
  { id: 'json-keywords', alias: 'keywords' },
]

const DEFAULT_MS: Record<string, number> = {
  'json-types': 4_000,
  'reference-components': 1_500,
  default: 1_000,
}

const queue: Task[] = GENERATORS.map(({ id, alias }) => ({
  id,
  timeKey: id,
  aliases: [alias],
  cwd: DOCS_DIR,
  cmd: 'pnpm',
  args: [
    'exec',
    'tsx',
    path.join(DOCS_DIR, 'scripts', 'generators', `${id}.ts`),
  ],
}))

runQueue(selectTasks(queue, process.argv.slice(2)), {
  timesScope: 'docs:gen',
  defaultMs: (task: Task) => DEFAULT_MS[task.id] ?? DEFAULT_MS.default,
  verb: 'generating',
  doneVerb: 'Generated',
  singleBar: { label: 'docs gen' },
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
