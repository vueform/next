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
import { defineConfig } from 'vite-plus'
import type { OxfmtConfig } from 'vite-plus/fmt'
import type { OxlintConfig } from 'vite-plus/lint'

/**
 * Formatting (`vp fmt`, the oxc editor extension, `vp check`). This is the
 * only format config — there is no `.oxfmtrc.json`. The registry/docs
 * generators read this same block at runtime (vite's `loadConfigFromFile` in
 * packages/utils/src/registry.ts) to format emitted sources, so generated
 * output follows it by construction.
 */
const fmtConfig: OxfmtConfig = {
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
    'node_modules',
    'dist',
    'pnpm-lock.yaml',
    '*.md',
    '.playgrounds',
    'packages/*/registry',
    'packages/metrics/results/',
    'packages/core/tests/perf/.results/',
    'packages/core/tests/perf-dts/.results/',
    'docs/src/playground/**',
  ],
}

/**
 * Linting (`vp lint`, the oxc editor extension, `vp check`). This is the only
 * lint config — there is no `.oxlintrc.json`.
 */
const lintConfig: OxlintConfig = {
  categories: {
    correctness: 'error',
  },
  plugins: ['typescript', 'import'],
  ignorePatterns: [
    '**/dist/**',
    '.playgrounds/**',
    'benchmark/**',
    'docs/.vitepress/cache/**',
    'packages/*/registry/**',
    'docs/src/playground/**',
    '**/*.global.js',
  ],
  rules: {
    'no-control-regex': 'off',
    'no-irregular-whitespace': 'off',

    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],

    'import/no-duplicates': ['error', { preferInline: true }],
    'import/first': 'error',
    'import/newline-after-import': 'error',
  },
  overrides: [
    {
      files: ['**/*.test-d.ts', 'packages/core/tests/bench-dts/**'],
      rules: {
        'no-unused-expressions': 'off',
        'typescript/no-useless-empty-export': 'off',
      },
    },

    // ——— Import restrictions ———
    // Package sources: no parent-relative imports (../…) — use @/… instead.
    {
      files: ['packages/*/src/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['../**'],
                message:
                  'Do not use parent relative imports (../…). Use @/… instead.',
              },
            ],
          },
        ],
      },
    },
    // Core additionally bans the modules barrel: it is only allowed in
    // modules.ts (`~/modules`) and index.ts (`./modules`); everything else
    // imports a specific module (e.g. '~/modules/validation').
    {
      files: ['packages/core/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              '~/modules',
              '~/modules/index',
              './modules',
              './modules/index',
            ].map((name) => ({
              name,
              message: `Do not import from '${name}'. Import from a specific module (e.g. '~/modules/validation') instead. The barrel is only allowed in modules.ts and index.ts.`,
            })),
            patterns: [
              {
                group: ['../**'],
                message:
                  'Do not use parent relative imports (../…). Use @/… instead.',
              },
            ],
          },
        ],
      },
    },
    // index.ts is the one consumer the barrel exists for.
    {
      files: ['packages/core/src/index.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['../**'],
                message:
                  'Do not use parent relative imports (../…). Use @/… instead.',
              },
            ],
          },
        ],
      },
    },
    // Core tests: ban the ~/ alias entirely, but allow any relative imports.
    {
      files: ['packages/core/tests/**', 'packages/core/benchmarks/**'],
      rules: {
        'no-restricted-imports': [
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
    // The CLI and utils publish as plain NodeNext packages — relative imports
    // are their module system; metrics and scraper are internal tooling.
    {
      files: [
        'packages/cli/**',
        'packages/utils/**',
        'packages/metrics/**',
        'packages/scraper/**',
      ],
      rules: {
        'no-restricted-imports': 'off',
      },
    },

    // ——— Named exports only (src) ———
    {
      files: ['**/src/**'],
      rules: {
        'import/no-default-export': 'error',
      },
    },
    // Exempt: areas whose files are consumed as default exports by convention
    // (plugins, services, SFC-heavy component dirs, theme/tokens, vite/nuxt).
    {
      files: [
        '**/src/plugins/**',
        '**/src/services/**',
        '**/src/components/**',
        '**/src/theme/**',
        '**/src/tokens/**',
        'packages/utils/src/**',
        'packages/nuxt/src/**',
        'packages/metrics/**',
        '**/*.d.ts',
      ],
      rules: {
        'import/no-default-export': 'off',
      },
    },

    // ——— Per-area relaxations ———
    // CLI scripts and the published CLI are console apps, as are the modules
    // behind utils' vf-size / vf-validate-source bins — their terminal output
    // is the product. Smoke fixtures simulate user projects (incl. their dev
    // servers), so their logging is legitimate too.
    {
      files: [
        '**/scripts/**',
        'packages/scraper/**',
        'packages/cli/**',
        'packages/utils/**',
        'packages/*/tests/smoke/**',
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
        'no-unused-vars': 'off',
      },
    },
  ],
}

