/**
 * Regenerates `@vueform/*` path-alias blocks in core's and the adapters'
 * tsconfigs from the owning package's `exports` map — the single source of
 * truth. Scanned locations per package: `tsconfig*.json` at the package root,
 * `.tsconfig/*.json`, and nested `tests/**\/tsconfig.json` projects. No target
 * list to maintain: a config opts in simply by containing ANY key of a scope
 * (`@vueform/core`, or an adapter discovered via `vueform.group`); all keys of
 * that scope are then removed and regenerated in place. Configs without such
 * keys (the gates, which consume dist types) are never touched.
 *
 * Alias targets are computed relative to each config file's own directory, so
 * nesting depth is arbitrary.
 *
 * A subpath's src equivalent derives from its `types` field (dist/X.d.ts →
 * src/X.ts), with per-package overrides where the build renames files. Derived
 * targets are existence-checked; exports whose types exist only in dist
 * (build-generated, e.g. ./components/names) are skipped; exports with neither
 * src nor dist types fail the run.
 *
 * Usage:
 *
 * - `pnpm repair --tsconfig` — rewrite
 * - `pnpm repair --tsconfig --check` — fail on drift (CI)
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const check = process.argv.includes('--check')

/**
 * Export subpaths whose src equivalent can't be derived from `types`.
 */
const OVERRIDES: Record<string, Record<string, string>> = {
  core: { './rules': 'src/rules/index.ts' },
}

/**
 * Never aliased: different runtime target, or no src equivalent.
 */
const skipped = (key: string) =>
  key.startsWith('./vapor') ||
  key.includes('css') ||
  key.includes('scss') ||
  key === './nuxt'

interface Scope {
  /**
   * Directory under packages/.
   */
  dir: string
  /**
   * Package name, e.g. `@vueform/core`.
   */
  name: string
}

/**
 * core + every package with vueform.group `adapters` or `plugins`.
 */
function collectScopes(): Scope[] {
  const scopes: Scope[] = []
  for (const dir of readdirSync(path.join(repoRoot, 'packages'))) {
    const manifest = path.join(repoRoot, 'packages', dir, 'package.json')
    if (!existsSync(manifest)) continue
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
    const group = pkg.vueform?.group
    if (dir === 'core' || group === 'adapters') {
      scopes.push({ dir, name: pkg.name })
    }
  }
  return scopes
}

const scopes = collectScopes()

function ownedBy(key: string): Scope | undefined {
  return scopes.find((s) => key === s.name || key.startsWith(`${s.name}/`))
}

function entriesFor(scope: Scope, configDir: string): [string, string][] {
  const scopeDir = path.join(repoRoot, 'packages', scope.dir)
  const rel =
    path.relative(configDir, scopeDir).split(path.sep).join('/') || '.'
  const pkg = JSON.parse(
    readFileSync(
      path.join(repoRoot, 'packages', scope.dir, 'package.json'),
      'utf8'
    )
  )
  const out: [string, string][] = []

  for (const [key, entry] of Object.entries(pkg.exports ?? {})) {
    if (skipped(key)) continue
    const types =
      typeof entry === 'object' && entry !== null
        ? (entry as Record<string, string>).types
        : undefined
    const src =
      OVERRIDES[scope.dir]?.[key] ??
      (types?.startsWith('./dist/')
        ? types.replace('./dist/', 'src/').replace(/\.d\.ts$/, '.ts')
        : null)
    if (!src) continue

    const target = `${rel}/${src}`
    const probe = target.includes('*')
      ? path.dirname(target.split('*')[0] + 'x')
      : target
    if (!existsSync(path.resolve(configDir, probe))) {
      const distProbe = types
        ? path.join(repoRoot, 'packages', scope.dir, types.replace('*', 'x'))
        : null
      if (!distProbe || !existsSync(distProbe)) {
        console.error(
          `[repair:tsconfig] ${scope.name}${key.slice(1)}: neither src ("${target}") nor dist types exist — broken export`
        )
        process.exit(1)
      }
      continue // build-generated export, no src twin
    }

    out.push([key === '.' ? scope.name : scope.name + key.slice(1), target])
  }

  // Wildcard fallback closes the block — only for packages that actually
  // export subpaths; a bare '.'-only package must not invite resolving
  // paths it doesn't publish.
  const hasSubpaths = Object.keys(pkg.exports ?? {}).some(
    (key) => key !== '.' && !skipped(key)
  )
  if (hasSubpaths) out.push([`${scope.name}/*`, `${rel}/src/*`])
  return out
}

