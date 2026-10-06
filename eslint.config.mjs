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
    // Mirrors the oxlint ignorePatterns (vite.config.ts `lint` block), plus
    // the generated user-project simulations that carry their own configs.
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.playgrounds/**',
      'docs/.vitepress/.generated/**',
      'docs/.vitepress/cache/**',
      'docs/.vitepress/dist/**',
      'packages/*/registry/**',
      'docs/src/playground/**',
      'scripts/playground/templates/**',
    ],
  },

  ...vue.configs['flat/essential'],

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser, // script blocks
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

      // VfContent & co. render user-provided HTML by design.
      'vue/no-v-text-v-html-on-component': 'off',

      // TODO(review): 10 pre-existing violations in core src components
      // (VfForm, VfGrid, VfLanguages, VfMatrix ×2, VfSteps, VfTabs, VfForm ×2,
      // VfGrid) — keyless v-for means patch-in-place reuse. Decide per case
      // (add :key vs intentional positional reuse), then re-enable.
      'vue/require-v-for-key': 'off',
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
