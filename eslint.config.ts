import tsParser from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'
import unusedImports from 'eslint-plugin-unused-imports'
import vue from 'eslint-plugin-vue'
import vueA11y from 'eslint-plugin-vuejs-accessibility'
import { defineConfig } from 'eslint/config'
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
export default defineConfig([
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

  // A11y template rules, scoped to library component sources only — docs,
  // playgrounds and test fixtures are not part of the shipped a11y contract.
  ...vueA11y.configs['flat/recommended'].map((config) => ({
    ...config,
    files: ['packages/*/src/**/*.vue'],
  })),

  {
    files: ['packages/*/src/**/*.vue'],
    rules: {
      // The default demands nesting AND a for/id pair; `<label :for>` next to
      // the input is this library's (valid) association pattern.
      'vuejs-accessibility/label-has-for': [
        'error',
        { required: { some: ['nesting', 'id'] }, allowChildren: true },
      ],

      // Flags the drag-and-drop handlers on list/matrix containers. The
      // keyboard alternative for drag interactions is a planned separate
      // pass (WCAG 2.5.7); until then the rule only reports known debt.
      'vuejs-accessibility/no-static-element-interactions': 'off',
    },
  },

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
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // Like oxlint's no-unused-vars (vite.config.ts) but template-aware:
      // vue-eslint-parser marks template-referenced bindings as used, so this
      // is safe inside <script setup>. Split across the unused-imports plugin
      // so unused imports get an autofix (fix-on-save removes them; the TS
      // language server's removeUnusedImports is unusable in .vue files — see
      // .vscode/settings.json). `args: 'none'` because the core rule is not
      // TS-aware and false-positives on parameter names in function TYPES
      // (e.g. `testFn?: (value: string) => string`); oxlint covers unused
      // args in plain .ts.
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', varsIgnorePattern: '^_', args: 'none' },
      ],

      // `$`-suffixed props (`form$`, `el$`) are the framework's core naming
      // convention; the rule also false-positives on same-name shorthand
      // (`:form$`).
      'vue/valid-attribute-name': 'off',

      // Props on components must be written kebab-case in templates
      // (`:initial-value`, never `:initialValue`).
      'vue/attribute-hyphenation': ['error', 'always'],
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
])
