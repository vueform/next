import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packages = resolve(__dirname, '../../../..')
const coreSrc = resolve(packages, 'core/src')
const uiSrc = resolve(packages, 'ui/src')
const testingSrc = resolve(packages, 'testing/src')
const exprEvalSrc = resolve(packages, 'expr-eval/src')
const devtoolsSrc = resolve(packages, 'devtools/src')

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
      { find: '@', replacement: uiSrc },
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
        find: /^@vueform\/devtools$/,
        replacement: `${devtoolsSrc}/index.ts`,
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
        find: /^@vueform\/ui\/tokens$/,
        replacement: `${uiSrc}/themes/tokens.ts`,
      },
      {
        find: /^@vueform\/ui\/themes$/,
        replacement: `${uiSrc}/themes/index.ts`,
      },
      {
        find: /^@vueform\/ui\/([\w-]+)\.s?css$/,
        replacement: `${uiSrc}/scss/$1.scss`,
      },
      {
        find: /^@vueform\/ui\/blueprints\/([^/]+)$/,
        replacement: `${uiSrc}/blueprints/$1.ts`,
      },
      {
        find: /^@vueform\/ui\/components\/([^/]+)$/,
        replacement: `${uiSrc}/components/$1/styled.ts`,
      },
      {
        find: /^@vueform\/ui\/components$/,
        replacement: `${uiSrc}/components/index.ts`,
      },
      {
        find: /^@vueform\/ui\/origin$/,
        replacement: `${uiSrc}/origin.ts`,
      },
      {
        find: /^@vueform\/ui\/material$/,
        replacement: `${uiSrc}/material.ts`,
      },
      {
        find: /^@vueform\/ui\/(?!components|themes)([^/]+)$/,
        replacement: `${uiSrc}/$1.ts`,
      },
      {
        find: /^@vueform\/ui$/,
        replacement: `${uiSrc}/index.ts`,
      },
    ],
  },
})
