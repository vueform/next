/**
 * Runs repo repair scripts (scripts/repair/<name>.ts). Each one is a standalone
 * tsx script; unrecognized flags (e.g. `--check`) are forwarded to every script
 * it runs.
 *
 * - `pnpm repair` — run all repair scripts
 * - `pnpm repair --tsconfig` — run one by name flag
 * - `pnpm repair --repair=a,b` / `-r=a,b` — comma-separated selection
 * - `pnpm repair --tsconfig --check` — forwarded flag (drift check / CI)
 */
import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import path from 'node:path'

const repairDir = path.join(import.meta.dirname, 'repair')

const available = readdirSync(repairDir)
  .filter((file) => file.endsWith('.ts'))
  .map((file) => file.replace(/\.ts$/, ''))
  .sort()

const selected = new Set<string>()
const forwarded: string[] = []

for (const arg of process.argv.slice(2)) {
  const list = arg.match(/^(?:--repair|-r)=(.+)$/)
  const single = arg.match(/^--([\w-]+)$/)

  if (list) {
    for (const name of list[1].split(',')) selected.add(name.trim())
  } else if (single && available.includes(single[1])) {
    selected.add(single[1])
  } else {
    forwarded.push(arg)
  }
}

const unknown = [...selected].filter((name) => !available.includes(name))
if (unknown.length) {
  console.error(
    `[repair] unknown repair script(s): ${unknown.join(', ')} — available: ${available.join(', ')}`
  )
  process.exit(1)
}

const toRun = selected.size
  ? available.filter((n) => selected.has(n))
  : available
let failed = false

for (const name of toRun) {
  console.log(
    `[repair] ${name}${forwarded.length ? ` (${forwarded.join(' ')})` : ''}`
  )
  const result = spawnSync(
    'tsx',
    [path.join(repairDir, `${name}.ts`), ...forwarded],
    { stdio: 'inherit' }
  )
  if (result.status !== 0) failed = true
}

process.exit(failed ? 1 : 0)