/**
 * Collapse single-element string arrays onto one line.
 */
function inlineArrays(json: string): string {
  return json.replace(/\[\n\s+("(?:[^"\\]|\\.)*")\n\s+\]/g, '[$1]')
}

function prettify(filePath: string, content: string): string {
  return execFileSync(
    'pnpm',
    ['exec', 'prettier', '--stdin-filepath', filePath],
    { input: content, encoding: 'utf8' }
  )
}

/**
 * Config files owned by a package: root `tsconfig*.json`, `.tsconfig/*.json`,
 * and nested `tests/**\/tsconfig.json` projects.
 */
function collectConfigFiles(pkgDir: string): string[] {
  const pkgRoot = path.join(repoRoot, 'packages', pkgDir)
  const files: string[] = []

  for (const file of readdirSync(pkgRoot)) {
    if (/^tsconfig.*\.json$/.test(file)) files.push(path.join(pkgRoot, file))
  }

  const legacyDir = path.join(pkgRoot, '.tsconfig')
  if (existsSync(legacyDir)) {
    for (const file of readdirSync(legacyDir)) {
      if (file.endsWith('.json')) files.push(path.join(legacyDir, file))
    }
  }

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules') continue
        walk(path.join(dir, entry.name))
      } else if (entry.name === 'tsconfig.json') {
        files.push(path.join(dir, entry.name))
      }
    }
  }
  const testsDir = path.join(pkgRoot, 'tests')
  if (existsSync(testsDir)) walk(testsDir)

  return files
}

let failed = false

// Only core and the adapters carry generated blocks; other packages'
// tsconfigs stay hand-owned.
for (const pkgDir of scopes.map((s) => s.dir)) {
  for (const filePath of collectConfigFiles(pkgDir)) {
    const source = readFileSync(filePath, 'utf8')
    const header = source
      .split('\n')
      .filter((line) => line.trim().startsWith('//'))
      .join('\n')
    const body = source
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n')

    let config: { compilerOptions?: { paths?: Record<string, string[]> } }
    try {
      config = JSON.parse(body)
    } catch {
      console.error(`[repair:tsconfig] ${filePath} is not valid JSONC`)
      process.exit(1)
    }
    const paths = config.compilerOptions?.paths
    if (!paths) continue

    // Anchor: only the scope's wildcard key opts a file into generation.
    const anchored = new Set<string>()
    for (const scope of scopes) {
      if (`${scope.name}/*` in paths) anchored.add(scope.dir)
    }
    if (!anchored.size) continue

    const rebuilt: Record<string, string[]> = {}
    const inserted = new Set<string>()
    for (const [key, value] of Object.entries(paths)) {
      const scope = ownedBy(key)
      if (scope && anchored.has(scope.dir)) {
        if (!inserted.has(scope.dir)) {
          for (const [alias, src] of entriesFor(
            scope,
            path.dirname(filePath)
          )) {
            rebuilt[alias] = [src]
          }
          inserted.add(scope.dir)
        }
        continue
      }
      rebuilt[key] = value
    }

    config.compilerOptions!.paths = rebuilt
    const raw =
      (header ? header + '\n' : '') +
      inlineArrays(JSON.stringify(config, null, 2)) +
      '\n'
    const next = prettify(filePath, raw)

    if (next !== source) {
      const rel = path.relative(repoRoot, filePath)
      if (check) {
        console.error(
          `[repair:tsconfig] ${rel} is out of date — run \`pnpm repair --tsconfig\``
        )
        failed = true
      } else {
        writeFileSync(filePath, next)
        console.log(`[repair:tsconfig] updated ${rel}`)
      }
    }
  }
}

if (failed) process.exit(1)
if (check)
  console.log('[repair:tsconfig] alias blocks in sync with package exports')
