import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginImport from 'eslint-plugin-import'
import perfectionist from 'eslint-plugin-perfectionist'
import prettier from 'eslint-plugin-prettier'
import unusedImports from 'eslint-plugin-unused-imports'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

const noParentRelativeImports = {
  group: ['../**'],
  message: 'Do not use parent relative imports (../…). Use @/… instead.',
}

const noModulesBarrelImports = [
  {
    name: '~/modules',
    message:
      "Do not import from '~/modules'. Import from a specific module (e.g. '~/modules/validation') instead. The barrel is only allowed in defaultModules.ts and index.ts.",
  },
  {
    name: '~/modules/index',
    message:
      "Do not import from '~/modules'. Import from a specific module (e.g. '~/modules/validation') instead. The barrel is only allowed in defaultModules.ts and index.ts.",
  },
  {
    name: './modules',
    message:
      "Do not import from './modules'. Import from a specific module (e.g. '~/modules/validation') instead. The barrel is only allowed in defaultModules.ts and index.ts.",
  },
  {
    name: './modules/index',
    message:
      "Do not import from './modules'. Import from a specific module (e.g. '~/modules/validation') instead. The barrel is only allowed in defaultModules.ts and index.ts.",
  },
]

export default [
  // ignore build output etc
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      // Generated component registries (gen:registry) — committed for GitHub
      // reference, but generated code isn't linted.
      'packages/*/registry/**',
      '**/playground/**',
      '**/docs/.vitepress/cache/**',
      '**/docs/.vitepress/dist/**',
      '**/docs/.vitepress/.temp/**',
      '**/docs/_generated/**',
      '**/docs/_generator/**',
      '**/docs/src/playground/**',
      '**/wizard/templates/**',
      '**/.playgrounds/**',
      '**/.ignored/**',
      'packages/metrics/size/fixtures/*/src/main.ts', // generated per-scenario entry
      'packages/core/tests/types-perf/**/*.md',
      'packages/core/tests/perf/.results/**',
    ],
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
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      'no-restricted-imports': 'off',

      'import/no-duplicates': ['error', { 'prefer-inline': true }],
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/order': [
        'error',
        {
          // do NOT allow blank lines between imports
          // 'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },

          // keep a predictable order (optional but recommended)
          groups: [
            'builtin', // fs, path
            'external', // vue, lodash
            'internal', // @/...
            'parent', // ../
            'sibling', // ./
            'index', // .
            'object',
            'type',
          ],

          // treat @/ as internal
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '~/**',
              group: 'internal',
              position: 'before',
            },
          ],
        },
      ],

      'prettier/prettier': 'error',
    },
  },

  // File layout: private types, public types, private runtime
  // (const/let → class → function), public runtime (export const → class →
  // function). `const` / `export const` / `let` are not sorted (they partition
  // the file); keep private consts after types and before private classes.
  {
    files: ['**/src/**/*.{js,ts}'],
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-modules': [
        'error',
        {
          type: 'unsorted',
          useExperimentalDependencyDetection: false,
          newlinesBetween: 'ignore',
          newlinesBetweenOverloadSignatures: 'ignore',
          groups: [
            ['interface', 'type', 'enum'],
            ['export-interface', 'export-type', 'export-enum'],
            'class',
            'function',
            'export-class',
            'export-function',
          ],
        },
      ],
    },
  },

  {
    files: ['**/*.{js,cjs,ts,vue}'],
    ignores: [
      '**/tests/**',
      'docs/**',
      'packages/metrics/**',
      'packages/scraper/**',
      '**/scripts/**',
    ],
    plugins: {
      '@typescript-eslint': tseslint,
      'unused-imports': unusedImports,
      prettier,
      import: pluginImport,
    },
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [noParentRelativeImports],
        },
      ],

      'prettier/prettier': 'error',
    },
  },

  // Core: do not import the modules barrel except from defaultModules.ts
  // (`~/modules`) and index.ts (`./modules`). Subpath imports (e.g.
  // ~/modules/validation) remain allowed.
  // This block re-declares the parent-relative restriction because flat config
  // replaces the previous @typescript-eslint/no-restricted-imports options.
  // Tests are excluded so they can use relative paths (e.g. ../helpers).
  {
    files: ['packages/core/**/*.{js,cjs,ts,vue}'],
    ignores: [
      'packages/core/src/defaultModules.ts',
      'packages/core/src/index.ts',
      'packages/core/tests/**',
    ],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: noModulesBarrelImports,
          patterns: [noParentRelativeImports],
        },
      ],
    },
  },

  // Core tests: ban the ~/ alias entirely, but allow any relative imports.
  {
    files: ['packages/core/tests/**/*.{js,cjs,ts,vue}'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^~/',
              message:
                "Do not use '~/…' imports in core tests. Use '@vueform/core' or a relative path instead.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ['**/src/**/*.{js,ts,vue}'],
    ignores: [
      '**/src/plugins/**',
      '**/src/services/**',
      '**/src/components/**',
      '**/src/theme/**',
      '**/src/tokens/**',
      '**/packages/vite/src/**',
      '**/nuxt/src/**',
      'packages/metrics/**',
    ],
    plugins: {
      import: pluginImport,
    },
    rules: {
      'import/no-default-export': 'error',
    },
  },

  // CLI scripts — allow console.log
  {
    files: [
      'docs/scripts/**/*.ts',
      '**/scripts/**/*.ts',
      'packages/scraper/**/*.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  },

  // Type definition files may have unused generic parameters by design
  {
    files: ['**/*.d.ts'],
    rules: {
      'unused-imports/no-unused-vars': 'off',
    },
  },

  // Disable ESLint formatting rules that would fight Prettier
  eslintConfigPrettier,
]
