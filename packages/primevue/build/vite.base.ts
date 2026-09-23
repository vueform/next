import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'
import type { BuildOptions, Rollup } from 'vite'

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export const srcDir = resolve(pkgDir, 'src')

export function isExternal(id: string): boolean {
  if (id.endsWith('.css')) return false
  if (/^@vueform\/core/.test(id)) return true
  if (/^primevue/.test(id)) return true
  return [
    'vue',
    '@vueuse/core',
    'dompurify',
    'expr-eval-fork',
    'type-fest',
    '@vue/shared',
  ].includes(id)
}

function createEntries() {
  const blueprintEntries = Object.fromEntries(
    fg.sync('src/blueprints/*.ts', { cwd: pkgDir }).map((file) => {
      const name = basename(file, '.ts')
      return [`blueprints/${name}`, resolve(pkgDir, file)]
    })
  )

  const componentBarrels = Object.fromEntries(
    fg.sync('src/components/*.ts', { cwd: pkgDir }).map((file) => {
      const name = basename(file, '.ts')
      return [`components/${name}`, resolve(pkgDir, file)]
    })
  )

  const componentEntries = Object.fromEntries(
    fg.sync('src/components/*/index.ts', { cwd: pkgDir }).map((file) => {
      const name = file.replace(/^src\//, '').replace(/\.ts$/, '')
      return [name, resolve(pkgDir, file)]
    })
  )

  const componentUnstyledEntries = Object.fromEntries(
    fg.sync('src/components/*/unstyled.ts', { cwd: pkgDir }).map((file) => {
      const name = file.replace(/^src\//, '').replace(/\.ts$/, '')
      return [name, resolve(pkgDir, file)]
    })
  )

  const componentStyledEntries = Object.fromEntries(
    fg.sync('src/components/*/styled.ts', { cwd: pkgDir }).map((file) => {
      const name = file.replace(/^src\//, '').replace(/\.ts$/, '')
      return [name, resolve(pkgDir, file)]
    })
  )

  // Entries so each styles module survives as its own dist file — consumable
  // directly via the `./components/*/styles` subpath.
  const componentStylesEntries = Object.fromEntries(
    fg.sync('src/components/*/styles.ts', { cwd: pkgDir }).map((file) => {
      const name = file.replace(/^src\//, '').replace(/\.ts$/, '')
      return [name, resolve(pkgDir, file)]
    })
  )

  return {
    index: resolve(pkgDir, 'src/index.ts'),
    full: resolve(pkgDir, 'src/full.ts'),
    'themes/index': resolve(pkgDir, 'src/themes/index.ts'),
    'themes/tokens': resolve(pkgDir, 'src/themes/tokens.ts'),
    locales: resolve(pkgDir, 'src/locales.ts'),
    rules: resolve(pkgDir, 'src/rules.ts'),
    modules: resolve(pkgDir, 'src/modules.ts'),
    ...blueprintEntries,
    ...componentEntries,
    ...componentUnstyledEntries,
    ...componentStyledEntries,
    ...componentStylesEntries,
    ...componentBarrels,
  }
}

function onwarn(
  warning: Rollup.RollupLog,
  defaultHandler: Rollup.LoggingFunction
) {
  if (
    warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
    warning.exporter === 'vue' &&
    warning.names?.includes('guardReactiveProps')
  ) {
    return
  }
  defaultHandler(warning)
}

export function createBuildOptions({
  outDir = './dist',
  paths,
}: {
  outDir?: string
  paths?: (id: string) => string
} = {}): BuildOptions {
  return {
    minify: false,
    lib: {
      formats: ['es'],
      name: '@vueform/primevue',
      fileName: (_, name) => `${name}.mjs`,
      entry: createEntries(),
    },
    outDir,
    cssCodeSplit: true,
    rollupOptions: {
      onwarn,
      external: isExternal,
      // Vite's default ('no-external') would strip the bare external
      // `@vueform/primevue/*.css` imports of the per-component styles
      // modules; keep external CSS side-effectful, everything else on the
      // default.
      treeshake: {
        moduleSideEffects: (id, isExt) => (isExt ? id.endsWith('.css') : true),
      },
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        // Keep entry chunks free of hoisted transitive side-effect imports
        // (theme CSS) — consumers' per-binding tree shaking depends on it.
        hoistTransitiveImports: false,
        entryFileNames: '[name].mjs',
        chunkFileNames: 'chunks/[hash].mjs',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash].css'
          }
          return 'assets/[name]-[hash][extname]'
        },
        ...(paths ? { paths } : {}),
      },
    },
  }
}
