#!/usr/bin/env node
/**
 * Orchestrates docs generators with dependency ordering.
 *
 * Usage: pnpm docs:generate # run all pnpm docs:generate -- contexts,ui # only
 * these (+ their deps) pnpm docs:generate -- contexts ui # same,
 * space-separated
 *
 * Generators: blueprints, composables, factories, contexts, types, runtime,
 * components, adapter-components, adapter-factories, ui, primevue
 */

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const FULL_ORDER = [
  'blueprints',
  'composables',
  'factories',
  'contexts',
  'types',
  'runtime',
  'components',
  'adapter-components',
  'adapter-factories',
  'ui',
  'primevue',
  'keywords',
  'reference',
]

const DEPS: Record<string, string[]> = {
  ui: ['blueprints', 'composables', 'factories', 'components'],
  'adapter-components': ['components'],
  primevue: [
    'adapter-components',
    'adapter-factories',
    'blueprints',
    'composables',
    'factories',
  ],
}

function parseArgs() {
  const tokens = process.argv
    .slice(2)
    .filter((a) => a !== '--')
    .flatMap((a) => a.split(','))
    .map((s) => s.trim())
    .filter(Boolean)

  return tokens.length ? tokens : null
}

function collectRequired(requested: string[]) {
  const set = new Set<string>(requested)
  for (const name of requested) {
    for (const d of DEPS[name] ?? []) {
      set.add(d)
    }
  }
  return [...set].sort((a, b) => FULL_ORDER.indexOf(a) - FULL_ORDER.indexOf(b))
}

const ADAPTER_ARGS: Record<string, string[]> = {
  'adapter-components': ['primevue'],
  'adapter-factories': ['primevue'],
}

function runGenerator(name: string) {
  const script = `generate:${name}`
  const extraArgs = ADAPTER_ARGS[name] ?? []
  console.log(
    `\n▶ docs ${script}${extraArgs.length ? ` ${extraArgs.join(' ')}` : ''}\n`
  )
  const r = spawnSync(
    'pnpm',
    ['--filter', 'docs', 'run', script, ...extraArgs],
    {
      cwd: ROOT,
      stdio: 'inherit',
      shell: false,
    }
  )
  if (r.status !== 0) {
    process.exit(r.status ?? 1)
  }
}

function main() {
  const requested = parseArgs()
  let list

  if (!requested || requested.length === 0) {
    list = [...FULL_ORDER]
  } else {
    const unknown = requested.filter((n) => !FULL_ORDER.includes(n))
    if (unknown.length) {
      console.error(
        `Unknown generator(s): ${unknown.join(', ')}\n` +
          `Valid: ${FULL_ORDER.join(', ')}`
      )
      process.exit(1)
    }
    list = collectRequired(requested)
  }

  console.log(`Docs generate: ${list.join(' → ')}`)

  for (const name of list) {
    runGenerator(name)
  }

  console.log('\n✓ Done.\n')
}

main()
