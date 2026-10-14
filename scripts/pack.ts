/**
 * Tarball packing (`pnpm run pack`): one live row per publishable package,
 * fed by a single `vpr :pack` run (scripts/pack-task.ts) — the rows flip as
 * its `[pack] packing <name>…` lines stream by, and a cache hit completes
 * them all instantly. vp caching on the dists and manifests is untouched:
 * the GUI is a display shell around the same `:pack` task the smoke suites
 * depend on. Output goes to `.vueform/pack/logs`.
 */
import { ensureUtilsDist } from './ensure-utils'

ensureUtilsDist()

const { runRows } = await import('./terminal')
const { discoverPackages } = await import('./runner')

const packages = discoverPackages()

const ok = await runRows({
  title: 'Pack',
  scope: 'pack',
  rows: packages.map((pkg) => ({ name: pkg.name })),
  driver: {
    cmd: 'pnpm',
    args: ['exec', 'vpr', ':pack'],
    route: (line, api) => {
      const packing = line.match(/\[pack\] packing (\S+?)…?$/)
      if (packing) {
        // The previous package finished when the next one starts; the final
        // one (and full cache hits) resolve on the driver's exit.
        for (const pkg of packages) {
          if (pkg.name === packing[1]) api.running(pkg.name)
        }
        const index = packages.findIndex((pkg) => pkg.name === packing[1])
        if (index > 0) api.done(packages[index - 1].name)
      }
      if (/\[pack\] \d+ tarballs in /.test(line)) {
        for (const pkg of packages) api.done(pkg.name)
      }
    },
  },
})
if (!ok) process.exit(1)
