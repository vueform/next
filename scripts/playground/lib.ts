/**
 * Shared helpers for the playground scripts (`pg`, `pg:up`, `pg:down`, `pg:re`,
 * `pg:build`, `pg:pre`).
 *
 * A playground is a combination of an adapter and a mode:
 *
 * - Adapters are discovered from `packages/*\/package.json` manifests with
 *   `vueform.group = "adapters"`, selected via `--<package dir>` or any
 *   `vueform.alias` entry (e.g. `--pv`).
 * - Modes: plain Vite (default), `--nuxt`, or `--vapor` (Vite + Vapor). Nuxt +
 *   Vapor is not supported.
 *
 * Instances are ASSEMBLED into `.playgrounds/<name>` (`<adapter>`,
 * `<adapter>-nuxt`, or `<adapter>-vapor`): the static engine base template
 * (`templates/vite` or `templates/nuxt` — vapor derives from the vite base)
 * plus the adapter's own playground fragments and metadata (see `assemble.ts`).
 * The generated playground is a standalone Vite/Nuxt app (default tsconfigs,
 * real dependency versions), then rewired to the monorepo (workspace/link deps,
 * exports-derived tsconfig source paths).
 *
 * Every playground is standalone: installed with `pnpm install
 * --ignore-workspace` inside its directory, with its own lockfile and
 * node_modules living under the gitignored `.playgrounds/`. Playgrounds are
 * deliberately NOT pnpm workspace members — a workspace playground becomes an
 * importer in the committed root lockfile, which breaks
 * `pnpm install --frozen-lockfile` on clones (where `.playgrounds` doesn't
 * exist) and dirties the lockfile whenever a playground is up.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { assemblePlayground } from './assemble'

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
)
export const templatesDir = path.join(
  repoRoot,
  'scripts',
  'playground',
  'templates'
)
export const outputDir = path.join(repoRoot, '.playgrounds')

export const MODES = ['vite', 'nuxt', 'vapor'] as const
export type Mode = (typeof MODES)[number]

export interface AdapterInfo {
  /**
   * Directory name under packages/, used in flags and instance names.
   */
  name: string
  /**
   * Full package name, e.g. `@vueform/ui`.
   */
  pkgName: string
  /**
   * Short flag aliases from `vueform.alias`.
   */
  aliases: string[]
}

export interface Combo {
  adapter: string
  mode: Mode
  /**
   * Instance/directory name under .playgrounds.
   */
  name: string
  templateDir: string
  dir: string
}

export function exists(p: string) {
  try {
    fs.accessSync(p)
    return true
  } catch {
    return false
  }
}

export function run(
  cmd: string,
  args: string[],
  cwd?: string,
  env: Record<string, string> = {}
) {
  const res = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
  })

  if (res.status !== 0) process.exit(res.status ?? 1)
}

export function discoverAdapters(): AdapterInfo[] {
  const packagesDir = path.join(repoRoot, 'packages')

  return fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .flatMap((e) => {
      const pkgPath = path.join(packagesDir, e.name, 'package.json')
      if (!exists(pkgPath)) return []

      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
      const group = pkg.vueform?.group
      if (group !== 'adapter' && group !== 'adapters') return []

      const alias = pkg.vueform?.alias
      return [
        {
          name: e.name,
          pkgName: pkg.name,
          aliases: Array.isArray(alias) ? alias : alias ? [alias] : [],
        },
      ]
    })
}

export function comboFor(adapter: string, mode: Mode): Combo {
  const name = mode === 'vite' ? adapter : `${adapter}-${mode}`
  // Vapor is a derived mode of the vite engine — same base template.
  const engine = mode === 'vapor' ? 'vite' : mode

  return {
    adapter,
    mode,
    name,
    templateDir: path.join(templatesDir, engine),
    dir: path.join(outputDir, name),
  }
}

export interface ParsedArgs {
  adapters: string[]
  mode: Mode
  flags: Set<string>
}

