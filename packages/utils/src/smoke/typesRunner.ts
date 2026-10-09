/**
 * Runs one smoke-types env end to end: assemble (the shared fixture core,
 * plus the env's typecheck config and checker devDeps), install (+ leak
 * check — a workspace-resolved package would typecheck workspace types, not
 * the tarballs'), then the env's checker. No build, no browser: a types env
 * proves the shipped d.ts work for a consumer, nothing more.
 *
 * All child output goes to the invocation's log (`input.log`); progress is
 * reported per stage through `input.report`.
 */
import fs from 'node:fs'
import path from 'node:path'

import fg from 'fast-glob'

import { assembleFixture } from './assemble'
import type { StageStatus, TypesStageName } from './display'
import type { Pm } from './envs'
import { leakCheck } from './leak'
import { readJson, run, SmokeError, writeJson } from './lib'
import type { PackedTarballs } from './pack'
import { execArgs, installArgs, withInstallLock } from './pm'
import { DEFAULT_TYPESCRIPT, type TypeEnvDef } from './typesEnvs'

const TSCONFIG = 'tsconfig.smoke-types.json'

export interface TypesEnvRunInput {
  root: string
  adapter: string
  adapterDir: string
  env: TypeEnvDef
  tarballs: PackedTarballs
  runsDir: string
  /**
   * The package manager the run installs and executes with.
   */
  pm: Pm
  log: (text: string) => void
  report: (stage: TypesStageName, status: StageStatus) => void
}

export interface TypesEnvResult {
  adapter: string
  env: TypeEnvDef
  status: 'pass' | 'fail' | 'skip'
  detail?: string
  /**
   * The stage the failure happened in, when status is 'fail'.
   */
  stage?: TypesStageName
  /**
   * Tail of the failing step's output (full output is in the log file).
   */
  logTail?: string
}

export function typesRunName(adapter: string, env: TypeEnvDef) {
  // Plain `<adapter>-<env>` — the smoke-types state dir is the namespace.
  return `${adapter}-${env.id}`
}

/**
 * The checker's own devDependencies, injected into the assembled manifest so
 * one install covers everything. The fixtures stay pure runtime consumers —
 * which TypeScript checks them is an env decision, not a fixture one.
 */
function injectCheckerDeps(runDir: string, env: TypeEnvDef) {
  const pkgPath = path.join(runDir, 'package.json')
  const pkg = readJson(pkgPath)

  pkg.devDependencies = {
    ...pkg.devDependencies,
    typescript: env.typescript ?? DEFAULT_TYPESCRIPT,
    ...(env.check === 'tsc-probe' ? {} : { 'vue-tsc': 'latest' }),
  }
  // The probe never compiles the fixture app, so the fixture's tsconfig
  // preset is dead weight — and its `typescript@5.x` peer makes npm's
  // strict resolver hard-fail the TS 6/7 probes.
  if (env.check === 'tsc-probe') {
    delete pkg.devDependencies['@vue/tsconfig']
  }
  writeJson(pkgPath, pkg)
}

/**
 * One representative specifier per wildcard exports family of the adapter
 * (`./components/*` → `@vueform/<adapter>/components/<first match>`),
 * derived from the exports map and the dist contents, first match in sort
 * order for determinism. attw skips wildcard subpaths entirely ("(wildcard)"
 * rows), so the probe imports generated from these are the only dist-level
 * check those families get. Families without a `types` condition (css/scss)
 * and empty families are skipped.
 */
