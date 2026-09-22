import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const theme = process.env.THEME || 'origin'

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: resolve(pkgDir, 'src') },
      {
        find: '#shorthands',
        replacement: resolve(pkgDir, 'src/types/shorthands.ts'),
      },
    ],
  },
  plugins: [
    Vue({
      template: {
        compilerOptions: {
          comments: false,
        },
      },
    }),
  ],
  build: {
    minify: 'terser',
    lib: {
      formats: ['iife'],
      name: 'Vueform',
      entry: resolve(pkgDir, `src/${theme}.ts`),
      fileName: () => `${theme}.global.js`,
    },
    outDir: './dist',
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
        inlineDynamicImports: true,
        assetFileNames: `${theme}.[ext]`,
      },
    },
  },
})
