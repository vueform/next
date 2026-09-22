import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const templatesDir = path.join(repoRoot, 'playground', 'templates')
const outputDir = path.join(repoRoot, '.playgrounds', 'templates')

function exists(p: string) {
  try {
    fs.accessSync(p)
    return true
  } catch {
    return false
  }
}

const ALIASES: Record<string, string> = {
  pv: 'primevue',
  'nuxt-pv': 'nuxt-primevue',
  'vapor-pv': 'vapor-primevue',
}
// Playgrounds excluded from the pnpm workspace (own lockfile/node_modules).
// Root installs don't cover them, so restore deps here when missing.
const STANDALONE = new Set(['vapor', 'vapor-primevue'])
function resolveAlias(name: string) {
  return ALIASES[name] ?? name
}

function listPlaygrounds() {
  if (!exists(templatesDir)) return []
  return fs
    .readdirSync(templatesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name)
}

function run(
  cmd: string,
  args: string[],
  cwd?: string,
  env: Record<string, string> = {}
) {
  const res = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
  })

  if (res.status !== 0) process.exit(res.status ?? 1)
}

const available = listPlaygrounds()
const argv = process.argv.slice(2)

const selected = argv
  .filter((a) => a.startsWith('--'))
  .map((a) => resolveAlias(a.slice(2)))

if (selected.length !== 1) {
  console.error(
    `[pg:pre] Usage: pnpm pg:pre --<playground>\nExactly one playground must be specified.\nAvailable: ${available.join(', ')}`
  )
  process.exit(1)
}

const name = selected[0]

if (!available.includes(name)) {
  console.error(
    `[pg:pre] Unknown playground: "${name}"\nAvailable: ${available.join(', ')}`
  )
  process.exit(1)
}

const pgDir = path.join(outputDir, name)

if (!exists(pgDir)) {
  console.error(
    `[pg:pre] Playground "${name}" not found at .playgrounds/templates/${name}.\nRun "pnpm pg:up --${name}" first.`
  )
  process.exit(1)
}

if (STANDALONE.has(name) && !exists(path.join(pgDir, 'node_modules'))) {
  console.log(`[pg:pre] Installing deps for standalone "${name}"...`)
  run('pnpm', ['install', '--ignore-workspace'], pgDir)
}

console.log(`[pg:pre] Building "${name}"...`)
run('pnpm', ['run', 'build'], pgDir, { USE_DEV: 'true' })

console.log(`[pg:pre] Starting preview for "${name}"...`)
run('pnpm', ['run', 'preview'], pgDir, { USE_DEV: 'true' })
