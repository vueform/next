/**
 * Assembles the final `core/` + adapter folders in `.vueform/api/` from the scrapers'
 * raw output and refreshes `issues.json` — the closing task of `pnpm extract`
 * (see extract.ts). Takes the same scope flags plus the scraper names that
 * ran.
 */
import { ensureIssueSources } from './lib/issues'
import { assemble, FILES } from './lib/output'
import { parseScope } from './lib/scope'

const { scope, rest } = parseScope(process.argv.slice(2))

const names = rest.length ? rest : [...FILES]

assemble(names, scope)
ensureIssueSources(scope)
