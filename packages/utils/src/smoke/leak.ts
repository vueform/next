/**
 * Post-install leak check. Runs live inside the monorepo, and Node's
 * ancestor `node_modules` walk means an incompletely installed fixture could
 * silently resolve `vue` or an `@vueform/*` package from the workspace root
 * and pass anyway. Locating every direct dependency the way Node would
 * (nearest `node_modules/<name>` walking up from the run dir) and asserting
 * it lives in the run's own tree turns that into a loud tier-0 failure.
 *
 * Directory lookup, not entry resolution: several packages are ESM-only
 * (no `require` condition), so a createRequire-based resolve would throw on
 * perfectly healthy installs.
 */
import path from 'node:path'
import { exists, readJson, SmokeError } from './lib'

/**
 * The nearest `node_modules/<name>` above (and including) `fromDir` — the
 * directory Node's resolution algorithm would use.
 */
function locate(name: string, fromDir: string): string | null {
  let dir = fromDir
  for (;;) {
    const candidate = path.join(dir, 'node_modules', name)
    if (exists(path.join(candidate, 'package.json'))) return candidate

    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

export function leakCheck(runDir: string) {
  const pkg = readJson(path.join(runDir, 'package.json'))
  const names = Object.keys({
    ...pkg.dependencies,
    ...pkg.devDependencies,
  }).filter((name) => name.startsWith('@vueform/') || name === 'vue')

  const own = path.join(runDir, 'node_modules') + path.sep
  const leaks: string[] = []

  for (const name of names) {
    const found = locate(name, runDir)

    if (!found) {
      throw new SmokeError(
        `Leak check: ${name} does not resolve from the run dir at all — install is broken.`
      )
    }

    if (!found.startsWith(own)) leaks.push(`${name} → ${found}`)
  }

  if (leaks.length) {
    throw new SmokeError(
      `Leak check failed — these resolve OUTSIDE the run's own node_modules ` +
        `(the fixture would be testing workspace files, not the tarballs):\n  ${leaks.join('\n  ')}`
    )
  }

  console.log(`[smoke] Leak check passed (${names.length} packages).`)
}
