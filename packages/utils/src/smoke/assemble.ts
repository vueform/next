/**
 * Assembles a smoke run: a disposable copy of the generic fixture shell
 * (`packages/utils/fixtures/smoke-test/envs/<fixture>`) in the ephemeral
 * runs dir, with
 * the shared fixture content injected and the manifest rewired to the packed
 * tarballs. Fixture sources are never touched in place, so variant and
 * variant runs can coexist.
 *
 * Every fixture obeys one script contract, which keeps the runner identical
 * across environments:
 *
 * - `build`: tier 0 production build (vite build / nuxi build)
 * - `serve`: serves the built app on the port in `SMOKE_PORT`
 *
 * Shared content is copied from `@vueform/utils`' fixtures/smoke-test:
 *
 * - `app/*` → `<run>/smoke/` — canonical schema, inline-components form,
 *   window.__smoke exposure. A `<name>.nuxt.<ext>` variant replaces
 *   `<name>.<ext>` in nuxt envs.
 * - `e2e/*` → `<run>/e2e/` — the shared Playwright specs (tier 1 boot, tier 2
 *   interaction) plus helpers.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import type { EnvDef, Framework, Pm } from './envs'
import { generateCanonicalContent } from './generate'
import { copyFixture, readJson, SmokeError, writeJson, exists } from './lib'
import type { PackedTarballs } from './pack'
import { applyOverrides, runScriptArgs } from './pm'

/**
 * What fixture assembly needs to know about an env — satisfied by both the
 * smoke `EnvDef` and the smoke-types `TypeEnvDef`.
 */
export interface FixtureEnv {
  id: string
  framework: Framework
  fixture: string
}

export interface AssembleFixtureInput {
  root: string
  adapter: string
  adapterDir: string
  env: FixtureEnv
  tarballs: PackedTarballs
  runsDir: string
  /**
   * The package manager the run installs and executes with.
   */
  pm: Pm
  /**
   * The run directory name (and `smoke-<name>` manifest name).
   */
  name: string
}

export interface AssembleInput {
  root: string
  adapter: string
  adapterDir: string
  env: EnvDef
  tarballs: PackedTarballs
  runsDir: string
  pm: Pm
  port: number
}

export interface SmokeRun {
  dir: string
  name: string
  baseUrl: string
}

// Same depth from `src/smoke/` (vitest) and `dist/smoke/` (built output).
const templatesDir = path.resolve(
  import.meta.dirname,
  '..',
  '..',
  'fixtures',
  'smoke-test'
)

/**
 * Copies `fixtures/smoke-test/app` into `<run>/smoke`, honoring per-env variant
 * files: `foo.nuxt.ts` overrides `foo.ts` in nuxt envs and is never copied
 * verbatim.
 */
function copySharedApp(runDir: string, env: FixtureEnv) {
  const srcDir = path.join(templatesDir, 'app')
  const destDir = path.join(runDir, 'smoke')
  const variantRe = /^(.+)\.(\w+)\.(ts|vue)$/

  const copyDir = (from: string, to: string) => {
    fs.mkdirSync(to, { recursive: true })

    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      const srcPath = path.join(from, entry.name)
      if (entry.isDirectory()) {
        copyDir(srcPath, path.join(to, entry.name))
        continue
      }

      const match = entry.name.match(variantRe)
      const variant = match && isVariantTag(match[2]) ? match[2] : null

      if (variant) {
        if (variant === env.framework) {
          fs.copyFileSync(srcPath, path.join(to, `${match![1]}.${match![3]}`))
        }
        continue
      }

      // A base file is skipped when a framework variant of it will be copied.
      const base = entry.name.replace(/\.(ts|vue)$/, '')
      const ext = entry.name.slice(base.length + 1)
      if (exists(path.join(from, `${base}.${env.framework}.${ext}`))) continue

      fs.copyFileSync(srcPath, path.join(to, entry.name))
    }
  }

  copyDir(srcDir, destDir)
}

function isVariantTag(tag: string): boolean {
  return tag === 'vite' || tag === 'nuxt'
}

