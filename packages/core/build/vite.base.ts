import fs from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'
import type { BuildOptions } from 'vite'

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export const srcDir = resolve(pkgDir, 'src')

export const external = ['vue', '@vueform/core']

function createEntries() {
  const blueprintEntries = Object.fromEntries(
    fg
      .sync('src/blueprints/*.ts', { cwd: pkgDir })
      .filter((f) => !f.includes('index'))
      .map((file) => {
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

  const folderNames = [
    'composables',
    'locales',
    'modules',
    'tokens',
    'types',
    'utils',
  ]

  const folderEntries = Object.fromEntries(
    folderNames.flatMap((name) => {
      const abs = resolve(pkgDir, `src/${name}/index.ts`)
      if (!fs.existsSync(abs)) return []
      return [[`${name}/index`, abs]] as const
    })
  )

  return {
    index: resolve(pkgDir, 'src/index.ts'),
    defaultRules: resolve(pkgDir, 'src/rules/index.ts'),
    'modules/modules': resolve(pkgDir, 'src/modules/modules.ts'),
    'tokens/index': resolve(pkgDir, 'src/tokens/index.ts'),
    ...folderEntries,
    ...blueprintEntries,
    ...componentEntries,
    ...componentUnstyledEntries,
    ...componentBarrels,
  }
}

export function createBuildOptions(outDir = './dist'): BuildOptions {
  return {
    minify: false,
    lib: {
      formats: ['es'],
      name: '@vueform/core',
      fileName: (_, name) => `${name}.mjs`,
      entry: createEntries(),
    },
    outDir,
    cssCodeSplit: true,
    rollupOptions: {
      external,
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].mjs',
        chunkFileNames: 'chunks/[hash].mjs',
        assetFileNames: (assetInfo) => {
          // Let the plugin handle CSS relocation
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash].css'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  }
}
