/**
 * Assembles the final `core/` + adapter folders in `.vueform/api/` from the
 * scrapers' raw output — the closing task of `pnpm api` (see
 * ../api.ts). Takes the scope flags plus the scraper names that ran.
 */
import { assemble, FILES } from './lib/output'
import { parseScope } from './lib/scope'

const { scope, rest } = parseScope(process.argv.slice(2))

const names = rest.length ? rest : [...FILES]

assemble(names, scope)