function wildcardSpecifiers(adapterDir: string): string[] {
  const pkg = readJson(path.join(adapterDir, 'package.json'))
  const pkgName: string = pkg.name
  const specifiers: string[] = []

  for (const [subpath, target] of Object.entries(pkg.exports ?? {})) {
    if (!subpath.includes('*')) continue
    if (!target || typeof target !== 'object') continue
    const typesTarget = (target as Record<string, unknown>).types
    if (typeof typesTarget !== 'string') continue

    // The exports spec allows a single `*` per pattern; derive its value
    // from the first file the types pattern matches in the package dir.
    const pattern = typesTarget.replace(/^\.\//, '')
    const parts = pattern.split('*')
    if (parts.length !== 2) continue
    const match = fg.sync(pattern, { cwd: adapterDir }).sort()[0]
    if (!match) continue
    const value = match.slice(parts[0].length, match.length - parts[1].length)

    specifiers.push(`${pkgName}${subpath.slice(1).replace('*', value)}`)
  }

  return specifiers
}

/**
 * The import + export-tuple lines proving a list of specifiers resolves to
 * usable types (namespace imports on purpose: resolution, not shape).
 */
function specifierProbeLines(specifiers: string[]): string[] {
  return [
    ...specifiers.map((s, i) => `import * as wildcard${i} from '${s}'`),
    ``,
    `export type WildcardSubpaths = [`,
    ...specifiers.map((_, i) => `  typeof wildcard${i},`),
    `]`,
  ]
}

/**
 * Writes the env's typecheck entry: a generated wildcard-subpath probe for
 * every env, plus — for `vue-tsc` — a tsconfig extending the fixture's own
 * (so the env checks exactly what the fixture includes: app sources, the
 * injected smoke content and the adapter's type-tests, with the env's
 * compilerOptions on top), or — for `tsc-probe` — a self-contained nodenext
 * config over a generated probe of the package surface.
 */
function writeTypecheckConfig(runDir: string, input: TypesEnvRunInput) {
  const { env } = input
  const wildcards = wildcardSpecifiers(input.adapterDir)

  if (env.check !== 'tsc-probe') {
    // Checked through the fixture's program (its tsconfig, or nuxi's
    // generated one, includes smoke/**) under the env's own resolution.
    fs.writeFileSync(
      path.join(runDir, 'smoke', 'wildcard-subpaths.types.ts'),
      [
        `// Generated by the smoke-types harness — one representative import`,
        `// per wildcard exports family, derived from the exports map (attw`,
        `// skips wildcard subpaths). Do not edit.`,
        ...specifierProbeLines(wildcards),
        ``,
      ].join('\n')
    )
  }

  if (env.check === 'nuxi') return

  if (env.check === 'vue-tsc') {
    writeJson(path.join(runDir, TSCONFIG), {
      extends: './tsconfig.json',
      compilerOptions: { noEmit: true, ...env.compilerOptions },
    })
    return
  }

  const pkgName: string = readJson(
    path.join(input.adapterDir, 'package.json')
  ).name

  const probeDir = path.join(runDir, 'smoke-types')
  fs.mkdirSync(probeDir, { recursive: true })
  fs.writeFileSync(
    path.join(probeDir, 'probe.ts'),
    [
      `// Generated by the smoke-types harness — resolves the package surface`,
      `// (bare entry, components, one representative of each wildcard exports`,
      `// family) under nodenext exactly as a raw tsc/ts-node consumer would.`,
      `// Do not edit. Named-subpath resolution coverage is attw's job; this`,
      `// proves the wildcard families and the d.ts CONTENTS hold up`,
      `// (skipLibCheck: false) under node resolution.`,
      `import * as adapter from '${pkgName}'`,
      `import '${pkgName}/components'`,
      ...specifierProbeLines(wildcards),
      ``,
      `export type AdapterSurface = typeof adapter`,
      ``,
    ].join('\n')
  )

  writeJson(path.join(runDir, TSCONFIG), {
    compilerOptions: {
      module: 'nodenext',
      moduleResolution: 'nodenext',
      strict: true,
      skipLibCheck: false,
      noEmit: true,
      types: [],
      ...env.compilerOptions,
    },
    // The adapter's committed ambient shims (smoke/setup/*.d.ts, plus the
    // shared app's globals) join the probe — a strict consumer declares
    // away upstream packages that ship broken types, and so does this env.
    include: ['smoke-types', 'smoke/**/*.d.ts'],
  })
}

function checkerArgs(env: TypeEnvDef, pm: Pm): string[] {
  switch (env.check) {
    case 'vue-tsc':
      return execArgs(pm, 'vue-tsc', ['-p', TSCONFIG])
    case 'tsc-probe':
      return execArgs(pm, 'tsc', ['-p', TSCONFIG])
    case 'nuxi':
      return execArgs(pm, 'nuxi', ['typecheck'])
  }
}

export async function runTypesEnv(input: TypesEnvRunInput): Promise<void> {
  const { env, log, report, pm } = input
  const tag = `${input.adapter}:${env.id}`

  const step = async (stage: TypesStageName, fn: () => Promise<void>) => {
    report(stage, 'active')
    try {
      await fn()
    } catch (error) {
      report(stage, 'fail')
      if (error instanceof SmokeError) {
        throw Object.assign(error, { stage })
      }
      throw error
    }
    report(stage, 'pass')
  }

  log(`\n===== ${tag} (${env.check}) =====`)
  const dir = await assembleFixture({
    root: input.root,
    adapter: input.adapter,
    adapterDir: input.adapterDir,
    env,
    tarballs: input.tarballs,
    runsDir: input.runsDir,
    pm,
    name: typesRunName(input.adapter, env),
  })
  injectCheckerDeps(dir, env)
  writeTypecheckConfig(dir, input)

  await step('install', async () => {
    await withInstallLock(pm, () =>
      run(pm, installArgs(pm), {
        cwd: dir,
        log,
        fail: `[smoke-types:${tag}] Install failed`,
      })
    )
    leakCheck(dir, log)
  })

  await step('typecheck', () =>
    run(pm, checkerArgs(env, pm), {
      cwd: dir,
      log,
      fail: `[smoke-types:${tag}] Typecheck failed`,
    })
  )
}
