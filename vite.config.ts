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
 * - Mutating tasks (`p:fix`) never cache; Playwright suites (`p:test:smoke`,
 *   `p:test:visual`) never cache and are never run by agents — user-run only.
 * - Docs tasks stay uncached until their read/write sets are modeled.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite-plus'

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
/**
 * Build graph: every package with a `build` script, ordered by its declared
 * workspace deps (transitively, via `workspaceDeps`) — adapters, plugins and
 * nuxt autodiscover their place after core, everything after utils. A
 * package build's inputs include its upstream dists (adapter/plugin d.ts
 * emission type-checks against core's BUILT types), so a stale upstream
 * invalidates the downstream task.
 */
const buildablePackages = [...packageManifests]
  .filter(([, pkg]) => pkg.scripts?.build)
  .map(([dir, pkg]) => ({ dir, name: pkg.name as string }))
const buildableDirs = new Set(buildablePackages.map(({ dir }) => dir))

const docsManifest = JSON.parse(
  readFileSync(join(repoDir, 'docs', 'package.json'), 'utf8')
)
/** Docs type-check as a consumer; these builds must precede its leg. */
const docsBuildDeps = Object.keys(docsManifest.dependencies ?? {})
  .map((name) => packageDirByName.get(name))
  .filter((dir): dir is string => !!dir && buildableDirs.has(dir))

const typecheckTasks = Object.fromEntries(
  checkedPackages.map(({ dir, name }) => {
    const srcLinked = aliasedSrcPackages.includes(dir)
    return [
      `:typecheck:${dir}`,
      {
        command: `pnpm --filter ${name} run typecheck`,
        // Dist-view legs run AFTER the builds they consume; src-linked legs
        // only need utils' dist (their config-file sub-program imports the
        // tsdown factories).
        dependsOn: srcLinked
          ? [':build:utils']
          : workspaceDeps(dir)
              .filter((dep) => buildableDirs.has(dep))
              .map((dep) => `:build:${dep}`),
        cache: {
          input: [
            `packages/${dir}/src/**`,
            ...(srcLinked ? ['packages/utils/dist/**'] : []),
            `packages/${dir}/tests/**`,
            `packages/${dir}/*.ts`,
            `packages/${dir}/*.json`,
            ...workspaceDeps(dir).flatMap((dep) => [
              srcLinked ? `packages/${dep}/src/**` : `packages/${dep}/dist/**`,
              `packages/${dep}/package.json`,
            ]),
            'packages/tsconfig/**',
            'pnpm-lock.yaml',
          ],
          output: [],
        },
      },
    ]
  })
)

const buildTasks = Object.fromEntries(
  buildablePackages.map(({ dir, name }) => [
    `:build:${dir}`,
    {
      command: `pnpm --filter ${name} run build`,
      dependsOn: workspaceDeps(dir)
        .filter((dep) => buildableDirs.has(dep))
        .map((dep) => `:build:${dep}`),
      cache: {
        input: [
          `packages/${dir}/src/**`,
          `packages/${dir}/*.ts`,
          `packages/${dir}/*.json`,
          ...workspaceDeps(dir)
            .filter((dep) => buildableDirs.has(dep))
            .map((dep) => `packages/${dep}/dist/**`),
          'packages/tsconfig/**',
          'pnpm-lock.yaml',
        ],
        output: [`packages/${dir}/dist/**`],
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
      {
        files: aliasedSrcPackages.map((dir) => `packages/${dir}/src/**`),
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: ['../**'],
                  message:
                    'Do not use parent relative imports (../*). Use #src/* instead.',
                },
              ],
            },
          ],
          'no-console': ['error', { allow: ['warn', 'error'] }],
        },
      },
      {
        files: ['packages/core/src/**'],
        excludeFiles: ['packages/core/src/index.ts'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              paths: [
                '#src/modules',
                '#src/modules/index',
                './modules',
                './modules/index',
              ].map((name) => ({
                name,
                message: `Do not import from '${name}'. Import from a specific module (e.g. '#src/modules/validation') instead. The barrel is only allowed in modules.ts and index.ts.`,
              })),
              patterns: [
                {
                  group: ['../**'],
                  message:
                    'Do not use parent relative imports (../…). Use #src/… instead.',
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
      ':build': {
        // Aggregate only — the per-package tasks do the work.
        command: "node -e ''",
        dependsOn: buildablePackages.map(({ dir }) => `:build:${dir}`),
      },
      ...buildTasks,
      ':lint': {
        command: 'vp lint',
        dependsOn: [':stylelint', ':eslint'],
      },
      ':stylelint': {
        command: 'stylelint "**/*.{scss,css}"',
        cache: {
          input: [
            '**/*.scss',
            '**/*.css',
            '!**/dist/**',
            '!.vueform/**',
            '!.playgrounds/**',
            '!docs/.vitepress/cache/**',
            '!scripts/playground/templates/**',
            'stylelint.config.mjs',
            'pnpm-lock.yaml',
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
            '!.vueform/**',
            '!.playgrounds/**',
            '!docs/.vitepress/cache/**',
            '!docs/src/playground/**',
            '!packages/*/registry/**',
            '!scripts/playground/templates/**',
            'eslint.config.mjs',
            'pnpm-lock.yaml',
          ],
          output: [],
        },
      },
      ':typecheck': {
        command: "node -e ''",
        dependsOn: [
          ':build',
          ':typecheck:pkg',
          ':typecheck:root',
          ':typecheck:docs',
          ':typecheck:benchmark',
        ],
      },
      ...typecheckTasks,
      ':typecheck:pkg': {
        command: "node -e ''",
        dependsOn: checkedPackages.map(({ dir }) => `:typecheck:${dir}`),
      },
      ':typecheck:root': {
        command: 'tsc --noEmit',
        dependsOn: [':build:utils'],
        cache: {
          input: [
            '*.config.ts',
            'scripts/**',
            '!scripts/playground/templates/**',
            'packages/tsconfig/**',
            'packages/utils/dist/**',
            'tsconfig.json',
            'pnpm-lock.yaml',
          ],
          output: [],
        },
      },
      ':typecheck:docs': {
        command: 'pnpm --filter @vueform/docs run typecheck',
        dependsOn: docsBuildDeps.map((dep) => `:build:${dep}`),
        cache: {
          input: [
            'docs/**',
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
            'benchmark/app/node_modules/.modules.yaml',
            'packages/tsconfig/**',
            'pnpm-lock.yaml',
          ],
          output: [],
        },
      },
      ':quick': {
        command: "node -e ''",
        dependsOn: checkedPackages
          .filter(({ dir }) => aliasedSrcPackages.includes(dir))
          .map(({ dir }) => `:typecheck:${dir}`),
      },
      ':check': {
        command: 'vp fmt --check',
        dependsOn: [':lint', ':typecheck'],
      },
      ':fix': {
        command:
          'vp lint --fix --fix-suggestions && eslint "**/*.vue" --fix && stylelint "**/*.{scss,css}" --fix && vp fmt',
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
    },
  },
})
