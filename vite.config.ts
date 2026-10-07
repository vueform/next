/**
 * Vite+ (`vp`) workspace configuration — currently only the `vp run` task graph
 * (migration stage 1). Build/test/lint stay on their existing tools and the
 * `tsx scripts/*` orchestrators; this file adds dependency-aware scheduling and
 * local caching on top, plus the one-command `pipeline` task:
 *
 * vp run pipeline # the full pipeline, cached where safe vp run p:build # all
 * package builds, dependency-ordered vp run build:core # one package build
 * (with its dependencies)
 *
 * Stage tasks are `p:`-prefixed because vp forbids task names that collide with
 * root package.json scripts — which stay the authoritative entry points until
 * the orchestrators retire (migration stage 9).
 *
 * Caching rules:
 *
 * - Cached tasks declare explicit `input`/`output` globs (relative to the
 *   workspace root, these tasks' package). vp's automatic tracking cannot be
 *   used here: the builds read files they just wrote (d.ts post-processing),
 *   and the orchestrators read+write their times.json, both of which make
 *   auto-tracking refuse to cache.
 * - A package build's input includes its upstream workspace dists (an adapter
 *   build type-checks against core's BUILT types) — a stale upstream dist must
 *   invalidate the downstream task.
 * - `pnpm-lock.yaml` is an input of every cached task: any dependency bump
 *   invalidates everything (coarse, but always correct).
 * - Mutating (`p:fix`) and measuring (`p:test:bench*`) tasks never cache;
 *   Playwright suites (`p:test:smoke`, `p:test:visual`, `p:bench`) never cache
 *   and are never run by agents — user-run only.
 * - Docs tasks stay uncached until their read/write sets are modeled.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite-plus'
import type { OxlintConfig } from 'vite-plus/lint'

const repoDir = fileURLToPath(new URL('.', import.meta.url))

/**
 * Package dirs whose sources use the `#<dir>/*` alias: core plus every package
 * whose package.json declares a `vueform.group` of adapters or plugins.
 * Resolved when the config loads, so new packages join automatically.
 */
const aliasedSrcPackages = [
  'core',
  ...readdirSync(join(repoDir, 'packages')).filter((dir) => {
    const manifest = join(repoDir, 'packages', dir, 'package.json')
    if (!existsSync(manifest)) return false
    const group = JSON.parse(readFileSync(manifest, 'utf8')).vueform?.group
    return group === 'adapters' || group === 'plugins'
  }),
]

/**
 * Packages with a `typecheck` script (vue-tsc / tsc --noEmit). Each becomes a
 * cached `:typecheck:<dir>` task; the `:typecheck` aggregate adds the root
 * tsconfig.node.json pass on top. Type checking is vue-tsc/tsc only — oxlint's
 * type-aware path (tsgolint) cannot do it here, see the `lint` block note.
 */
const checkedPackages = readdirSync(join(repoDir, 'packages')).flatMap(
  (dir) => {
    const manifest = join(repoDir, 'packages', dir, 'package.json')
    if (!existsSync(manifest)) return []
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
    return pkg.scripts?.typecheck ? [{ dir, name: pkg.name as string }] : []
  }
)

/**
 * A package's typecheck resolves other packages through the root tsconfig's
 * `#<dir>` and `@vueform` SOURCE aliases, so every leg's cache depends on the
 * src of every package — over-invalidation is safe, a stale pass is not.
 */
const typecheckTasks = Object.fromEntries(
  checkedPackages.map(({ dir, name }) => [
    `:typecheck:${dir}`,
    {
      command: `pnpm --filter ${name} run typecheck`,
      cache: {
        input: [
          `packages/${dir}/src/**`,
          `packages/${dir}/tests/**`,
          `packages/${dir}/*.ts`,
          `packages/${dir}/*.json`,
          'packages/*/src/**',
          'packages/global.d.ts',
          'tsconfig.json',
          'pnpm-lock.yaml',
        ],
        output: [],
      },
    },
  ])
)

