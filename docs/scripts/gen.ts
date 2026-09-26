/**
 * Docs generator orchestrator (`pnpm gen` in docs/, `pnpm docs:gen` at the
 * root): runs every docs generator (or the ones selected by flags) as a task
 * list with per-task progress bars — the same renderer as `pnpm build` / `pnpm
 * extract`. The generators' own output stays captured (dumped only on
 * failure).
 *
 * Structural json extraction (blueprints, classes, components, composables,
 * contexts, helpers, locales, modules, tokens) lives in scripts/api-extractor
 * and writes to `.api/` at the monorepo root — run `pnpm extract` there first
 * when those are stale. The generators here only produce docs content from
 * those jsons.
 *
 * Selector flags (default: every generator): `--types`, `--tokens`,
 * `--locales`, `--composables`, `--helpers`, `--keywords`, `--components` —
 * combinable (`pnpm gen --types --keywords`). Selection keeps the canonical
 * order, so generators reading earlier output (keywords and components read the
 * generated type and reference pages) always run after their inputs.
 */
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import { runQueue, selectTasks, type Task } from '../../scripts/runner'

const DOCS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)

/**
 * Canonical order: keywords and components close the queue because they read
 * the pages the earlier generators write (type pages, reference pages).
 * Selectable by id or by the generator script's file name.
 */
const GENERATORS: { id: string; script: string }[] = [
  { id: 'Type collection', script: 'json-types' },
  { id: 'CSS tokens', script: 'guide-tokens' },
  { id: 'Avalable locales', script: 'guide-locales' },
  // { id: 'code-splitting', script: 'guide-code-splitting' },
  // { id: 'benchmark', script: 'guide-benchmark' },
  { id: 'Composables', script: 'reference-composables' },
  { id: 'Helpers', script: 'reference-helpers' },
  { id: 'Components', script: 'reference-components' },
  { id: 'Keyword list', script: 'json-keywords' },
]

const DEFAULT_MS: Record<string, number> = {
  types: 4_000,
  components: 1_500,
  default: 1_000,
}

const queue: Task[] = GENERATORS.map(({ id, script }) => ({
  id,
  timeKey: id,
  aliases: [script],
  cwd: DOCS_DIR,
  cmd: 'pnpm',
  args: [
    'exec',
    'tsx',
    path.join(DOCS_DIR, 'scripts', 'generators', `${script}.ts`),
  ],
}))

runQueue(selectTasks(queue, process.argv.slice(2)), {
  timesScope: 'docs:gen',
  defaultMs: (task: Task) => DEFAULT_MS[task.id] ?? DEFAULT_MS.default,
  verb: 'generating',
  doneVerb: 'Generated',
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
