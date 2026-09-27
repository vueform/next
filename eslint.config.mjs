import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginImport from 'eslint-plugin-import'
import perfectionist from 'eslint-plugin-perfectionist'
import unusedImports from 'eslint-plugin-unused-imports'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

const noParentRelativeImports = {
  group: ['../**'],
  message: 'Do not use parent relative imports (../…). Use @/… instead.',
}

// The modules barrel is only allowed in defaultModules.ts (`~/modules`) and
// index.ts (`./modules`); everything else imports a specific module.
const noModulesBarrelImports = ['~/modules', './modules'].flatMap((name) =>
  [name, `${name}/index`].map((n) => ({
    name: n,
    message: `Do not import from '${name}'. Import from a specific module (e.g. '~/modules/validation') instead. The barrel is only allowed in defaultModules.ts and index.ts.`,
  }))
)

export default [
  // ── Ignores ───────────────────────────────────────────────────────────
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '.temp',
      // Generated component registries (gen:registry) — committed for GitHub
      // reference, but generated code isn't linted.
      'packages/*/registry/**',
      // Playground templates and instances simulate user projects and carry
      // their own eslint configs; the playground's own scripts and vite
      // plugin are linted by this config.
      'scripts/playground/templates/**',
      '**/.playgrounds/**',
      'docs/src/playground/**',
      // VitePress build artifacts.
      'docs/.vitepress/cache/**',
      'docs/.vitepress/dist/**',
      'docs/.vitepress/.temp/**',
      // Generated per-scenario entries (metrics size fixtures).
      'packages/metrics/size/fixtures/*/src/main.ts',
      // Perf run outputs.
      'packages/core/tests/perf/runtime/.results/**',
      'packages/core/tests/perf/types/.results/**',
    ],
  },

  // ── Parsers ───────────────────────────────────────────────────────────
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

  // ── Base rules (everything) ───────────────────────────────────────────
  {
    files: ['**/*.{js,cjs,ts,vue}'],
    plugins: {
      '@typescript-eslint': tseslint,
      'unused-imports': unusedImports,
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

      // The base rule is off in favor of the type-aware
      // @typescript-eslint/no-restricted-imports blocks below.
      'no-restricted-imports': 'off',

      'import/no-duplicates': ['error', { 'prefer-inline': true }],
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          // @/ and ~/ are internal aliases.
          pathGroups: [
            { pattern: '@/**', group: 'internal', position: 'before' },
            { pattern: '~/**', group: 'internal', position: 'before' },
          ],
        },
      ],
    },
  },

  // ── File layout (src only) ────────────────────────────────────────────
  // Private types, public types, private runtime (const/let → class →
  // function), public runtime (export const → class → function). `const` /
  // `export const` / `let` are not sorted (they partition the file); keep
  // private consts after types and before private classes.
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

  // ── Import restrictions ───────────────────────────────────────────────
  // Package sources: no parent-relative imports (tests, docs, scripts and
  // the tooling packages are exempt — they legitimately use relative paths).
  {
    files: ['**/*.{js,cjs,ts,vue}'],
    ignores: [
      '**/tests/**',
      '**/benchmarks/**',
      'docs/**',
      'packages/metrics/**',
      'packages/scraper/**',
      // The CLI and utils publish as plain NodeNext packages — relative
      // imports are their module system, there are no aliases to prefer.
      'packages/cli/**',
      'packages/utils/**',
      '**/scripts/**',
    ],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [noParentRelativeImports],
        },
      ],
    },
  },

  // Core additionally bans the modules barrel (except in defaultModules.ts
  // and index.ts). Re-declares the parent-relative restriction because flat
  // config replaces — not merges — rule options.
  {
    files: ['packages/core/**/*.{js,cjs,ts,vue}'],
    ignores: [
      'packages/core/src/defaultModules.ts',
      'packages/core/src/index.ts',
      'packages/core/tests/**',
      'packages/core/benchmarks/**',
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
    files: [
      'packages/core/tests/**/*.{js,cjs,ts,vue}',
      'packages/core/benchmarks/**/*.{js,cjs,ts,vue}',
    ],
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

  // ── Named exports only (src) ──────────────────────────────────────────
  // Exempt: areas whose files are consumed as default exports by convention
  // (plugins, services, SFC-heavy component dirs, theme/tokens, vite/nuxt).
  {
    files: ['**/src/**/*.{js,ts,vue}'],
    ignores: [
      '**/src/plugins/**',
      '**/src/services/**',
      '**/src/components/**',
      '**/src/theme/**',
      '**/src/tokens/**',
      '**/packages/utils/src/**',
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

  // ── Per-area relaxations ──────────────────────────────────────────────
  // CLI scripts and the published CLI are console apps, as are the modules
  // behind utils' vf-size / vf-validate-source bins — their terminal output
  // is the product.
  {
    files: [
      'docs/scripts/**/*.ts',
      '**/scripts/**/*.{ts,mjs}',
      'packages/scraper/**/*.ts',
      'packages/cli/**/*.ts',
      'packages/utils/**/*.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  },

  // Type definition files may have unused generic parameters by design, and
  // the type-test fixtures assert via deliberately "unused" type-level
  // constructs — the rule's premise doesn't hold in either.
  {
    files: ['**/*.d.ts', 'packages/core/tests/types/**'],
    rules: {
      'unused-imports/no-unused-vars': 'off',
    },
  },

  // vue-eslint-parser concatenates every <script> block into one module, so
  // these rules false-positive on the dual-script component pattern (script
  // setup + a plain script holding registry / GlobalComponents augmentations,
  // as in the clone templates and the VfTest fixture) — and their autofix
  // merges the blocks, corrupting the component.
  {
    files: ['packages/*/tests/**/*.vue'],
    rules: {
      'import/first': 'off',
      'import/no-duplicates': 'off',
    },
  },

  // ── Prettier last: disable formatting rules ───────────────────────────
  eslintConfigPrettier,
]