/**
 * The adapter's declarative smoke config (`tests/smoke/config.json`) —
 * everything the harness must know about the adapter that is not a file.
 */
export interface SmokeConfig {
  /**
   * EXTRA workspace packages the fixtures install from tarballs — the
   * universal set (the adapter itself, @vueform/core, @vueform/expr-eval
   * as the canonical config's plugin, and @vueform/nuxt-module for nuxt fixtures)
   * is injected automatically. Any packed package that appears as a PEER
   * anywhere in the closure must be listed — pnpm's auto-installed peers
   * bypass the tarball overrides and would resolve from the registry.
   */
  dependencies?: string[]
  /**
   * The exports subpath `createVueform` comes from (e.g. `bundle` →
   * `@vueform/ui/bundle`), re-exported through the generated
   * `smoke/adapter.ts` so the fixture shells stay adapter-free. Omit when
   * the package root exports it.
   */
  entry?: string
  /**
   * Per canonical-family knobs for the generated schema and inline form —
   * the adapter's element type strings, component names and prop renames
   * (see generate.ts for the families and the reference defaults).
   */
  schema?: Record<
    string,
    { type?: string; component?: string; itemsProp?: string }
  >
  /**
   * REGISTRY packages (name → semver) a consumer of this adapter must
   * install themselves, injected into every fixture manifest — e.g.
   * PrimeVue's component library, themes and icons. Workspace packages
   * never go here (they are tarball-injected via `dependencies`).
   */
  registryDependencies?: Record<string, string>
}

function readSmokeConfig(adapterDir: string, adapter: string): SmokeConfig {
  const file = path.join(adapterDir, 'tests', 'smoke', 'config.json')
  if (!exists(file)) {
    throw new SmokeError(
      `Adapter "${adapter}" has no tests/smoke/config.json — it declares ` +
        `the workspace packages the fixtures install, e.g. ` +
        `{"dependencies": ["@vueform/core"]}.`
    )
  }

  const config = readJson(file)
  if (
    config.dependencies !== undefined &&
    (!Array.isArray(config.dependencies) ||
      config.dependencies.some((dep: unknown) => typeof dep !== 'string'))
  ) {
    throw new SmokeError(
      `tests/smoke/config.json of "${adapter}": "dependencies" must be an ` +
        `array of package names.`
    )
  }
  for (const [name, range] of Object.entries(
    config.registryDependencies ?? {}
  )) {
    if (typeof range !== 'string' || name.startsWith('@vueform/')) {
      throw new SmokeError(
        `tests/smoke/config.json of "${adapter}": "registryDependencies" ` +
          `maps registry package names to semver ranges — workspace ` +
          `packages belong in "dependencies".`
      )
    }
  }
  if (config.entry !== undefined && typeof config.entry !== 'string') {
    throw new SmokeError(
      `tests/smoke/config.json of "${adapter}": "entry" must be an exports ` +
        `subpath string (e.g. "bundle").`
    )
  }
  return config
}

/**
 * The adapter-owned content (every file at the `tests/smoke/` root beside
 * config.json): goes into `<run>/smoke/` — type assertion files (types.ts,
 * types.vue) that only the smoke-types envs check, plus any override of a
 * generated canonical file (schema.ts, SmokeFormInline.vue). One exception:
 * `vueform.config.ts` goes to the RUN ROOT, where the shells and the
 * @vueform/nuxt-module module expect a user's config. The canonical files
 * themselves are generated from config.json afterwards (see generate.ts),
 * skipping whatever was committed here.
 */
