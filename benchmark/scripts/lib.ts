import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const BENCH_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)
export const ROOT = path.resolve(BENCH_DIR, '..')
export const APP_DIR = path.join(BENCH_DIR, 'app')
export const TARBALLS_DIR = path.join(APP_DIR, '.tarballs')
export const RESULTS_JSON = path.join(
  BENCH_DIR,
  'results',
  'json',
  'benchmarks.json'
)
export const CHARTS_DIR = path.join(BENCH_DIR, 'results', 'charts')

/**
 * The dist packages the app consumes, packed as tarballs.
 */
const PACKAGES = ['ui', 'core', 'cli']

/**
 * Runs a command with captured output — the progress line in bench.ts owns the
 * terminal, so a child may not write to it. On failure the captured output
 * travels in the thrown error, which bench.ts prints after closing the bar.
 */
export function run(command: string, args: string[], cwd: string): void {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' })
  if (result.status !== 0) {
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim()
    fail(
      `\`${command} ${args.join(' ')}\` failed in ${path.relative(ROOT, cwd)}` +
        (output ? `\n\n${output}` : '')
    )
  }
}

function fail(message: string): never {
  // Thrown rather than printed + exited, so bench.ts can close its progress
  // line before the message lands.
  throw new Error(message)
}

/**
 * The built packages must exist before packing — their tarballs ship `dist`
 * only (@vueform/cli has no build step; it ships its bin directly).
 */
export function checkDistBuilt(): void {
  for (const name of PACKAGES.filter((name) => name !== 'cli')) {
    const dist = path.join(ROOT, 'packages', name, 'dist')
    if (!fs.existsSync(dist)) {
      fail(
        `packages/${name}/dist does not exist — run \`pnpm build\` at the repo root first`
      )
    }
  }

  if (!fs.existsSync(path.join(ROOT, 'packages', 'ui', 'dist', 'vapor'))) {
    fail(
      'packages/ui/dist/vapor does not exist — run `pnpm build` at the repo root first'
    )
  }
}

/**
 * The pinned Vapor-mode vue version, from the workspace catalog's `vue-vapor`
 * entry (`npm:vue@<version>`) — the same source scripts/playground uses.
 */
export function vaporVueVersion(): string {
  const yaml = fs.readFileSync(path.join(ROOT, 'pnpm-workspace.yaml'), 'utf8')
  const match = yaml.match(/^\s*vue-vapor:\s*npm:vue@(\S+)/m)

  if (!match) {
    fail(
      'no `vue-vapor: npm:vue@<version>` entry in the pnpm-workspace.yaml catalog'
    )
  }

  return match[1]
}

/**
 * The app's committed package.json can't read the catalog, so drift between its
 * vue pin and the catalog's `vue-vapor` entry is checked here instead.
 */
export function checkAppVueVersion(): void {
  const appPkg = JSON.parse(
    fs.readFileSync(path.join(APP_DIR, 'package.json'), 'utf8')
  )
  const catalog = vaporVueVersion()

  if (appPkg.dependencies.vue !== catalog) {
    fail(
      `benchmark/app pins vue ${appPkg.dependencies.vue} but the catalog's ` +
        `vue-vapor entry is ${catalog} — align benchmark/app/package.json ` +
        `with the catalog and rerun`
    )
  }
}

/**
 * Packs ui/core/cli dist into app/.tarballs with stable filenames.
 */
export function pack(): void {
  fs.mkdirSync(TARBALLS_DIR, { recursive: true })

  for (const name of PACKAGES) {
    const out = path.join(TARBALLS_DIR, `vueform-${name}.tgz`)
    run('pnpm', ['pack', '--out', out], path.join(ROOT, 'packages', name))
  }
}

/**
 * Standalone install: the app is excluded from the workspace so its Vue 3.6
 * never reaches workspace resolution. pnpm re-resolves the repacked tarballs by
 * content hash, so this also picks up fresh builds.
 */
export function installApp(): void {
  run('pnpm', ['install', '--ignore-workspace'], APP_DIR)

  // A registry-resolved @vueform package means an override is missing and
  // the run would measure a published build instead of the local one.
  const lock = fs.readFileSync(path.join(APP_DIR, 'pnpm-lock.yaml'), 'utf8')
  if (/@vueform\/[a-z-]+@(?!file:)/.test(lock)) {
    fail(
      'an @vueform package resolved from the registry instead of ' +
        'app/.tarballs — add it to the pnpm.overrides in app/package.json'
    )
  }
}

export function buildApp(mode: 'vdom' | 'vapor'): void {
  run('pnpm', ['run', `build:${mode}`], APP_DIR)
}
