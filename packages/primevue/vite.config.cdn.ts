import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '#shorthands': resolve(__dirname, 'src/types/shorthands.ts'),
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
  ],
  build: {
    minify: 'terser',
    lib: {
      formats: ['iife'],
      name: 'Vueform',
      entry: resolve(__dirname, 'src/full.ts'),
      fileName: () => 'vueform.global.js',
    },
    outDir: './dist',
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
        inlineDynamicImports: true,
        assetFileNames: 'vueform.[ext]',
      },
    },
  },
})