function copyAdapterContent(runDir: string, input: AssembleFixtureInput) {
  const contentDir = path.join(input.adapterDir, 'tests', 'smoke')

  const destDir = path.join(runDir, 'smoke')
  fs.mkdirSync(destDir, { recursive: true })

  for (const entry of fs.readdirSync(contentDir, { withFileTypes: true })) {
    // The setup/ dir (app wiring, nuxt config extension, ambient shims for
    // upstream packages with broken strict types) mirrors into
    // `<run>/smoke/setup/`; missing pieces are generated afterwards.
    if (entry.isDirectory()) {
      if (entry.name === 'setup') {
        fs.cpSync(path.join(contentDir, 'setup'), path.join(destDir, 'setup'), {
          recursive: true,
        })
      }
      continue
    }
    if (entry.name.endsWith('.md')) continue
    // config.json is the harness's input; tsconfig.json and editor.d.ts are
    // the folder's EDITOR scaffolding (the runs generate their own project
    // and ambient setup). Other committed d.ts files are adapter content —
    // e.g. ambient shims for upstream packages whose types break under
    // skipLibCheck: false.
    if (
      entry.name === 'config.json' ||
      entry.name === 'tsconfig.json' ||
      entry.name === 'editor.d.ts'
    ) {
      continue
    }
    const dest =
      entry.name === 'vueform.config.ts'
        ? path.join(runDir, entry.name)
        : path.join(destDir, entry.name)
    fs.copyFileSync(path.join(contentDir, entry.name), dest)
  }
}

function copySharedSpecs(runDir: string) {
  fs.cpSync(path.join(templatesDir, 'e2e'), path.join(runDir, 'e2e'), {
    recursive: true,
  })
}

/**
 * Generates `smoke/adapter.ts`, the indirection that keeps the shared
 * templates and fixture shells adapter-agnostic: everything re-exported from
 * the adapter's bare entry (which itself re-exports core's helpers like
 * defineSchema/useForm), plus `createVueform` from the config's `entry`
 * subpath — the shells' `main.ts` imports it from here instead of naming the
 * package.
 *
 * In vite envs it also side-effect-imports `<adapter>/components`, which is
 * what activates the registry/GlobalComponents type augmentations. Nuxt envs
 * deliberately get NO such import — there the @vueform/nuxt-module module's generated
 * type template has to do it.
 */
function writeAdapterModule(
  runDir: string,
  input: AssembleFixtureInput,
  config: SmokeConfig
) {
  const pkgName: string = readJson(
    path.join(input.adapterDir, 'package.json')
  ).name
  const entry = config.entry ? `${pkgName}/${config.entry}` : pkgName

  const lines = [
    `// Generated by the smoke harness — the adapter indirection for shared`,
    `// fixture code. Do not edit.`,
    `export * from '${pkgName}'`,
    `export { createVueform } from '${entry}'`,
    ...(input.env.framework === 'nuxt'
      ? []
      : [`import '${pkgName}/components'`]),
    ``,
  ]

  fs.writeFileSync(path.join(runDir, 'smoke', 'adapter.ts'), lines.join('\n'))
}

let cachedYarnVersion: string | undefined

/**
 * The installed yarn's version — stamped into yarn runs' manifests as their
 * own `packageManager`, because yarn walks up from the run dir into the
 * monorepo and trips over the root's `packageManager: pnpm@…` Corepack pin.
 */
function yarnVersion(): string {
  if (!cachedYarnVersion) {
    const res = spawnSync('yarn', ['--version'], { encoding: 'utf8' })
    if (res.status !== 0 || !res.stdout.trim()) {
      throw new SmokeError(
        'Could not run `yarn --version` — is yarn installed?'
      )
    }
    cachedYarnVersion = res.stdout.trim()
  }
  return cachedYarnVersion
}

/**
 * Rewires the fixture manifest to the packed tarballs. The workspace
 * dependency set comes from the adapter's smoke config (plus the adapter
 * itself, plus `@vueform/nuxt-module` for nuxt fixtures), injected as `file:`
 * paths; the committed fixture shells stay workspace-free. EVERY packed
 * name is additionally overridden so the tarballs' own semver ranges can't
 * fall back to the registry.
 *
 * Caveat: pnpm's auto-installed PEER dependencies bypass overrides (they
 * resolve from the registry), so any packed package that appears as a peer
 * in the closure (e.g. plugins peer-depend on @vueform/core) must be in the
 * config's `dependencies`.
 */
