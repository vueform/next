/**
 * Package-manager abstraction for smoke runs. pnpm is the default and gates CI;
 * npm, yarn (node-modules linker) and bun run a scheduled "basic install proof"
 * on representative envs. The differences the harness cares about: install
 * argv (fixtures live inside the pnpm workspace, so pnpm needs
 * --ignore-workspace) and where tarball overrides go in package.json.
 */
import type { Pm } from './envs'

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
      return ['exec', bin, ...args]
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
