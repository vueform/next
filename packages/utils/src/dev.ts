/**
 * Monorepo dev-server plugin that aliases `@vueform/*` imports to workspace
 * source so playgrounds run against `packages/*\/src` without building.
 *
 * The aliases are derived from the packages' `exports` maps (see
 * `sourceAliases.ts`), so the published entry points stay the single source of
 * truth — a package that adds or repoints an export needs no change here.
 *
 * Outside the monorepo (no `pnpm-workspace.yaml` up-tree, e.g. a template
 * copied into a StackBlitz sandbox), the plugin is inert: imports resolve to
 * the installed packages instead.
 */
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import type { Alias, Plugin } from 'vite'

import { workspaceSourceAliases } from './sourceAliases'

function findMonorepoRoot(startDir: string): string | null {
  let dir = startDir
  while (dir !== dirname(dir)) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return dir
    dir = dirname(dir)
  }
  return null
}

export function dev(adapter: string): Plugin {
  let root: string | null = null
  let projectRoot = ''
  let isBuild = false
  const adapterPkg = adapter

  return {
    name: 'vueform-dev',
    enforce: 'pre',

    config(config, { command, mode }) {
      isBuild =
        mode === 'production' || (command === 'build' && mode !== 'development')
      if (isBuild) return

      projectRoot = config.root || process.cwd()
      root = findMonorepoRoot(projectRoot)
      if (!root) return

      const p = (rel: string) => resolve(root!, rel)

      const alias: Alias[] = [
        // is covered by the workspace aliases' source stand-in.
        ...workspaceSourceAliases(p('packages'), { styles: true }),
      ]

      return { resolve: { alias } }
    },

    resolveId(source: string, importer?: string) {
      if (isBuild || !root || !importer) return null

      // In dev the `./vapor` subpaths serve the same source files as the main
      // entries (the vapor/vdom split only exists in the built dist) — strip
      // the segment and re-resolve so the source aliases above apply.
      const vapor = source.match(/^(@vueform\/[^/]+)\/vapor(\/.+)?$/)
      if (vapor) {
        return this.resolve(vapor[1] + (vapor[2] ?? ''), importer, {
          skipSelf: true,
        })
      }

      if (projectRoot && source.startsWith(projectRoot)) {
        const stripped = source.slice(projectRoot.length).replace(/^\/+/, '')
        if (stripped && !existsSync(source) && !existsSync(source + '.ts')) {
          if (importer.includes('/packages/core/')) {
            return this.resolve(
              resolve(root, 'packages/core/src', stripped),
              importer,
              { skipSelf: true }
            )
          }
          if (importer.includes(`/packages/${adapterPkg}/`)) {
            return this.resolve(
              resolve(root, `packages/${adapterPkg}/src`, stripped),
              importer,
              { skipSelf: true }
            )
          }
        }
      }

      return null
    },
  }
}