function patchManifest(
  runDir: string,
  input: AssembleFixtureInput,
  config: SmokeConfig
) {
  const pkgPath = path.join(runDir, 'package.json')
  const pkg = readJson(pkgPath)

  pkg.name = `smoke-${input.name}`
  pkg.private = true

  const fileRef = (tarball: string) =>
    `file:${path.relative(runDir, tarball).split(path.sep).join('/')}`

  // The shells are generic consumer projects; which workspace packages they
  // install is the config's single declaration, not theirs.
  for (const field of ['dependencies', 'devDependencies'] as const) {
    for (const depName of Object.keys(pkg[field] ?? {})) {
      if (depName.startsWith('@vueform/')) {
        throw new SmokeError(
          `Fixture "${input.env.fixture}" names ${depName} in its ` +
            `package.json — workspace packages are declared once in ` +
            `tests/smoke/config.json instead.`
        )
      }
    }
  }

  const adapterPkg: string = readJson(
    path.join(input.adapterDir, 'package.json')
  ).name
  // The universal set every assembled run installs: the adapter, core (a
  // packed peer throughout the closure), the canonical config's always-on
  // plugin, and the nuxt module for nuxt fixtures — plus the adapter's own
  // config.json extras.
  const workspaceDeps = [
    ...new Set([
      adapterPkg,
      '@vueform/core',
      '@vueform/expr-eval',
      ...(config.dependencies ?? []),
      ...(input.env.framework === 'nuxt' ? ['@vueform/nuxt-module'] : []),
    ]),
  ]

  pkg.dependencies = pkg.dependencies ?? {}

  // The fixture's Playwright must match the workspace's: ensureBrowsers
  // warms the browser cache with the workspace version before the env
  // fan-out, and a freshly resolved newer Playwright would demand browser
  // builds that are not in that cache.
  const workspacePw = path.join(
    input.adapterDir,
    'node_modules',
    '@playwright/test',
    'package.json'
  )
  if (pkg.devDependencies?.['@playwright/test'] && exists(workspacePw)) {
    pkg.devDependencies['@playwright/test'] = readJson(workspacePw).version
  }

  // Registry packages a consumer installs alongside the adapter (component
  // library, themes, icons) — plain semver, resolved from the registry.
  for (const [depName, range] of Object.entries(
    config.registryDependencies ?? {}
  )) {
    pkg.dependencies[depName] = range
  }

  for (const depName of workspaceDeps) {
    const tarball = input.tarballs.byName.get(depName)
    if (!tarball) {
      throw new SmokeError(
        `Smoke dependency ${depName} has no packed tarball — is the package private or unbuilt?`
      )
    }
    pkg.dependencies[depName] = fileRef(tarball)
  }

  const overrides: Record<string, string> = {}
  for (const [depName, tarball] of input.tarballs.byName) {
    overrides[depName] = fileRef(tarball)
  }
  // The fixture's vue pin wins graph-wide: npm's strict peer resolver
  // otherwise rejects a prerelease pin (the vapor env's 3.6 RC) against the
  // packages' `^3.5` peer ranges, and a second vue identity would break the
  // runtime anyway.
  if (pkg.dependencies?.vue) overrides.vue = pkg.dependencies.vue
  applyOverrides(pkg, input.pm, overrides)

  if (input.pm === 'yarn') pkg.packageManager = `yarn@${yarnVersion()}`

  // Standalone installs run their own build scripts (same as the vapor
  // playgrounds): esbuild's postinstall is just a binary sanity check.
  // npm and yarn run dependency scripts by default; pnpm and bun need the
  // explicit allowance.
  if (input.pm === 'pnpm') {
    pkg.pnpm = { ...pkg.pnpm, onlyBuiltDependencies: ['esbuild'] }
  } else if (input.pm === 'bun') {
    pkg.trustedDependencies = ['esbuild']
  }

  writeJson(pkgPath, pkg)
}

/**
 * Playwright drives the boot and interaction stages against the fixture's
 * own `serve` script. Always headless.
 */
