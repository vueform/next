import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import VfBuild from '@vueform/vite/build'
import { defineConfig } from 'vite'
import Dts from 'vite-plugin-dts'
import { createBuildOptions, srcDir } from './build/vite.base'

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
            "'@vueform/ui'"
          ),
        }
      },
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