export interface ParseOptions {
  /**
   * Log prefix, e.g. `pg:up`.
   */
  tag: string
  /**
   * Extra boolean flags this script accepts, e.g. `['force']`.
   */
  extraFlags?: string[]
  /**
   * At most one adapter may be given (dev/preview servers).
   */
  singleAdapter?: boolean
}

/**
 * The adapter assumed when no adapter flag is given — `ui` when it exists,
 * otherwise the first discovered adapter.
 */
function defaultAdapter(adapters: AdapterInfo[]): string[] {
  const fallback = adapters.find((a) => a.name === 'ui') ?? adapters[0]
  return fallback ? [fallback.name] : []
}

export function usage(tag: string, opts: ParseOptions) {
  const adapters = discoverAdapters()
  const list = adapters
    .map((a) => `--${a.name}${a.aliases.map((al) => ` (--${al})`).join('')}`)
    .join(', ')
  const extras = (opts.extraFlags ?? []).map((f) => ` [--${f}]`).join('')

  return (
    `[${tag}] Usage: pnpm ${tag} ${opts.singleAdapter ? '[<adapter>]' : '[<adapter> ...]'} [--nuxt | --vapor]${extras}\n` +
    `Adapters: ${list} — bare or as flags (default: ui)\n` +
    `Modes: plain Vite (default), --nuxt, --vapor`
  )
}

export function parseArgs(argv: string[], opts: ParseOptions): ParsedArgs {
  const { tag } = opts
  const adapters = discoverAdapters()
  const byFlag = new Map<string, string>()

  for (const a of adapters) {
    byFlag.set(a.name, a.name)
    for (const al of a.aliases) byFlag.set(al, a.name)
  }

  const fail = (msg: string): never => {
    console.error(`[${tag}] ${msg}\n${usage(tag, opts)}`)
    return process.exit(1)
  }

  const selected: string[] = []
  const modes = new Set<Mode>()
  const flags = new Set<string>()

  for (const arg of argv) {
    // `pnpm pg primevue` — bare words select adapters like their flags do.
    const flag = arg.startsWith('--') ? arg.slice(2) : arg

    if (flag === 'nuxt' || flag === 'vapor') {
      modes.add(flag)
    } else if (opts.extraFlags?.includes(flag)) {
      flags.add(flag)
    } else if (byFlag.has(flag)) {
      const name = byFlag.get(flag)!
      if (!selected.includes(name)) selected.push(name)
    } else {
      fail(`Unknown ${arg.startsWith('--') ? 'flag' : 'adapter'}: ${arg}`)
    }
  }

  if (modes.size > 1) {
    fail('Nuxt + Vapor is not supported. Pick one of --nuxt or --vapor.')
  }

  if (opts.singleAdapter && selected.length > 1) {
    fail('At most one adapter may be specified.')
  }

  return {
    adapters: selected.length ? selected : defaultAdapter(adapters),
    mode: [...modes][0] ?? 'vite',
    flags,
  }
}

/**
 * Combos for the parsed selection, validated against existing templates.
 */
export function resolveCombos(tag: string, parsed: ParsedArgs): Combo[] {
  return parsed.adapters.map((adapter) => {
    const combo = comboFor(adapter, parsed.mode)

    if (!exists(combo.templateDir)) {
      console.error(
        `[${tag}] No "${parsed.mode}" template for adapter "${adapter}" at ${path.relative(repoRoot, combo.templateDir)}`
      )
      process.exit(1)
    }

    return combo
  })
}

/**
 * Every combo that currently exists in .playgrounds.
 */
export function existingCombos(): Combo[] {
  const adapters = discoverAdapters().map((a) => a.name)
  const combos: Combo[] = []

  for (const mode of MODES) {
    for (const adapter of adapters) {
      const combo = comboFor(adapter, mode)
      if (exists(combo.dir)) combos.push(combo)
    }
  }

  return combos
}

/**
 * Workspace package dirs by published name (`@vueform/core` → `core`).
 */
