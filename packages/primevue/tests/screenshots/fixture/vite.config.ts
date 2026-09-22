import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packages = resolve(__dirname, '../../../..')
const coreSrc = resolve(packages, 'core/src')
const primevueSrc = resolve(packages, 'primevue/src')
const testingSrc = resolve(packages, 'testing/src')
const exprEvalSrc = resolve(packages, 'expr-eval/src')

export default defineConfig({
  root: __dirname,
  // Keep the Vite cache inside the fixture so screenshot runs can wipe it
  // without touching the package-level optimizer cache.
  cacheDir: resolve(__dirname, 'node_modules/.vite'),
  plugins: [vue()],
  server: {
    fs: {
      allow: [resolve(packages, '..')],
    },
  },
  resolve: {
    alias: [
      { find: 'vue', replacement: 'vue/dist/vue.esm-bundler.js' },
      { find: '@', replacement: primevueSrc },
      { find: '~', replacement: coreSrc },
      {
        find: /^@vueform\/testing$/,
        replacement: `${testingSrc}/index.ts`,
      },
      {
        find: /^@vueform\/expr-eval$/,
        replacement: `${exprEvalSrc}/index.ts`,
      },
      {
        find: /^@vueform\/core\/components\/([^/]+)\/raw$/,
        replacement: `${coreSrc}/components/$1/index.ts`,
      },
      {
        find: /^@vueform\/core\/components\/([^/]+)$/,
        replacement: `${coreSrc}/components/$1/unstyled.ts`,
      },
      {
        find: /^@vueform\/core\/blueprints\/(.+)$/,
        replacement: `${coreSrc}/blueprints/$1`,
      },
      {
        find: /^@vueform\/core\/([\w-]+)\.s?css$/,
        replacement: `${coreSrc}/scss/$1.scss`,
      },
      {
        find: '@vueform/core/rules',
        replacement: `${coreSrc}/rules/index.ts`,
      },
      {
        find: '@vueform/core/modules',
        replacement: `${coreSrc}/modules/modules.ts`,
      },
      {
        find: '@vueform/core/locales',
        replacement: `${coreSrc}/locales/index.ts`,
      },
      {
        find: /^@vueform\/core$/,
        replacement: `${coreSrc}/index.ts`,
      },
      {
        find: /^@vueform\/primevue\/tokens$/,
        replacement: `${primevueSrc}/themes/tokens.ts`,
      },
      {
        find: /^@vueform\/primevue\/themes$/,
        replacement: `${primevueSrc}/themes/index.ts`,
      },
      {
        find: /^@vueform\/primevue\/([\w-]+)\.s?css$/,
        replacement: `${primevueSrc}/scss/$1.scss`,
      },
      {
        find: /^@vueform\/primevue\/full$/,
        replacement: `${primevueSrc}/full.ts`,
      },
      {
        find: /^@vueform\/primevue\/components\/([^/]+)\/raw$/,
        replacement: `${primevueSrc}/components/$1/index.ts`,
      },
      {
        find: /^@vueform\/primevue\/components\/([^/]+)\/unstyled$/,
        replacement: `${primevueSrc}/components/$1/unstyled.ts`,
      },
      {
        find: /^@vueform\/primevue\/components\/([^/]+)\/styles$/,
        replacement: `${primevueSrc}/components/$1/styles.ts`,
      },
      {
        find: /^@vueform\/primevue\/components\/([^/]+)$/,
        replacement: `${primevueSrc}/components/$1/styled.ts`,
      },
      {
        find: /^@vueform\/primevue\/components$/,
        replacement: `${primevueSrc}/components/index.ts`,
      },
      {
        find: /^@vueform\/primevue\/blueprints\/([^/]+)$/,
        replacement: `${primevueSrc}/blueprints/$1.ts`,
      },
      {
        find: /^@vueform\/primevue\/(?!components|plugin|full)([^/]+)$/,
        replacement: `${primevueSrc}/$1.ts`,
      },
      {
        find: /^@vueform\/primevue$/,
        replacement: `${primevueSrc}/index.ts`,
      },
    ],
  },
})
