import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import VfBuild from '@vueform/vite/build'
import { defineConfig } from 'vite'
import Dts from 'vite-plugin-dts'
import { createBuildOptions, srcDir } from './build/vite.shared'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
  plugins: [
    Vue(),
    Dts({
      tsconfigPath: resolve(__dirname, '.tsconfig/tsconfig.build.json'),
      rollupTypes: false,
      copyDtsFiles: true,
      insertTypesEntry: true,
      clearPureImport: false,
      include: ['src'],
    }),
    VfBuild({
      // Ship the scss forwarders (@vueform/ui/*.scss) and compile them into
      // the @vueform/ui/*.css chunks …
      themeScss: {
        srcDir: 'src/scss',
        outDir: 'dist/scss',
        cssOutDir: 'dist/css',
        importMap: { '@vueform/core': '../core/src/scss' },
      },
      // … and flatten the chunks into dist/theme.css for <link>/CDN use.
      themeCss: {
        recipe: 'src/scss/theme.scss',
        recipeOut: 'dist/scss/theme.scss',
      },
    }),
  ],
  logLevel: 'warn',
  build: createBuildOptions(),
})
