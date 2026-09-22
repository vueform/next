import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const src = resolve(__dirname, '..', 'src')

const exprEvalSrc = resolve(__dirname, '..', '..', 'expr-eval', 'src')
const dompurifySrc = resolve(__dirname, '..', '..', 'dompurify', 'src')
const coreSrc = resolve(__dirname, '..', '..', 'core', 'src')

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: 'vue', replacement: 'vue/dist/vue.esm-bundler.js' },
      { find: '@', replacement: src },
      { find: '#shorthands', replacement: resolve(src, 'types/shorthands.ts') },
      { find: '~', replacement: coreSrc },
      {
        find: /^@vueform\/expr-eval$/,
        replacement: `${exprEvalSrc}/index.ts`,
      },
      {
        find: /^@vueform\/dompurify$/,
        replacement: `${dompurifySrc}/index.ts`,
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
        find: '@vueform/core/tokens',
        replacement: `${coreSrc}/tokens/index.ts`,
      },
      {
        find: '@vueform/core',
        replacement: `${coreSrc}/index.ts`,
      },
    ],
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['./tests/integration/**/*.test.ts'],
  },
})
