import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import VfBuild from '@vueform/vite/build'
import { defineConfig } from 'vite'
import Dts from 'vite-plugin-dts'
import { createBuildOptions, srcDir } from './build/vite.base'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  define: {
    __VUEFORM_VAPOR__: JSON.stringify(false),
  },
  resolve: {
    alias: {
      '@': srcDir,
      '#shorthands': resolve(srcDir, 'types/shorthands.ts'),
    },
  },
  plugins: [
    Vue({
      template: {
        compilerOptions: {
          comments: false,
        },
      },
    }),
    Dts({
      tsconfigPath: resolve(__dirname, '.tsconfig/tsconfig.build.json'),
      rollupTypes: false,
      copyDtsFiles: true,
      insertTypesEntry: true,
      clearPureImport: false,
      include: ['src'],
      // TS declaration emit names inferred types via the nearest in-program
      // re-exporter — this package's own src/index.ts — as a source-relative
      // `.ts` specifier (raw `vue-tsc --declaration` does it too; bare
      // `@vueform/core` and `paths` self-mappings are both ignored). src is
      // not shipped, so rewrite those references to the public entry.
      beforeWriteFile(filePath, content) {
        return {
          filePath,
          content: content.replace(
            /['"](?:\.\.\/)+src\/index\.ts['"]/g,
            "'@vueform/primevue'"
          ),
        }
      },
    }),
    VfBuild({
      shorthandProps: {
        helpersFrom: '@vueform/core',
      },
      themeScss: {
        srcDir: 'src/scss',
        outDir: 'dist/scss',
        cssOutDir: 'dist/css',
        importMap: { '@vueform/core': '../core/src/scss' },
      },
      themeCss: {
        recipe: 'src/scss/theme.scss',
        recipeOut: 'dist/scss/theme.scss',
      },
    }),
  ],
  logLevel: 'warn',
  build: createBuildOptions(),
})
