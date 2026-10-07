/**
 * Prints the issues collected by the last scrape (`.vueform/api/issues.json`). Accepts
 * the same source scope flags as `pnpm extract` (default: all): `--core`,
 * `--adapter=x,y` / `-a=x,y`, `--ui`, `--pv` / `--primevue`.
 */
import { printIssues, scopedIssues } from './lib/issues'
import { parseScope } from './lib/scope'

const { scope, rest } = parseScope(process.argv.slice(2))
if (rest.length) {
  console.error(`Unknown argument(s): ${rest.join(', ')}`)
  process.exit(1)
}

printIssues(scopedIssues(scope))
