/**
 * Package-manager abstraction for smoke runs. pnpm is the default and gates
 * CI; npm, yarn (pinned to the node-modules linker by the assemble step's
 * .yarnrc.yml) and bun are selectable per run via the CLIs' `--pm` flag as
 * the occasional cross-PM proof. The differences the harness cares about:
 * install argv (fixtures live inside the pnpm workspace, so pnpm needs
 * --ignore-workspace), where tarball overrides go in package.json, and who
 * may run dependency build scripts (see patchManifest).
 */
import type { Pm } from './envs'

/**
 * yarn classic's global cache is not concurrency-safe — parallel env
 * installs race it (cold-cache runs fail on cache ENOENT/merge errors), so
 * yarn installs are serialized through this chain. The other package
 * managers install concurrently.
 */
let yarnInstalls: Promise<unknown> = Promise.resolve()

export function withInstallLock<T>(pm: Pm, fn: () => Promise<T>): Promise<T> {
  if (pm !== 'yarn') return fn()
  const next = yarnInstalls.then(fn, fn)
  yarnInstalls = next.catch(() => undefined)
  return next
}

export function installArgs(pm: Pm): string[] {
  switch (pm) {
    case 'pnpm':
      return ['install', '--ignore-workspace']
    case 'npm':
      return ['install', '--no-audit', '--no-fund']
    case 'yarn':
      // Plain install: classic doesn't know --no-immutable, and berry's
      // immutability is disabled via the .yarnrc.yml the assemble step
      // writes (which also pins the node-modules linker).
      return ['install']
    case 'bun':
      return ['install']
  }
}

export function runScriptArgs(pm: Pm, script: string): string[] {
  return ['run', script]
}

export function execArgs(pm: Pm, bin: string, args: string[]): string[] {
  switch (pm) {
    case 'pnpm':
      return ['exec', bin, ...args]
    case 'npm':
      return ['exec', '--no', '--', bin, ...args]
    case 'yarn':
      // Not `exec`: yarn classic's exec SWALLOWS the bin's arguments
      // (`yarn exec tsc -p x` runs a bare `tsc`); `run` resolves .bin
      // entries and forwards args on both classic and berry.
      return ['run', bin, ...args]
    case 'bun':
      return ['x', '--no-install', bin, ...args]
  }
}

/**
 * Writes the tarball overrides into a fixture manifest in the form the package
 * manager honors. Every packed `@vueform/*` name is overridden — `pnpm pack`
 * rewrites `workspace:*` to plain semver, so without these the tarballs' own
 * `@vueform/*` dependencies would resolve from the registry instead of the
 * local pack output.
 */
export function applyOverrides(
  pkg: Record<string, any>,
  pm: Pm,
  overrides: Record<string, string>
) {
  switch (pm) {
    case 'pnpm':
      pkg.pnpm = {
        ...pkg.pnpm,
        overrides: { ...pkg.pnpm?.overrides, ...overrides },
      }
      break
    case 'npm':
    case 'bun':
      pkg.overrides = { ...pkg.overrides, ...overrides }
      break
    case 'yarn':
      pkg.resolutions = { ...pkg.resolutions, ...overrides }
      break
  }
}