function writePlaywrightConfig(runDir: string, input: AssembleInput) {
  const [cmd, ...args] = [input.pm, ...runScriptArgs(input.pm, 'serve')]
  const config = [
    `import { defineConfig } from '@playwright/test'`,
    ``,
    `export default defineConfig({`,
    `  testDir: './e2e',`,
    `  fullyParallel: false,`,
    `  workers: 1,`,
    `  retries: 0,`,
    `  reporter: [['list']],`,
    `  use: {`,
    `    baseURL: 'http://127.0.0.1:${input.port}',`,
    `    headless: true,`,
    `  },`,
    `  webServer: {`,
    `    command: ${JSON.stringify([cmd, ...args].join(' '))},`,
    `    url: 'http://127.0.0.1:${input.port}',`,
    `    reuseExistingServer: false,`,
    `    timeout: 120_000,`,
    `    env: {`,
    `      SMOKE_PORT: '${input.port}',`,
    ...Object.entries(input.env.fixtureEnv ?? {}).map(
      ([k, v]) => `      ${JSON.stringify(k)}: ${JSON.stringify(v)},`
    ),
    `    },`,
    `  },`,
    `})`,
    ``,
  ].join('\n')

  fs.writeFileSync(path.join(runDir, 'playwright.config.mjs'), config)
}

export function runName(input: Pick<AssembleInput, 'adapter' | 'env'>) {
  return `${input.adapter}-${input.env.id}`
}

/**
 * The generic fixture shells live with the other shared templates in utils
 * (`fixtures/smoke-test/envs/<name>`), adapter-free by construction: their
 * workspace deps come from the adapter's config.json, `createVueform` from
 * the generated adapter module, and the nuxt adapter name from the generated
 * run metadata.
 */
export function fixtureDir(env: FixtureEnv) {
  return path.join(templatesDir, 'envs', env.fixture)
}

/**
 * The shared assembly core: the fixture copied into its run dir, shared
 * content injected, the adapter indirection generated and the manifest
 * rewired to the tarballs. The smoke runner layers Playwright on top of this;
 * the smoke-types runner layers its typecheck configs instead.
 */
export async function assembleFixture(
  input: AssembleFixtureInput
): Promise<string> {
  const dir = path.join(input.runsDir, input.name)
  const src = fixtureDir(input.env)

  const config = readSmokeConfig(input.adapterDir, input.adapter)

  // Async on purpose: the previous run dir holds a full node_modules, and a
  // synchronous rm of it blocks the event loop for seconds — freezing the
  // display's spinners while parallel envs assemble one after another. The
  // remaining copies below are a handful of small files.
  await fs.promises.rm(dir, { recursive: true, force: true })
  copyFixture(src, dir)

  // Yarn berry would otherwise default to PnP and immutable installs; the
  // rc pins the node-modules linker (classic yarn ignores the file).
  if (input.pm === 'yarn') {
    fs.writeFileSync(
      path.join(dir, '.yarnrc.yml'),
      'nodeLinker: node-modules\nenableImmutableInstalls: false\n'
    )
  }

  copySharedApp(dir, input.env)
  copyAdapterContent(dir, input)
  generateCanonicalContent(dir, input, config)
  writeAdapterModule(dir, input, config)
  patchManifest(dir, input, config)

  // The generated run-metadata module — nuxt.config.ts reads the adapter
  // name from it. A const literal on purpose: the @vueform/nuxt-module module's
  // `adapter` option is a union of known adapters, so a wrong name fails
  // its typecheck instead of widening to string (as a JSON import would).
  fs.writeFileSync(
    path.join(dir, 'smoke', 'run-meta.ts'),
    [
      `// Generated by the smoke harness. Do not edit.`,
      `export const adapter = ${JSON.stringify(input.adapter)} as const`,
      ``,
    ].join('\n')
  )

  return dir
}

export async function assembleRun(input: AssembleInput): Promise<SmokeRun> {
  const name = runName(input)
  const dir = await assembleFixture({ ...input, name })

  copySharedSpecs(dir)
  writePlaywrightConfig(dir, input)
  writeJson(path.join(dir, 'smoke', 'run.json'), {
    adapter: input.adapter,
    env: input.env.id,
    pm: input.pm,
    port: input.port,
    framework: input.env.framework,
    rendering: input.env.rendering,
    mode: input.env.mode,
  })

  return { dir, name, baseUrl: `http://127.0.0.1:${input.port}` }
}
