import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const repoRoot = process.cwd()
const templatesDir = path.join(repoRoot, 'playground', 'templates')
const outputDir = path.join(repoRoot, '.playgrounds', 'templates')

function exists(p) {
  try {
    fs.accessSync(p)
    return true
  } catch {
    return false
  }
}

const ALIASES = {
  pv: 'primevue',
  'nuxt-pv': 'nuxt-primevue',
  'vapor-pv': 'vapor-primevue',
}
// Playgrounds excluded from the pnpm workspace (own lockfile/node_modules).
// Root installs don't cover them, so restore deps here when missing.
const STANDALONE = new Set(['vapor', 'vapor-primevue'])
function resolveAlias(name) {
  return ALIASES[name] ?? name
}

function listPlaygrounds() {
  if (!exists(templatesDir)) return []
  return fs
    .readdirSync(templatesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name)
}

function run(cmd, args, cwd, env = {}) {
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
const isPreview = argv.includes('--pre')

const selected = argv
  .filter((a) => a.startsWith('--') && a !== '--pre')
  .map((a) => resolveAlias(a.slice(2)))

if (!selected.length) {
  console.error(
    `[pg] Usage: pnpm pg --<playground> [--pre]\nAvailable: ${available.join(', ')}`
  )
  process.exit(1)
}

const unknown = selected.filter((s) => !available.includes(s))
if (unknown.length) {
  console.error(
    `[pg] Unknown playground(s): ${unknown.join(', ')}\nAvailable: ${available.join(', ')}`
  )
  process.exit(1)
}

for (const name of selected) {
  const pgDir = path.join(outputDir, name)

  if (!exists(pgDir)) {
    console.log(
      `[pg] Playground "${name}" not found. Running pg:up --${name}...`
    )
    run('pnpm', ['pg:up', `--${name}`], repoRoot)
  }

  if (STANDALONE.has(name) && !exists(path.join(pgDir, 'node_modules'))) {
    console.log(`[pg] Installing deps for standalone "${name}"...`)
    run('pnpm', ['install', '--ignore-workspace'], pgDir)
  }

  if (isPreview) {
    console.log(`[pg] Building "${name}"...`)
    run('pnpm', ['run', 'build'], pgDir, { USE_DEV: 'true' })

    console.log(`[pg] Starting preview for "${name}"...`)
    run('pnpm', ['run', 'preview'], pgDir, { USE_DEV: 'true' })
  } else {
    console.log(`[pg] Starting dev server for "${name}"...`)
    run('pnpm', ['run', 'dev'], pgDir, { USE_DEV: 'true' })
  }
}
