import tsParser from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

/**
 * ESLint is scoped to .vue files only and covers exactly what oxlint cannot:
 *
 * - vue template rules (`flat/essential` — error-catching only, no opinions);
 * - template-aware unused detection (vue-eslint-parser marks bindings used in
 *   the template, so `no-unused-vars` works in `<script setup>`, where oxlint
 *   deliberately suppresses it).
 *
 * Everything else — .ts/.js files, script-block correctness, import hygiene,
 * restricted imports — is oxlint's job (the `lint` block of vite.config.ts).
 */
export default [
  {
    ignores: [
      '**/dist/**',
      '.vueform/**',
      '.playgrounds/**',
      'docs/.vitepress/cache/**',
      'docs/src/playground/**',
      'packages/*/registry/**',
      'scripts/playground/templates/**',
    ],
  },

  ...vue.configs['flat/essential'],

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      // Like oxlint's no-unused-vars (vite.config.ts) but template-aware:
      // vue-eslint-parser marks template-referenced bindings as used, so this
      // is safe inside <script setup>. `args: 'none'` because the core rule
      // is not TS-aware and false-positives on parameter names in function
      // TYPES (e.g. `testFn?: (value: string) => string`); oxlint covers
      // unused args in plain .ts.
      'no-unused-vars': [
        'error',
        { vars: 'all', varsIgnorePattern: '^_', args: 'none' },
      ],

      // `$`-suffixed props (`form$`, `el$`) are the framework's core naming
      // convention; the rule also false-positives on same-name shorthand
      // (`:form$`).
      'vue/valid-attribute-name': 'off',
    },
  },

  // Test fixtures: dts type-tests deliberately exercise `|` unions inside
  // template expressions (parsed as Vue 2 filters), and visual/integration
  // fixtures use single-word names (Grid, Matrix, Playground).
  {
    files: ['packages/*/tests/**/*.vue'],
    rules: {
      'vue/no-deprecated-filter': 'off',
      'vue/multi-word-component-names': 'off',
    },
  },

  // Last: disable formatting rules — oxfmt owns .vue formatting.
  eslintConfigPrettier,
]
