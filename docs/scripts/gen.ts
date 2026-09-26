import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export const DOCS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)

// ---------------------------------------------------------------------------
// Generator registry
// ---------------------------------------------------------------------------

// Structural json extraction (blueprints, classes, components, composables,
// contexts, helpers, locales, modules, tokens) lives in scripts/api-extractor and
// writes to .api/ at the monorepo root — run `pnpm extract` there. The
// generators here only produce docs content from those jsons.
export const ALL_GENERATORS = [
  'json-types',
  'guide-tokens',
  'guide-locales',
  // 'guide-code-splitting',
  // 'guide-benchmark',
  'reference-composables',
  'reference-helpers',
  'json-keywords',
  'reference-components',
] as const

export type Generator = (typeof ALL_GENERATORS)[number]

export const GENERATOR_DEPS: Partial<Record<Generator, Generator[]>> = {}

export const JSON_TO_GENERATOR: Record<string, Generator> = {
  'keywords.json': 'json-keywords',
  'types.json': 'json-types',
}

export const PAGE_TO_GENERATOR: Record<string, Generator> = {
  'Helpers reference': 'reference-helpers',
  'Components reference': 'reference-components',
  'Composables reference': 'reference-composables',
  'Type pages': 'json-types',
  'Theming guide': 'guide-tokens',
  'Code-splitting guide': 'guide-code-splitting',
  'Performance guide': 'guide-benchmark',
  'Locales guide': 'guide-locales',
}

export const WAVES: Generator[][] = [
  [
    'json-types',
    'guide-locales',
    // 'guide-code-splitting',
    // 'guide-benchmark',
    'guide-tokens',
    'reference-composables',
    'reference-helpers',
  ],
  ['json-keywords', 'reference-components'],
]

// ---------------------------------------------------------------------------
// Dependency resolution (topological sort)
// ---------------------------------------------------------------------------

export function resolveDeps(generators: Generator[]): Generator[] {
  const visited = new Set<Generator>()
  const ordered: Generator[] = []

  function visit(gen: Generator) {
    if (visited.has(gen)) return
    visited.add(gen)
    for (const dep of GENERATOR_DEPS[gen] ?? []) {
      visit(dep)
    }
    ordered.push(gen)
  }

  for (const gen of generators) {
    visit(gen)
  }

  return ordered
}

// ---------------------------------------------------------------------------
// Execution helpers
// ---------------------------------------------------------------------------

export function scriptPath(gen: Generator): string {
  return path.join(DOCS_DIR, 'scripts', 'generators', `${gen}.ts`)
}

export function runGenerator(gen: Generator): void {
  console.log(`\n\x1b[36m▶ ${gen}\x1b[0m`)
  execSync(`pnpm exec tsx ${scriptPath(gen)}`, {
    cwd: DOCS_DIR,
    stdio: 'inherit',
  })
}

export function runSequential(generators: Generator[]): void {
  const start = Date.now()
  for (const gen of generators) {
    runGenerator(gen)
  }
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  console.log(`\n\x1b[32m✓ Done in ${elapsed}s\x1b[0m`)
}

export function runParallelWave(generators: Generator[]): Promise<void> {
  return new Promise((resolve, reject) => {
    let remaining = generators.length
    let failed = false

    for (const gen of generators) {
      const child = spawn('pnpm', ['exec', 'tsx', scriptPath(gen)], {
        cwd: DOCS_DIR,
        stdio: 'inherit',
      })

      child.on('close', (code) => {
        if (code !== 0 && !failed) {
          failed = true
          reject(new Error(`${gen} exited with code ${code}`))
          return
        }
        remaining--
        if (remaining === 0 && !failed) resolve()
      })

      child.on('error', (err) => {
        if (!failed) {
          failed = true
          reject(err)
        }
      })
    }
  })
}

// ---------------------------------------------------------------------------
// Main: run every docs generator (waves in parallel). Assumes the structural
// jsons in the monorepo root's .api/ are fresh — run `pnpm extract`
// first if they aren't. The interactive front-end lives in cli.ts.
// ---------------------------------------------------------------------------

async function main() {
  const start = Date.now()

  for (let i = 0; i < WAVES.length; i++) {
    const wave = WAVES[i]
    console.log(
      `\n\x1b[35m━━━ Wave ${i} (${wave.length} generators in parallel) ━━━\x1b[0m`
    )
    await runParallelWave(wave)
    console.log(`\x1b[32m✓ Wave ${i} complete\x1b[0m`)
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  console.log(`\n\x1b[32m✓ All generators done in ${elapsed}s\x1b[0m`)
}

const isMain =
  process.argv[1] != null &&
  fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
