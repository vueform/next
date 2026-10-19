/**
 * Manifest publish-field sync (`pnpm manifests`): updates the publish-time
 * fields of the workspace package.json files — root, `packages/*`, `docs`
 * and `benchmark`. Key sorting is `vp fmt`'s job (`sortPackageJson` in the
 * root fmt config); this script only owns `publishConfig`: for every
 * `exports` map that carries the `dev` condition (src-world resolution — see
 * @vueform/tsconfig/tsconfig.dom.json) it syncs a `publishConfig.exports`
 * copy with those entries stripped, so the published manifest never points
 * at `src/`. The `imports` field (`#src` src-world aliases, equally
 * dev-only) gets a `publishConfig.imports: {}` twin — pnpm can only
 * overwrite publishConfig fields, not delete them, and an empty imports map
 * is inert. pnpm swaps `publishConfig` fields in at pack time. Idempotent.
 * Not run automatically — invoke it after changing an exports/imports map;
 * the release pipeline (scripts/release.ts) runs it before every publish.
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

/**
 * The workspace `imports` map mostly aliases `#src` into `src/` (dev-world);
 * published packages must not carry those. Entries whose target is a plain
 * path (or path array) are such dev aliases and are dropped; a conditions
 * object (e.g. `#vapor-bindings` resolving per mode) is kept with its dev
 * condition stripped, like the exports sync. publishConfig cannot remove a
 * field, so with nothing left the published manifest gets an empty map.
 */
const syncPublishImports = (pkg: Manifest) => {
  const publishConfig = pkg.publishConfig as Manifest | undefined
  const imports = pkg.imports as Manifest | undefined
  if (imports) {
    const published: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(imports)) {
      if (val === null || typeof val !== 'object' || Array.isArray(val))
        continue
      const stripped = stripDevCondition(val) as Record<string, unknown>
      if (Object.keys(stripped).length === 0) continue
      published[key] = stripped
    }
    pkg.publishConfig = { ...publishConfig, imports: published }
    return
  }
  if (!publishConfig || !('imports' in publishConfig)) return
  delete publishConfig.imports
  if (Object.keys(publishConfig).length === 0) delete pkg.publishConfig
}

const updated: string[] = []

for (const file of manifestFiles) {
  const original = fs.readFileSync(file, 'utf8')
  const pkg = JSON.parse(original) as Manifest

  syncPublishExports(pkg)
  syncPublishImports(pkg)

  const next = JSON.stringify(pkg, null, 2) + '\n'
  if (next === original) continue
  fs.writeFileSync(file, next)
  updated.push(path.relative(repoRoot, file))
}

if (updated.length) {
  for (const item of updated) console.log(`[manifests] updated ${item}`)
} else {
  console.log('[manifests] nothing to change')
}