export default defineConfig({
  fmt: {
    semi: false,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
    printWidth: 80,
    jsdocPrintWidth: 80,
    jsdocDescriptionWithDot: false,
    jsdocCapitalizeDescription: false,
    jsdocCommentLineStrategy: 'multiline',
    sortPackageJson: {},
    sortImports: {},
    ignorePatterns: [
      '**/dist/**',
      '.vueform/**',
      '.playgrounds/**',
      '*.md',
      'docs/src/playground/*.js',
    ],
  },
  lint: {
    categories: {
      correctness: 'error',
    },
    plugins: ['typescript', 'import'],
    ignorePatterns: [
      '**/dist/**',
      '.vueform/**',
      '.playgrounds/**',
      'docs/.vitepress/cache/**',
      'docs/src/playground/*.js',
    ],
    rules: {
      'no-control-regex': 'off',
      'no-irregular-whitespace': 'off',
      'import/no-duplicates': ['error', { preferInline: true }],
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
    overrides: [
      ...aliasedSrcPackages.map(
        (dir): NonNullable<OxlintConfig['overrides']>[number] => ({
          files: [`packages/${dir}/src/**`],
          rules: {
            'no-restricted-imports': [
              'error',
              {
                patterns: [
                  {
                    group: ['../**'],
                    message: `Do not use parent relative imports (../*). Use #${dir}/* instead.`,
                  },
                ],
              },
            ],
            'no-console': ['error', { allow: ['warn', 'error'] }],
          },
        })
      ),
      {
        files: ['packages/core/src/**'],
        excludeFiles: ['packages/core/src/index.ts'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              paths: [
                '#core/modules',
                '#core/modules/index',
                './modules',
                './modules/index',
              ].map((name) => ({
                name,
                message: `Do not import from '${name}'. Import from a specific module (e.g. '#core/modules/validation') instead. The barrel is only allowed in modules.ts and index.ts.`,
              })),
              patterns: [
                {
                  group: ['../**'],
                  message:
                    'Do not use parent relative imports (../…). Use #core/… instead.',
                },
              ],
            },
          ],
        },
      },
      {
        files: ['**/*.d.ts', 'packages/*/tests/**'],
        rules: {
          'no-unused-vars': 'off',
          'no-unused-expressions': 'off',
        },
      },
    ],
  },
  run: {
    tasks: {
      ':lint': {
        command: 'vp lint',
        dependsOn: [':stylelint', ':eslint'],
      },
      ...typecheckTasks,
      ':typecheck:docs': {
        command: 'pnpm --filter @vueform/docs run typecheck',
        cache: {
          input: [
            'docs/.vitepress/**',
            'docs/scripts/**',
            'docs/src/**',
            'docs/*.json',
            'docs/*.ts',
            '!docs/.vitepress/cache/**',
            '!docs/.vitepress/dist/**',
            '!docs/.vitepress/.generated/**',
            '!docs/src/playground/**',
            'packages/*/dist/**',
            'pnpm-lock.yaml',
          ],
          output: [],
        },
      },
      ':typecheck': {
        command: 'tsc --noEmit -p tsconfig.node.json',
        dependsOn: [
          ...checkedPackages.map(({ dir }) => `:typecheck:${dir}`),
          ':typecheck:docs',
        ],
        cache: {
          input: [
            '*.config.ts',
            'scripts/**',
            'packages/*/tests/bench-dts/generate.ts',
            'tsconfig.node.json',
            'pnpm-lock.yaml',
            // scripts/ imports @vueform/utils, which resolves to BUILT types.
            'packages/utils/dist/**',
          ],
          output: [],
        },
      },
      ':eslint': {
        command: 'eslint "**/*.vue"',
        cache: {
          input: [
            '**/*.vue',
            '!**/dist/**',
            'eslint.config.mjs',
            'pnpm-lock.yaml',
          ],
          output: [],
        },
      },
      ':stylelint': {
        command: 'stylelint "**/*.{scss,css}"',
        cache: {
          input: [
            '**/*.scss',
            '**/*.css',
            '!**/dist/**',
            'stylelint.config.mjs',
            'pnpm-lock.yaml',
          ],
          output: [],
        },
      },
    },
  },
})
