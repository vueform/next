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
      '~': srcDir,
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
      exclude: ['src/playground.ts'],
      beforeWriteFile(filePath, content) {
        return {
          filePath,
          content: content.replace(
            /declare module ['"](?:\.\.\/)*(?:src\/)?index\.ts['"]/g,
            "declare module '@vueform/core'"
          ),
        }
      },
    }),
    VfBuild({
      emitDmts: true,
      shorthandProps: {
        helpersFrom: '../../types',
      },
      themeScss: {
        srcDir: 'src/scss',
        outDir: 'dist/scss',
        cssOutDir: 'dist/css',
      },
    }),
  ],
  logLevel: 'warn',
  build: createBuildOptions(),
})