function workspacePackageDirs(): Map<string, string> {
  const packagesDir = path.join(repoRoot, 'packages')
  const dirs = new Map<string, string>()

  for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const pkgPath = path.join(packagesDir, entry.name, 'package.json')
    if (!exists(pkgPath)) continue
    const name = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).name
    if (name) dirs.set(name, entry.name)
  }

  return dirs
}

/**
 * Templates ship standalone-installable (real versions, no mappings); the copy
 * is rewired to the monorepo: deps on workspace packages become `link:`
 * entries, since playgrounds install with their own lockfile outside the
 * workspace.
 */
function patchPackageManifest(combo: Combo) {
  const pkgPath = path.join(combo.dir, 'package.json')
  if (!exists(pkgPath)) return

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  pkg.name = `pg-${combo.name}`
  pkg.private = true

  const workspace = workspacePackageDirs()
  for (const field of ['dependencies', 'devDependencies'] as const) {
    for (const name of Object.keys(pkg[field] ?? {})) {
      const dir = workspace.get(name)
      if (!dir) continue
      pkg[field][name] = `link:../../packages/${dir}`
    }
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

/**
 * Applies the monorepo type-check adjustments to the copied playground's
 * tsconfig. Source resolution itself needs no patching: the template extends
 * `@vueform/tsconfig/tsconfig.dom.json`, whose `dev` exports
 * condition resolves `@vueform/*` to `packages/*\/src` (the build config
 * clears the condition and checks against installed packages).
 */
/**
 * Parses tsconfig-style JSONC: comments and trailing commas are tolerated. A
 * character scan rather than regexes — naive comment-stripping regexes eat the
 * `/**​/` inside glob strings like `"src/**​/*.ts"`.
 */
function readJsonc(file: string) {
  const stripComments = (text: string) => {
    let out = ''
    let i = 0
    while (i < text.length) {
      const ch = text[i]
      if (ch === '"') {
        // String literal: copy verbatim, honoring escapes.
        let j = i + 1
        while (j < text.length && text[j] !== '"') {
          if (text[j] === '\\') j++
          j++
        }
        out += text.slice(i, j + 1)
        i = j + 1
      } else if (ch === '/' && text[i + 1] === '/') {
        while (i < text.length && text[i] !== '\n') i++
      } else if (ch === '/' && text[i + 1] === '*') {
        const end = text.indexOf('*/', i + 2)
        i = end === -1 ? text.length : end + 2
      } else {
        out += ch
        i++
      }
    }
    return out
  }

  return JSON.parse(
    // Strings can't contain unescaped newlines, so after comment-stripping
    // the trailing-comma regex can't corrupt string contents that easily —
    // but keep it string-safe anyway by only matching before } or ].
    stripComments(fs.readFileSync(file, 'utf8')).replace(
      /,(\s*[}\]])/g,
      (match, close, offset, s: string) => {
        // Skip commas inside string literals.
        const before = s.slice(0, offset)
        let quotes = 0
        for (let k = 0; k < before.length; k++) {
          if (before[k] === '"') quotes++
          else if (before[k] === '\\') k++
        }
        return quotes % 2 === 1 ? match : close
      }
    )
  )
}

/**
 * JSON with objects pretty-printed but arrays kept on one line, so entries like
 * `"#core/*": ["../../packages/core/src/*"]` stay single-line.
 */
function stringifyTsconfig(value: unknown, indent = ''): string {
  if (Array.isArray(value)) {
    return `[${value.map((v) => JSON.stringify(v)).join(', ')}]`
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (!entries.length) return '{}'
    const inner = indent + '  '
    return `{\n${entries
      .map(
        ([k, v]) =>
          `${inner}${JSON.stringify(k)}: ${stringifyTsconfig(v, inner)}`
      )
      .join(',\n')}\n${indent}}`
  }
  return JSON.stringify(value)
}

function writeTsconfig(file: string, tsconfig: unknown) {
  fs.writeFileSync(file, stringifyTsconfig(tsconfig) + '\n')
}

