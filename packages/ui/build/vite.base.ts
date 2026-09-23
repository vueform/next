import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'
import type { BuildOptions } from 'vite'

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export const srcDir = resolve(pkgDir, 'src')

export const external = [
  'vue',
  '@vueuse/core',
  'dompurify',
  'expr-eval-fork',
  'type-fest',
  /^@vueform\/core/,
  '@vue/shared',
]

function createEntries() {
  // Raw token maps (no augmentation) plus the type augment the createVueform
  // entries pull in.
  const themeEntries = Object.fromEntries(
    fg.sync('src/themes/*.ts', { cwd: pkgDir }).map((file) => {
      const name = basename(file, '.ts')
      return [`themes/${name}`, resolve(pkgDir, file)]
    })
  )

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

  const componentStyledEntries = Object.fromEntries(
    fg.sync('src/components/*/styled.ts', { cwd: pkgDir }).map((file) => {
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

  // Entries so each styles module survives as its own dist file (instead of
  // its chunk imports being hoisted into styled.mjs) — consumable directly
  // via the `./components/*/styles` subpath.
  const componentStylesEntries = Object.fromEntries(
    fg.sync('src/components/*/styles.ts', { cwd: pkgDir }).map((file) => {
      const name = file.replace(/^src\//, '').replace(/\.ts$/, '')
      return [name, resolve(pkgDir, file)]
    })
  )

  return {
    index: resolve(pkgDir, 'src/index.ts'),
    origin: resolve(pkgDir, 'src/origin.ts'),
    material: resolve(pkgDir, 'src/material.ts'),
    rules: resolve(pkgDir, 'src/rules.ts'),
    modules: resolve(pkgDir, 'src/modules.ts'),
    locales: resolve(pkgDir, 'src/locales.ts'),
    ...themeEntries,
    ...blueprintEntries,
    ...componentEntries,
    ...componentStyledEntries,
    ...componentUnstyledEntries,
    ...componentStylesEntries,
    ...componentBarrels,
  }
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
      name: '@vueform/ui',
      fileName: (_, name) => `${name}.mjs`,
      entry: createEntries(),
    },
    outDir,
    cssCodeSplit: true,
    rollupOptions: {
      external,
      // Vite's default ('no-external') would strip the bare external
      // `@vueform/ui/*.css` imports of the per-component styles modules; keep
      // external CSS side-effectful, everything else on the default.
      treeshake: {
        moduleSideEffects: (id, isExternal) =>
          isExternal ? id.endsWith('.css') : true,
      },
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        // Keep entry chunks free of hoisted transitive side-effect imports
        // (theme CSS) — those must stay attached to the component modules so
        // consumers' per-binding tree shaking drops unused components' CSS.
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
