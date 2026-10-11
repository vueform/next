/**
 * Manifest tidier (`pnpm manifests`): normalizes the workspace package.json
 * files — root, `packages/*`, `docs` and `benchmark`. Sorts each `scripts`
 * block alphabetically, and for every `exports` map that carries the `dev`
 * condition (src-world resolution — see @vueform/tsconfig/tsconfig.dom.json)
 * syncs a `publishConfig.exports` copy with those entries stripped, so the
 * published manifest never points at `src/`. pnpm swaps `publishConfig`
 * fields in at pack time. Idempotent — a file is rewritten only when its
 * normalized content differs. Runs after every fmt (the root `fmt` script,
 * the `:fix` task, lint-staged) and on package.json saves in the editor
 * (see .vscode/settings.json).
 *
 * `--check` writes nothing and exits 1 when any manifest is not normalized —
 * the read-only mode behind the `:manifests:check` task that `:check` runs.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)

/** The src-world exports condition stripped from the published exports map. */
const DEV_CONDITION = 'dev'

type Manifest = Record<string, unknown>

const manifestFiles = [
  repoRoot,
  ...fs
    .readdirSync(path.join(repoRoot, 'packages'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(repoRoot, 'packages', entry.name)),
  path.join(repoRoot, 'docs'),
  path.join(repoRoot, 'benchmark'),
]
  .map((dir) => path.join(dir, 'package.json'))
  .filter((file) => fs.existsSync(file))

const sortScripts = (pkg: Manifest) => {
  const scripts = pkg.scripts as Record<string, string> | undefined
  if (!scripts) return
  pkg.scripts = Object.fromEntries(
    Object.entries(scripts).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  )
}

const hasDevCondition = (value: unknown): boolean => {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    return false
  return Object.entries(value).some(
    ([key, val]) => key === DEV_CONDITION || hasDevCondition(val)
  )
}

/**
 * Deep copy of an exports map without the dev condition. A conditions object
 * left empty by the strip (a dev-only subpath) is dropped from its parent —
 * `"./x": {}` is an invalid exports entry.
 */
const stripDevCondition = (value: unknown): unknown => {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    return value
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value)) {
    if (key === DEV_CONDITION) continue
    const stripped = stripDevCondition(val)
    if (
      stripped !== null &&
      typeof stripped === 'object' &&
      !Array.isArray(stripped) &&
      Object.keys(stripped).length === 0
    )
      continue
    out[key] = stripped
  }
  return out
}

const syncPublishExports = (pkg: Manifest) => {
  const publishConfig = pkg.publishConfig as Manifest | undefined
  if (pkg.exports && hasDevCondition(pkg.exports)) {
    pkg.publishConfig = {
      ...publishConfig,
      exports: stripDevCondition(pkg.exports),
    }
    return
  }
  if (!publishConfig?.exports) return
  delete publishConfig.exports
  if (Object.keys(publishConfig).length === 0) delete pkg.publishConfig
}

const checkMode = process.argv.includes('--check')
const updated: string[] = []

for (const file of manifestFiles) {
  const original = fs.readFileSync(file, 'utf8')
  const pkg = JSON.parse(original) as Manifest

  sortScripts(pkg)
  syncPublishExports(pkg)

  const next = JSON.stringify(pkg, null, 2) + '\n'
  if (next === original) continue
  if (!checkMode) fs.writeFileSync(file, next)
  updated.push(path.relative(repoRoot, file))
}

if (checkMode) {
  if (updated.length) {
    for (const item of updated)
      console.error(`[manifests] not normalized: ${item}`)
    console.error('[manifests] run `pnpm manifests` (or `pnpm fix`) to fix.')
    process.exit(1)
  }
  console.log('[manifests] all manifests normalized')
} else if (updated.length) {
  for (const item of updated) console.log(`[manifests] updated ${item}`)
} else {
  console.log('[manifests] nothing to change')
}