/**
 * Inputs shared by every cached task.
 */
const base = ['pnpm-lock.yaml', 'pnpm-workspace.yaml']

/**
 * The vite/vitest config factories live in utils' compiled dist — every
 * factory-driven task depends on it.
 */
const utilsDist = 'packages/utils/dist/**'

/**
 * A package build task: the package's own `build` script, cached on its sources
 * (and any `extra` upstream dists), restoring `dist` on a hit.
 */
const pkgBuild = (
  name: string,
  dir: string,
  opts: { dependsOn?: string[]; extra?: string[] } = {}
) => ({
  command: `pnpm --filter ${name} run build`,
  dependsOn: opts.dependsOn ?? [],
  cache: {
    env: ['NODE_ENV'],
    input: [
      ...base,
      `packages/${dir}/src/**`,
      `packages/${dir}/package.json`,
      `packages/${dir}/tsconfig*.json`,
      `packages/${dir}/*.config.ts`,
      'packages/global.d.ts',
      ...(opts.extra ?? []),
    ],
    output: [`packages/${dir}/dist/**`],
  },
})

/**
 * A stage task wrapping an existing `tsx scripts/*` orchestrator. Cached stages
 * declare their inputs and restore no outputs (a hit just skips the stage);
 * `cache: false` stages always run.
 */
const stage = (
  script: string,
  opts: { dependsOn?: string[]; cache?: false | string[]; output?: string[] }
) => ({
  command: `tsx scripts/${script}.ts`,
  dependsOn: opts.dependsOn ?? [],
  cache:
    opts.cache === false
      ? (false as const)
      : {
          env: ['NODE_ENV'],
          input: [...base, ...(opts.cache ?? [])],
          output: opts.output ?? [],
        },
})

const allBuilds = [
  'build:utils',
  'build:core',
  'build:ui',
  'build:primevue',
  'build:dompurify',
  'build:expr-eval',
  'build:cli',
  'build:nuxt',
]

const allSrc = 'packages/*/src/**'
const allDist = 'packages/*/dist/**'

