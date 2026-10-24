/**
 * The typecheck leg list shared by `pnpm typecheck` and `pnpm check`: one leg
 * per package with a `typecheck` script plus the root, docs and benchmark
 * extras, each carrying its cached `:typecheck:<id>` vp task. A `--filter`
 * value narrows the list to a single leg — package name, dir name, bare name
 * or `vueform.alias` (e.g. `pv`), or an extra leg's id (`root`, `docs`,
 * `benchmark`); an unknown value exits listing the available legs.
 *
 * Imports `./runner` (utils' dist) statically — the entry points import this
 * module dynamically against a pre-built utils dist.
 */
import fs from 'node:fs'
import path from 'node:path'

import { discoverPackages, filterMatchesPackage, repoRoot } from './runner'

export interface TypecheckLeg {
  /**
   * Selector and display id (`core`, `root`, `docs`).
   */
  id: string
  /**
   * The leg's cached vp task (`:typecheck:core`).
   */
  task: string
}

export function typecheckLegs(filter: string | undefined): TypecheckLeg[] {
  const packages = discoverPackages().filter((pkg) => pkg.scripts.typecheck)
  const extras = [
    'root',
    ...(fs.existsSync(path.join(repoRoot, 'docs')) ? ['docs'] : []),
    ...(fs.existsSync(path.join(repoRoot, 'benchmark')) ? ['benchmark'] : []),
  ]
  const leg = (id: string): TypecheckLeg => ({ id, task: `:typecheck:${id}` })

  if (filter === undefined) {
    return [...packages.map((pkg) => leg(pkg.id)), ...extras.map(leg)]
  }

  const pkg = packages.find((p) => filterMatchesPackage(filter, p))
  if (pkg) return [leg(pkg.id)]
  if (extras.includes(filter)) return [leg(filter)]

  console.error(
    `No typecheck leg matching "${filter}" (available: ${[
      ...packages.map((p) => [p.id, ...p.aliases].join('/')),
      ...extras,
    ].join(', ')}).`
  )
  process.exit(1)
}
