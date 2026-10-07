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
 * Workspace package manifests, for the typecheck task graph: which packages
 * have a `typecheck` script, and which workspace packages each one depends on
 * (transitively), so a leg's cache only watches the sources it can actually
 * resolve.
 */
const packageManifests = new Map(
  readdirSync(join(repoDir, 'packages')).flatMap((dir) => {
    const manifest = join(repoDir, 'packages', dir, 'package.json')
    if (!existsSync(manifest)) return []
    return [[dir, JSON.parse(readFileSync(manifest, 'utf8'))] as const]
  })
)
const packageDirByName = new Map(
  [...packageManifests].map(([dir, pkg]) => [pkg.name as string, dir])
)

/** Transitive workspace dependencies of a package, as package dir names. */
const workspaceDeps = (dir: string): string[] => {
  const seen = new Set<string>()
  const visit = (current: string) => {
    const pkg = packageManifests.get(current)
    const declared = {
      ...pkg?.dependencies,
      ...pkg?.peerDependencies,
      ...pkg?.devDependencies,
    }
    for (const name of Object.keys(declared)) {
      const depDir = packageDirByName.get(name)
      if (depDir && !seen.has(depDir)) {
        seen.add(depDir)
        visit(depDir)
      }
    }
  }
  visit(dir)
  seen.delete(dir)
  return [...seen]
}

/**
 * Packages with a `typecheck` script (vue-tsc / tsc --noEmit). Each becomes a
 * cached `:typecheck:<dir>` task; the `:typecheck` aggregate adds the root
 * tooling pass (root tsconfig.json) on top. Type checking is vue-tsc/tsc only
 * — oxlint's type-aware path (tsgolint) cannot check .vue SFCs.
 */
const checkedPackages = [...packageManifests].flatMap(([dir, pkg]) =>
  pkg.scripts?.typecheck ? [{ dir, name: pkg.name as string }] : []
)

/**
 * Core, the adapters and the plugins check in the src world (the
 * `vueform-source` exports condition, enabled by the @vueform/tsconfig
 * presets), so their legs resolve workspace deps to SOURCE; the node
 * packages resolve deps through the workspace links to their BUILT dists.
 * The cache inputs mirror that split — narrowed to the leg's transitive
 * workspace deps, and dep manifests are inputs because the exports maps ARE
 * the resolution map.
 */
const typecheckTasks = Object.fromEntries(
  checkedPackages.map(({ dir, name }) => {
    const srcLinked = aliasedSrcPackages.includes(dir)
    return [
      `:typecheck:${dir}`,
      {
        command: `pnpm --filter ${name} run typecheck`,
        cache: {
          input: [
            `packages/${dir}/src/**`,
            `packages/${dir}/tests/**`,
            `packages/${dir}/*.ts`,
            `packages/${dir}/*.json`,
            ...workspaceDeps(dir).flatMap((dep) => [
              srcLinked ? `packages/${dep}/src/**` : `packages/${dep}/dist/**`,
              `packages/${dep}/package.json`,
            ]),
            'packages/global.d.ts',
            'packages/tsconfig/**',
            'pnpm-lock.yaml',
          ],
          output: [],
        },
      },
    ]
  })
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
      {
        // Tests speak the PUBLIC dialect: `@vueform/<pkg>` goes through the
        // exports maps (the consumer gatekeeper), so tests exercise the
        // published surface; the `#` aliases bypass it via the preset's
        // catch-all paths. A genuine internal import is spelled as a
        // relative `../src/...` path — visibly white-box.
        files: ['packages/*/tests/**'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: ['#*', '#*/**'],
                  message:
                    'Tests must not use # aliases. Import the public surface via @vueform/<pkg> (exports-map enforced), or internals via a relative ../src path.',
                },
              ],
            },
          ],
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
            '!docs/src/playground/**',
            'packages/*/dist/**',
            'pnpm-lock.yaml',
          ],
          output: [],
        },
      },
      ':typecheck:benchmark': {
        command: 'pnpm --filter @vueform/benchmark run typecheck',
        cache: {
          input: [
            'benchmark/scripts/**',
            'benchmark/*.json',
            'benchmark/app/src/**',
            'benchmark/app/*.json',
            'benchmark/app/*.ts',
            'benchmark/app/pnpm-lock.yaml',
            // The app typecheck SKIPS (exit 0) while the standalone app is
            // uninstalled — this file flips on (re)install, so the cached
            // skip does not outlive it.
            'benchmark/app/node_modules/.modules.yaml',
            'packages/tsconfig/**',
            'pnpm-lock.yaml',
          ],
          output: [],
        },
      },
      ':typecheck': {
        // The root program (root tsconfig.json): root scripts and configs
        // only — every other folder owns its tsconfig.
        command: 'tsc --noEmit',
        dependsOn: [
          ...checkedPackages.map(({ dir }) => `:typecheck:${dir}`),
          ':typecheck:docs',
          ':typecheck:benchmark',
        ],
        cache: {
          input: [
            '*.config.ts',
            'scripts/**',
            '!scripts/playground/templates/**',
            'tsconfig.json',
            'packages/tsconfig/**',
            'pnpm-lock.yaml',
            // scripts/ imports @vueform/utils, which resolves to BUILT types.
            'packages/utils/dist/**',
          ],
          output: [],
        },
      },
      // The dist-type gate (NOT part of the default checks): packs every
      // publishable package and verifies the tarballs statically (publint +
      // attw, run by the pack step itself).
      ':pack': {
        command: 'pnpm --filter @vueform/ui run test:smoke --pack-only',
        cache: {
          input: [
            'packages/*/dist/**',
            'packages/*/package.json',
            'packages/*/bin/**',
            'pnpm-lock.yaml',
          ],
          output: ['.vueform/smoke/tarballs/**'],
        },
      },
      // Tiers 0–1 are browserless (install → leak check → build → typecheck
      // in every env cell), so unlike the full smoke suites this is safe for
      // agents/CI. Installs from the network — never cached.
      ':release:verify': {
        command:
          'pnpm --filter @vueform/ui run test:smoke --skip-pack --tiers=0,1 && pnpm --filter @vueform/primevue run test:smoke --skip-pack --tiers=0,1',
        dependsOn: [':pack'],
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