export default defineConfig({
  fmt: fmtConfig,
  lint: lintConfig,
  run: {
    tasks: {
      // ——— per-package builds (the dependency-critical chain) ———
      'build:utils': pkgBuild('@vueform/utils', 'utils'),
      'build:core': pkgBuild('@vueform/core', 'core', {
        dependsOn: ['build:utils'],
        extra: [utilsDist],
      }),
      'build:ui': pkgBuild('@vueform/ui', 'ui', {
        dependsOn: ['build:utils', 'build:core'],
        extra: [utilsDist, 'packages/core/dist/**'],
      }),
      'build:primevue': pkgBuild('@vueform/primevue', 'primevue', {
        dependsOn: ['build:utils', 'build:core'],
        extra: [utilsDist, 'packages/core/dist/**'],
      }),
      // The plugins' d.ts generation type-checks against core's BUILT dist
      // types (tsdown factories, migration stage 3) — core must finish
      // first, or a concurrent half-emitted core dist degrades their typed
      // exports to `any`.
      'build:dompurify': pkgBuild('@vueform/dompurify', 'dompurify', {
        dependsOn: ['build:utils', 'build:core'],
        extra: [utilsDist, 'packages/core/dist/**'],
      }),
      'build:expr-eval': pkgBuild('@vueform/expr-eval', 'expr-eval', {
        dependsOn: ['build:utils', 'build:core'],
        extra: [utilsDist, 'packages/core/dist/**'],
      }),
      'build:cli': pkgBuild('@vueform/cli', 'cli'),
      // nuxt's types import the adapters' `components/names` dist types.
      'build:nuxt': pkgBuild('@vueform/nuxt', 'nuxt', {
        dependsOn: ['build:ui', 'build:primevue'],
        extra: ['packages/ui/dist/**', 'packages/primevue/dist/**'],
      }),
      'p:build': {
        command: "echo 'build: all package dists up to date'",
        dependsOn: allBuilds,
        cache: false as const,
      },

      // ——— verification stages (wrapping the tsx orchestrators) ———
      // Mutating: never cached, never a dependency of anything.
      'p:fix': stage('fix', { cache: false }),
      'p:check': stage('check', {
        cache: [
          allSrc,
          'packages/*/tests/**',
          'packages/*/tsconfig*.json',
          'packages/global.d.ts',
          'tsconfig*.json',
          'scripts/**',
          '*.config.*',
        ],
      }),
      'p:validate': stage('validate', {
        dependsOn: ['build:utils'],
        cache: [utilsDist, allSrc],
      }),
      'p:test': stage('test', {
        dependsOn: ['build:utils'],
        cache: [
          utilsDist,
          allSrc,
          'packages/*/tests/**',
          'packages/*/vitest.config.ts',
        ],
      }),
      // Source type tests, except one dist-gating test file that needs core's
      // build (shorthand-attrs-dist.test-d.ts).
      'p:test:dts': stage('test-dts', {
        dependsOn: ['build:utils', 'build:core'],
        cache: [
          utilsDist,
          'packages/core/dist/**',
          allSrc,
          'packages/*/tests/dts/**',
          'packages/*/tsconfig*.json',
          'tsconfig.json',
        ],
      }),
      // Dist type tests: the consumer's view of built d.ts (migration gate).
      'p:test:dts-dist': stage('test-dts-dist', {
        dependsOn: ['build:utils', 'build:core', 'build:primevue'],
        cache: [
          utilsDist,
          'packages/core/dist/**',
          'packages/primevue/dist/**',
          'packages/*/tests/dts-dist/**',
        ],
      }),
      // Benchmarks measure — a cache replay would defeat their purpose.
      'p:test:bench': stage('test-bench', {
        dependsOn: ['build:utils'],
        cache: false,
      }),
      'p:test:bench-dts': stage('test-bench-dts', {
        dependsOn: ['build:utils'],
        cache: false,
      }),
      // Playwright suites: user-run only, never cached, need full dists.
      'p:test:smoke': stage('smoke', {
        dependsOn: ['p:build'],
        cache: false,
      }),
      'p:test:visual': stage('test-visual', {
        dependsOn: ['build:utils'],
        cache: false,
      }),
      'p:registry': stage('registry', {
        dependsOn: ['build:utils'],
        cache: [utilsDist, allSrc],
        output: ['packages/*/registry/**'],
      }),
      'p:size': stage('size', {
        dependsOn: ['p:build'],
        cache: [utilsDist, allDist],
      }),
      'p:bench': {
        command: 'pnpm --filter @vueform/benchmark run bench',
        dependsOn: ['p:build'],
        cache: false as const,
      },
      'p:extract': {
        command: 'tsx scripts/api-extractor/extract.ts',
        dependsOn: ['p:build'],
        cache: {
          env: ['NODE_ENV'],
          // package.json files are real extract inputs: exports-map changes
          // alter the emitted .api JSON (seen with the names-export fix).
          input: [
            ...base,
            allDist,
            'packages/*/package.json',
            'scripts/api-extractor/**',
          ],
          output: ['.api/**'],
        },
      },
      'p:docs:gen': {
        command: 'pnpm -r --filter docs run gen',
        dependsOn: ['p:extract'],
        cache: false as const,
      },
      'p:docs:build': {
        command: 'pnpm -r --filter docs run build',
        dependsOn: ['p:docs:gen'],
        cache: false as const,
      },

      // ——— the one-command full pipeline, in fixed stage order ———
      // Each nested `vp run` segment hits the task graph, so every stage
      // keeps its own cache entry while the array enforces stage order.
      // Stage-end verification pipeline (user decisions, 2026-10-05):
      // - `p:test:smoke` and `p:test:visual` are NOT part of per-stage runs —
      //   they run only in `pipeline:full`, at the end of the whole
      //   migration (or on explicit request).
      // - `p:docs:build`, `p:size` and `p:bench` are excluded entirely
      //   (explicit request only): size rewrites the package READMEs, and
      //   bench regenerates the PUBLIC benchmark charts/JSON in benchmark/ —
      //   neither belongs in routine verification. `p:test:bench` and
      //   `p:test:bench-dts` (private perf gates) DO run. `p:docs:gen` runs
      //   (it exercises the .api consumers).
      // - Concurrency is capped at 2 — the machine is also the user's
      //   interactive workstation, and the wrapped suites spawn their own
      //   workers (vitest --maxWorkers, Playwright, sass) on top of vp's.
      // One `&&`-joined shell command: a failing segment fails the whole
      // pipeline with ordinary shell semantics.
      pipeline: {
        command: [
          'vp run p:fix',
          'vp run --concurrency-limit 2 p:build',
          'vp run p:check',
          'vp run p:validate',
          'vp run p:test',
          'vp run p:test:dts',
          'vp run p:test:dts-dist',
          'vp run p:test:bench',
          'vp run p:test:bench-dts',
          'vp run p:registry',
          'vp run p:extract',
          'vp run p:docs:gen',
        ].join(' && '),
        cache: false as const,
      },
      // The complete verification incl. the Playwright suites — end of the
      // whole migration (or explicit request) only.
      'pipeline:full': {
        command: [
          'vp run pipeline',
          'vp run p:test:smoke',
          'vp run p:test:visual',
        ].join(' && '),
        cache: false as const,
      },
    },
  },
})
