import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import Dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    Dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
      rollupTypes: false,
      insertTypesEntry: true,
      include: ['src'],
    }),
  ],
  logLevel: 'warn',
  build: {
    minify: false,
    lib: {
      formats: ['es'],
      name: '@vueform/devtools',
      fileName: (_, name) => `${name}.mjs`,
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
      },
    },
    outDir: './dist',
    rollupOptions: {
      external: ['vue', /^@vueform\/core/, /^@vue\/devtools-api/],
    },
  },
})
