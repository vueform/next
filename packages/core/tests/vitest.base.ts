import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'

const src = resolve(__dirname, '../src')
const exprEvalSrc = resolve(__dirname, '..', '..', 'expr-eval', 'src')
const dompurifySrc = resolve(__dirname, '..', '..', 'dompurify', 'src')

export const baseTest = {
  globals: true,
  environment: 'happy-dom',
  // Absolute: project configs live in their own directories (their root), so
  // a root-relative path would resolve differently per project.
  setupFiles: [resolve(__dirname, 'vitest.setup.ts')],
}

export default {
  plugins: [vue()],
  resolve: {
    alias: [
      { find: '~', replacement: src },
      {
        find: '#shorthands',
        replacement: resolve(src, 'types/shorthands.ts'),
      },
      { find: /^vue$/, replacement: 'vue/dist/vue.esm-bundler.js' },
      {
        find: /^@vueform\/expr-eval$/,
        replacement: `${exprEvalSrc}/index.ts`,
      },
      {
        find: /^@vueform\/dompurify$/,
        replacement: `${dompurifySrc}/index.ts`,
      },
      {
        find: /^@vueform\/core\/blueprints\/(.+)$/,
        replacement: `${src}/blueprints/$1.ts`,
      },
      {
        find: /^@vueform\/core\/components\/(.+)\/raw$/,
        replacement: `${src}/components/$1/index.ts`,
      },
      {
        find: /^@vueform\/core\/components\/(.+)$/,
        replacement: `${src}/components/$1/unstyled.ts`,
      },
      {
        find: /^@vueform\/core\/components$/,
        replacement: `${src}/components/index.ts`,
      },
      {
        find: /^@vueform\/core\/modules$/,
        replacement: `${src}/modules/modules.ts`,
      },
      {
        find: /^@vueform\/core\/rules$/,
        replacement: `${src}/rules/index.ts`,
      },
      {
        find: /^@vueform\/core\/locales$/,
        replacement: `${src}/locales/index.ts`,
      },
      { find: /^@vueform\/core$/, replacement: `${src}/index.ts` },
    ],
  },
}
