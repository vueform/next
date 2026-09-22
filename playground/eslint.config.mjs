import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginImport from 'eslint-plugin-import'
import prettier from 'eslint-plugin-prettier'
import unusedImports from 'eslint-plugin-unused-imports'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  // ignore build output etc
  {
    ignores: ['**/node_modules/**', '**/dist/**'],
  },

  // JS/TS
  {
    files: ['**/*.{js,ts,cjs}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },

  // Vue SFCs
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
    plugins: {
      vue,
    },
    rules: {
      ...vue.configs['flat/recommended'].rules,
    },
  },

  {
    files: ['**/*.{js,cjs,ts,vue}'],
    plugins: {
      '@typescript-eslint': tseslint,
      'unused-imports': unusedImports,
      prettier,
      import: pluginImport,
    },
    rules: {
      'no-debugger': 'warn',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'unused-imports/no-unused-imports': 'error',
      'prettier/prettier': 'error',
    },
  },

  // Disable ESLint formatting rules that would fight Prettier
  eslintConfigPrettier,
]