function patchTsconfig(combo: Combo) {
  if (combo.mode === 'nuxt') {
    patchNuxtTsconfig(combo)
    return
  }

  const tsconfigPath = path.join(combo.dir, 'tsconfig.app.json')
  if (!exists(tsconfigPath)) return

  const tsconfig = readJsonc(tsconfigPath)

  const co = (tsconfig.compilerOptions ??= {})
  // The playground's vite major can differ from the workspace root's (the
  // template poses as a real consumer), and @vueform/utils' declarations
  // type against the root's copy — vite's class types carry private
  // members, so two declaration copies are never mutually assignable. Pin
  // `vite` to the playground's copy everywhere, and `vue` too: the
  // playground has its own lockfile and physical vue copy, so without the
  // pin the packages' sources and the playground resolve different copies
  // (the tsconfig twin of the vite config's `dedupe: ['vue']`).
  co.paths = {
    vite: ['./node_modules/vite'],
    vue: ['./node_modules/vue'],
    ...co.paths,
  }
  // Package sources are pulled into the project through the source
  // condition; check them the way the repo's own `pnpm check` does.
  co.noUnusedLocals = false
  co.noUnusedParameters = false

  writeTsconfig(tsconfigPath, tsconfig)

  // `tsconfig.build.json` resets `paths` to `{}` so the build type-checks
  // against installed packages, but the vite/vue pin must survive: without it
  // the dist `.d.ts` files resolve the workspace root's vue while playground
  // sources resolve the playground's own, and the dists' `declare module
  // 'vue'` augmentations (global components, the `App.use` workaround) land
  // on the wrong copy.
  const buildTsconfigPath = path.join(combo.dir, 'tsconfig.build.json')
  if (exists(buildTsconfigPath)) {
    const buildTsconfig = readJsonc(buildTsconfigPath)
    const buildCo = (buildTsconfig.compilerOptions ??= {})
    buildCo.paths = {
      vite: ['./node_modules/vite'],
      vue: ['./node_modules/vue'],
      ...buildCo.paths,
    }
    writeTsconfig(buildTsconfigPath, buildTsconfig)
  }

  patchRootTsconfig(combo, tsconfig.include)
  patchNodeTsconfig(combo)
}

/**
 * Nuxt playgrounds have a single tsconfig extending the generated
 * `.nuxt/tsconfig.json`; the source paths are merged into it. Caveat: a child
 * config's `paths` replaces the parent's wholesale, so Nuxt's own generated
 * alias paths (`~`, `#app`, …) are lost to the type-check — fine for the
 * playground, which doesn't use them.
 */
function patchNuxtTsconfig(combo: Combo) {
  const tsconfigPath = path.join(combo.dir, 'tsconfig.json')
  if (!exists(tsconfigPath)) return

  const tsconfig = readJsonc(tsconfigPath)
  const co = (tsconfig.compilerOptions ??= {})
  // Source resolution via the exports condition (as in the vite template's
  // preset) — Nuxt generates its own tsconfig, so it is set here instead.
  co.customConditions = ['dev']
  co.paths = {
    // The ambient `declare module '#shorthands'` marker — mapped instead of
    // included, since overriding `include` would replace Nuxt's generated
    // one wholesale.
    '#shorthands': ['../../packages/global.d.ts'],
    // Same single-copy pins as the vite template (see patchTsconfig): the
    // playground owns a physical vite/vue, the package sources sit next to
    // the workspace root's.
    vite: ['./node_modules/vite'],
    vue: ['./node_modules/vue'],
    ...co.paths,
  }

  writeTsconfig(tsconfigPath, tsconfig)
}

/**
 * Replaces the template's solution-style root tsconfig (`"files": []` plus
 * references) with a direct project extending the app config. Editor project
 * discovery doesn't reliably follow solution references for the nested
 * playground, and then falls back to an inferred project without `paths` —
 * resolving `@vueform/*` to stale dist types. The direct form leaves nothing to
 * discover. References are dropped (they would demand `composite`);
 * `vite.config.ts` joins this project instead, so it keeps the vite pin in the
 * editor too.
 */
