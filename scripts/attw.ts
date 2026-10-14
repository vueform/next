/**
 * attw GUI (`pnpm attw`): one live row per type-bearing package, fed by a
 * single cached `vpr :attw` run (scripts/attw-task.ts; tarballs packed first
 * via its `:pack` dependency) — rows flip as the gate's `✓/✗ <name>` result
 * lines stream by, and a cache hit completes them all instantly. Output goes
 * to `.vueform/attw/logs`.
 */
import fs from 'node:fs'
import path from 'node:path'

import { ensureUtilsDist } from './ensure-utils'

ensureUtilsDist()

async function main(): Promise<void> {
  const { runRows } = await import('./terminal')
  const { discoverPackages } = await import('./runner')

  // The same selection as the gate's: every package whose `files` ship a dist.
  const targets = discoverPackages().filter((pkg) => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(pkg.dir, 'package.json'), 'utf8')
    )
    return ((manifest.files ?? []) as string[]).includes('dist')
  })

  const ok = await runRows({
    title: 'attw (Are The Types Wrong)',
    scope: 'attw',
    rows: targets.map((pkg) => ({ name: pkg.name })),
    driver: {
      cmd: 'pnpm',
      args: ['exec', 'vpr', ':attw'],
      route: (line, api) => {
        const started = line.match(/attw \((\d+) tarballs\)/)
        if (started) for (const pkg of targets) api.running(pkg.name)
        const result = line.match(/^\s*([✓✗]) (@vueform\/\S+)$/)
        if (result) {
          if (result[1] === '✓') api.done(result[2])
          else api.fail(result[2])
        }
      },
    },
  })
  if (!ok) process.exit(1)
}

void main()
