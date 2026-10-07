/**
 * Packs every publishable workspace package into local tarballs — smoke
 * fixtures install these, so they consume exactly what a user would get from
 * the registry (exports maps, dist files, rewritten .d.ts, bin entries).
 *
 * All non-private `packages/*` manifests are packed; the dependency closure of
 * any adapter is a subset, so nothing needs a hardcoded list. `pnpm pack`
 * rewrites `workspace:*` ranges to concrete semver, which is why fixture
 * manifests additionally override every packed name to its tarball (see
 * assemble.ts) — otherwise transitive deps would resolve from the registry.
 */
import fs from 'node:fs'
import path from 'node:path'

import { exists, readJson, run, runCapture, SmokeError, writeJson } from './lib'

interface PackablePackage {
  name: string
  dir: string
}

export interface PackedTarballs {
  dir: string
  /**
   * Package name → absolute tarball path.
   */
  byName: Map<string, string>
}

function discoverPackable(root: string): PackablePackage[] {
  const packagesDir = path.join(root, 'packages')

  return fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .flatMap((e) => {
      const pkgPath = path.join(packagesDir, e.name, 'package.json')
      if (!exists(pkgPath)) return []

      const pkg = readJson(pkgPath)
      if (!pkg.name || pkg.private) return []

      return [{ name: pkg.name as string, dir: path.join(packagesDir, e.name) }]
    })
}

/**
 * Guards against silently packing a stale or empty package: everything that
 * ships a `dist` must have one (fresh `pnpm build`), or the tarball would
 * install "successfully" while missing its entire runtime.
 */
function assertBuilt(packages: PackablePackage[]) {
  const missing = packages.filter((p) => {
    const files: string[] =
      readJson(path.join(p.dir, 'package.json')).files ?? []
    return files.includes('dist') && !exists(path.join(p.dir, 'dist'))
  })

  if (missing.length) {
    throw new SmokeError(
      `Missing dist for ${missing.map((p) => p.name).join(', ')} — run \`pnpm build\` first.`
    )
  }
}

/**
 * Static verification of the packed output: `publint` checks each package's
 * publish shape (files, exports map, field consistency) and `attw` checks
 * that the tarball's types actually resolve under every resolution mode — the
 * class of bug no workspace type-check can see. ESM-only packages (no
 * `require` condition on the root export) use attw's esm-only profile, which
 * skips the CJS-from-node16 expectations they intentionally do not meet.
 */
function verifyTarballs(
  packages: PackablePackage[],
  byName: Map<string, string>
) {
  for (const pkg of packages) {
    console.log(`[smoke] publint ${pkg.name}...`)
    run('pnpm', ['exec', 'publint'], {
      cwd: pkg.dir,
      fail: `publint failed for ${pkg.name}`,
    })

    const tarball = byName.get(pkg.name)!
    const rootExport = readJson(path.join(pkg.dir, 'package.json')).exports?.[
      '.'
    ]
    const esmOnly =
      !!rootExport &&
      typeof rootExport === 'object' &&
      !('require' in rootExport)

    console.log(`[smoke] attw ${pkg.name}...`)
    run(
      'pnpm',
      ['exec', 'attw', ...(esmOnly ? ['--profile', 'esm-only'] : []), tarball],
      { cwd: pkg.dir, fail: `attw failed for ${pkg.name}` }
    )
  }
}

const MANIFEST = 'manifest.json'

export function packWorkspace(
  root: string,
  tarballsDir: string,
  opts: { skipPack: boolean }
): PackedTarballs {
  if (opts.skipPack) {
    const manifestPath = path.join(tarballsDir, MANIFEST)
    if (!exists(manifestPath)) {
      throw new SmokeError(
        '--skip-pack given but no packed tarballs found — run once without it.'
      )
    }

    const manifest: Record<string, string> = readJson(manifestPath)
    const byName = new Map<string, string>()
    for (const [name, file] of Object.entries(manifest)) {
      const abs = path.join(tarballsDir, file)
      if (!exists(abs)) {
        throw new SmokeError(
          `--skip-pack given but ${file} is missing — run once without it.`
        )
      }
      byName.set(name, abs)
    }

    console.log(`[smoke] Reusing ${byName.size} packed tarballs (--skip-pack).`)
    return { dir: tarballsDir, byName }
  }

  const packages = discoverPackable(root)
  assertBuilt(packages)

  fs.rmSync(tarballsDir, { recursive: true, force: true })
  fs.mkdirSync(tarballsDir, { recursive: true })

  const byName = new Map<string, string>()
  const manifest: Record<string, string> = {}

  for (const pkg of packages) {
    console.log(`[smoke] Packing ${pkg.name}...`)
    const stdout = runCapture(
      'pnpm',
      ['pack', '--pack-destination', tarballsDir],
      { cwd: pkg.dir, fail: `Packing ${pkg.name} failed` }
    )

    const lines = stdout.trim().split('\n')
    const tarball = lines[lines.length - 1].trim()
    if (!tarball.endsWith('.tgz') || !exists(tarball)) {
      throw new SmokeError(
        `Could not determine the tarball path for ${pkg.name} from \`pnpm pack\` output: ${tarball}`
      )
    }

    byName.set(pkg.name, tarball)
    manifest[pkg.name] = path.basename(tarball)
  }

  writeJson(path.join(tarballsDir, MANIFEST), manifest)
  console.log(`[smoke] Packed ${byName.size} packages into ${tarballsDir}`)

  verifyTarballs(packages, byName)

  return { dir: tarballsDir, byName }
}
