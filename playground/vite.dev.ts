/**
 * Monorepo-only Vite plugin that aliases `@vueform/*` imports to workspace
 * source so playgrounds run against `packages/*\/src` without building.
 *
 * Imported RELATIVELY (no package) from the playground templates and the smoke
 * apps. The relative paths only work because each consumer sits at the same
 * depth in its copied location as in its source location:
 * `playground/templates/<name>` ↔ `.playgrounds/templates/<name>` and
 * `scripts/smoke/<name>` ↔ `.smoke-tmp/<name>`.
 */
import { existsSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { Alias, Plugin } from 'vite'

type Adapter = 'ui' | 'primevue' | (string & {})

function findMonorepoRoot(startDir: string): string {
  let dir = startDir
  while (dir !== dirname(dir)) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return dir
    dir = dirname(dir)
  }
  throw new Error(
    '[vueform-dev] Could not find monorepo root (no pnpm-workspace.yaml found)'
  )
}

export function vueformDev(adapter: Adapter): Plugin {
  let root = ''
  let projectRoot = ''
  let isBuild = false
  const adapterPkg = adapter
  const adapterScope = `@vueform/${adapterPkg}`

  return {
    name: 'vueform-dev',
    enforce: 'pre',

    config(config, { command, mode }) {
      isBuild =
        mode === 'production' || (command === 'build' && mode !== 'development')
      if (isBuild) return

      projectRoot = config.root || process.cwd()
      root = findMonorepoRoot(projectRoot)
      const p = (rel: string) => resolve(root, rel)
      const coreComponents = p('packages/core/src/components')

      const adapterSrc = p(`packages/${adapterPkg}/src`)
      const singleThemeIndex = resolve(adapterSrc, 'theme/index.ts')
      const hasSingleTheme = existsSync(singleThemeIndex)
      // The tier the adapter's default component subpath serves: `styled`
      // when the adapter attaches per-component CSS, else `unstyled`.
      const adapterTier = readdirSync(resolve(adapterSrc, 'components'), {
        withFileTypes: true,
      }).some(
        (entry) =>
          entry.isDirectory() &&
          existsSync(resolve(adapterSrc, 'components', entry.name, 'styled.ts'))
      )
        ? 'styled'
        : 'unstyled'

      const alias: Alias[] = [
        {
          find: '#shorthands',
          replacement: p('packages/core/src/types/shorthands.ts'),
        },
        {
          find: /^@vueform\/core\/components\/([^/]+)\/raw$/,
          replacement: `${coreComponents}/$1/index.ts`,
        },
        {
          find: /^@vueform\/core\/components\/([^/]+)$/,
          replacement: `${coreComponents}/$1/unstyled.ts`,
        },
        {
          find: /^@vueform\/core\/blueprints\/(.+)$/,
          replacement: `${p('packages/core/src/blueprints')}/$1`,
        },
        {
          find: /^@vueform\/core\/([\w-]+)\.s?css$/,
          replacement: p('packages/core/src/scss/$1.scss'),
        },
        {
          find: '@vueform/core/rules',
          replacement: p('packages/core/src/rules/index.ts'),
        },
        {
          find: '@vueform/core/modules',
          replacement: p('packages/core/src/modules/modules.ts'),
        },
        {
          find: '@vueform/core/locales',
          replacement: p('packages/core/src/locales/index.ts'),
        },
        {
          find: '@vueform/core/tokens',
          replacement: p('packages/core/src/tokens/index.ts'),
        },
        {
          // Anchored: a bare-string find would prefix-match subpaths like
          // `@vueform/core/vapor/...` and mangle them before resolveId runs.
          find: /^@vueform\/core$/,
          replacement: p('packages/core/src/index.ts'),
        },
        {
          find: new RegExp(`^${adapterScope}/(plugin|full)$`),
          replacement: p(`packages/${adapterPkg}/src/$1.ts`),
        },
        {
          find: new RegExp(`^${adapterScope}/vapor$`),
          replacement: p(`packages/${adapterPkg}/src/index.ts`),
        },
        ...(hasSingleTheme
          ? [
              {
                find: new RegExp(`^${adapterScope}/tokens$`),
                replacement: resolve(adapterSrc, 'theme/tokens.ts'),
              },
              {
                find: new RegExp(`^${adapterScope}/theme$`),
                replacement: singleThemeIndex,
              },
              {
                find: new RegExp(`^${adapterScope}/index\\.s?css$`),
                replacement: resolve(adapterSrc, 'theme/index.scss'),
              },
            ]
          : []),
        // Theme tiles of the flat entry structure: raw token maps, the
        // flattened theme.css (served as the recipe in dev), and per-chunk
        // css/scss (adapter-local scss sources, or forwarders of core's).
        // Must precede the generic single-segment alias below.
        ...(!hasSingleTheme
          ? [
              {
                find: new RegExp(`^${adapterScope}/(?:vapor/)?tokens$`),
                replacement: p(`packages/${adapterPkg}/src/themes/tokens.ts`),
              },
              {
                find: new RegExp(`^${adapterScope}/(?:vapor/)?themes$`),
                replacement: p(`packages/${adapterPkg}/src/themes/index.ts`),
              },
              {
                find: new RegExp(`^${adapterScope}/theme\\.s?css$`),
                replacement: p(`packages/${adapterPkg}/src/scss/theme.scss`),
              },
              {
                find: new RegExp(`^${adapterScope}/([\\w-]+)\\.s?css$`),
                replacement: p(`packages/${adapterPkg}/src/scss/$1.scss`),
              },
              {
                find: new RegExp(`^${adapterScope}/vapor/([\\w-]+)\\.s?css$`),
                replacement: p(`packages/${adapterPkg}/src/scss/$1.scss`),
              },
            ]
          : []),
        {
          find: new RegExp(`^${adapterScope}/blueprints/([^/]+)$`),
          replacement: p(`packages/${adapterPkg}/src/blueprints/$1.ts`),
        },
        {
          find: new RegExp(`^${adapterScope}/components/([^/]+)/raw$`),
          replacement: p(`packages/${adapterPkg}/src/components/$1/index.ts`),
        },
        {
          find: new RegExp(`^${adapterScope}/components/([^/]+)/unstyled$`),
          replacement: p(
            `packages/${adapterPkg}/src/components/$1/unstyled.ts`
          ),
        },
        {
          find: new RegExp(`^${adapterScope}/components/([^/]+)/styles$`),
          replacement: p(`packages/${adapterPkg}/src/components/$1/styles.ts`),
        },
        {
          find: new RegExp(`^${adapterScope}/components/([^/]+)$`),
          replacement: p(
            `packages/${adapterPkg}/src/components/$1/${adapterTier}.ts`
          ),
        },
        {
          find: new RegExp(
            `^${adapterScope}/(?!components|plugin|full)([^/]+)$`
          ),
          replacement: p(`packages/${adapterPkg}/src/$1.ts`),
        },
        {
          find: `${adapterScope}/components`,
          replacement: p(`packages/${adapterPkg}/src/components/index.ts`),
        },
        ...(hasSingleTheme
          ? [
              {
                find: new RegExp(`^${adapterScope}/vapor/tokens$`),
                replacement: resolve(adapterSrc, 'theme/tokens.ts'),
              },
              {
                find: new RegExp(`^${adapterScope}/vapor/theme$`),
                replacement: singleThemeIndex,
              },
              {
                find: new RegExp(`^${adapterScope}/vapor/index\\.s?css$`),
                replacement: resolve(adapterSrc, 'theme/index.scss'),
              },
            ]
          : []),
        {
          find: new RegExp(`^${adapterScope}/vapor/blueprints/([^/]+)$`),
          replacement: p(`packages/${adapterPkg}/src/blueprints/$1.ts`),
        },
        {
          find: new RegExp(`^${adapterScope}/vapor/components/([^/]+)/raw$`),
          replacement: p(`packages/${adapterPkg}/src/components/$1/index.ts`),
        },
        {
          find: new RegExp(
            `^${adapterScope}/vapor/components/([^/]+)/unstyled$`
          ),
          replacement: p(
            `packages/${adapterPkg}/src/components/$1/unstyled.ts`
          ),
        },
        {
          find: new RegExp(`^${adapterScope}/vapor/components/([^/]+)/styles$`),
          replacement: p(`packages/${adapterPkg}/src/components/$1/styles.ts`),
        },
        {
          find: new RegExp(`^${adapterScope}/vapor/components/([^/]+)$`),
          replacement: p(
            `packages/${adapterPkg}/src/components/$1/${adapterTier}.ts`
          ),
        },
        {
          find: new RegExp(
            `^${adapterScope}/vapor/(?!components|plugin|full)([^/]+)$`
          ),
          replacement: p(`packages/${adapterPkg}/src/$1.ts`),
        },
        {
          find: `${adapterScope}/vapor/components`,
          replacement: p(`packages/${adapterPkg}/src/components/index.ts`),
        },
        {
          find: new RegExp(`^${adapterScope}$`),
          replacement: p(`packages/${adapterPkg}/src/index.ts`),
        },
        {
          find: '@vueform/devtools',
          replacement: p('packages/devtools/src/index.ts'),
        },
      ]

      return { resolve: { alias } }
    },

    resolveId(source, importer) {
      if (isBuild || !importer) return null

      // In dev the `./vapor` subpaths serve the same source files as the main
      // entries (the vapor/vdom split only exists in the built dist) — strip
      // the segment and re-resolve so the source aliases above apply.
      const vapor = source.match(/^(@vueform\/[^/]+)\/vapor(\/.+)?$/)
      if (vapor) {
        return this.resolve(vapor[1] + (vapor[2] ?? ''), importer, {
          skipSelf: true,
        })
      }

      if (source.startsWith('~/')) {
        return this.resolve(
          resolve(root, 'packages/core/src', source.slice(2)),
          importer,
          { skipSelf: true }
        )
      }

      if (source.startsWith('@/')) {
        return this.resolve(
          resolve(root, `packages/${adapterPkg}/src`, source.slice(2)),
          importer,
          { skipSelf: true }
        )
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