function patchRootTsconfig(combo: Combo, appInclude: string[]) {
  const tsconfigPath = path.join(combo.dir, 'tsconfig.json')
  if (!exists(tsconfigPath)) return

  const tsconfig = {
    extends: './tsconfig.app.json',
    include: [...appInclude, 'vite.config.ts'],
  }

  writeTsconfig(tsconfigPath, tsconfig)
}

/**
 * Pins `vite` (and through it, rollup) to the playground's own copy for the
 * config-file project. `@vueform/utils`'s declarations otherwise type against
 * the workspace root's vite install; playgrounds have their own physical
 * copy, and vite's classes carry private members, so two declaration copies
 * are never mutually assignable no matter the version.
 */
function patchNodeTsconfig(combo: Combo) {
  const tsconfigPath = path.join(combo.dir, 'tsconfig.node.json')
  if (!exists(tsconfigPath)) return

  const tsconfig = readJsonc(tsconfigPath)
  const co = (tsconfig.compilerOptions ??= {})
  co.paths = { vite: ['./node_modules/vite'], ...co.paths }

  writeTsconfig(tsconfigPath, tsconfig)
}

export function install(tag: string, combo: Combo) {
  console.log(`[${tag}] Installing deps for "${combo.name}"...`)
  run('pnpm', ['install', '--ignore-workspace'], combo.dir)
}

export interface UpOptions {
  force?: boolean
}

/**
 * Create the playground from its template. Returns true if (re)created.
 */
export function up(tag: string, combo: Combo, opts: UpOptions = {}): boolean {
  if (exists(combo.dir)) {
    if (!opts.force) {
      console.log(
        `[${tag}] "${combo.name}" already exists, skipping. Use pg:re to recreate.`
      )
      return false
    }

    console.log(`[${tag}] Removing existing "${combo.name}"...`)
    fs.rmSync(combo.dir, { recursive: true, force: true })
  }

  console.log(
    `[${tag}] Creating "${combo.name}" from ${path.relative(repoRoot, combo.templateDir)}...`
  )
  fs.mkdirSync(outputDir, { recursive: true })
  fs.cpSync(combo.templateDir, combo.dir, { recursive: true })
  assemblePlayground(repoRoot, combo)
  patchPackageManifest(combo)
  patchTsconfig(combo)
  install(tag, combo)

  return true
}

export function down(tag: string, combo: Combo): boolean {
  if (!exists(combo.dir)) {
    console.log(`[${tag}] "${combo.name}" does not exist, skipping.`)
    return false
  }

  fs.rmSync(combo.dir, { recursive: true, force: true })
  console.log(`[${tag}] Removed .playgrounds/${combo.name}`)

  return true
}

/**
 * Make sure the playground exists and its deps are installed.
 */
export function ensureReady(tag: string, combo: Combo) {
  if (!exists(combo.dir)) {
    console.log(`[${tag}] Playground "${combo.name}" not found, creating...`)
    up(tag, combo)
  } else if (!exists(path.join(combo.dir, 'node_modules'))) {
    // Playgrounds have their own lockfile/node_modules; root installs don't
    // cover them, so restore deps here when missing.
    install(tag, combo)
  }
}

export function build(tag: string, combo: Combo) {
  console.log(`[${tag}] Building "${combo.name}"...`)
  run('pnpm', ['run', 'build'], combo.dir, { USE_DEV: 'true' })
}

export function dev(tag: string, combo: Combo) {
  console.log(`[${tag}] Starting dev server for "${combo.name}"...`)
  run('pnpm', ['run', 'dev'], combo.dir, { USE_DEV: 'true' })
}

/**
 * Serves the playground's existing build without rebuilding (`pg:preview`).
 */
export function previewOnly(tag: string, combo: Combo) {
  console.log(`[${tag}] Starting preview for "${combo.name}"...`)
  run('pnpm', ['run', 'preview'], combo.dir, { USE_DEV: 'true' })
}

export function preview(tag: string, combo: Combo) {
  build(tag, combo)
  console.log(`[${tag}] Starting preview for "${combo.name}"...`)
  run('pnpm', ['run', 'preview'], combo.dir, { USE_DEV: 'true' })
}
