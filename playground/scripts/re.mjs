import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const repoRoot = process.cwd()
const templatesDir = path.join(repoRoot, 'playground', 'templates')
const outputDir = path.join(repoRoot, '.playgrounds', 'templates')

const TEMPLATES = [
  'ui',
  'primevue',
  'nuxt',
  'nuxt-primevue',
  'vapor',
  'vapor-primevue',
]
// Playgrounds excluded from the pnpm workspace (own lockfile/node_modules),
// installed with `pnpm install --ignore-workspace` inside their directory.
const STANDALONE = new Set(['vapor', 'vapor-primevue'])
const ALIASES = {
  pv: 'primevue',
  'nuxt-pv': 'nuxt-primevue',
  'vapor-pv': 'vapor-primevue',
}
function resolveAlias(name) {
  return ALIASES[name] ?? name
}

function exists(p) {
  try {
    fs.accessSync(p)
    return true
  } catch {
    return false
  }
}

function run(cmd, args, cwd) {
  const res = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (res.status !== 0) process.exit(res.status ?? 1)
}

function patchPackageName(pkgPath, name) {
  if (!exists(pkgPath)) return

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  let changed = false

  if (pkg.name !== name) {
    pkg.name = name
    changed = true
  }

  if (pkg.private !== true) {
    pkg.private = true
    changed = true
  }

  if (changed) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }
}

function parseArgs(argv) {
  const selected = new Set()

  for (const a of argv) {
    if (a.startsWith('--')) {
      selected.add(resolveAlias(a.slice(2)))
    }
  }

  if (selected.size === 0) return null

  const available = new Set(TEMPLATES)
  const unknown = [...selected].filter((t) => !available.has(t))

  if (unknown.length) {
    console.error(
      `[pg:re] Unknown playground(s): ${unknown.join(', ')}\nAvailable: ${TEMPLATES.join(', ')}`
    )
    process.exit(1)
  }

  return selected
}

const argv = process.argv.slice(2)
const selected = parseArgs(argv)

const toProcess = selected
  ? TEMPLATES.filter((t) => selected.has(t))
  : TEMPLATES

if (!exists(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

for (const name of toProcess) {
  const src = path.join(templatesDir, name)
  const dest = path.join(outputDir, name)
  const destPkg = path.join(dest, 'package.json')

  if (!exists(src)) {
    console.error(
      `[pg:re] Template "${name}" not found at: ${path.relative(repoRoot, src)}`
    )
    process.exit(1)
  }

  if (exists(dest)) {
    console.log(`[pg:re] Removing existing "${name}"...`)
    fs.rmSync(dest, { recursive: true, force: true })
  }

  console.log(`[pg:re] Creating "${name}" from playground/templates/${name}...`)
  fs.cpSync(src, dest, { recursive: true })

  patchPackageName(destPkg, name)

  if (exists(destPkg)) {
    console.log(`[pg:re] Installing deps for "${name}"...`)
    if (STANDALONE.has(name)) {
      run('pnpm', ['install', '--ignore-workspace'], dest)
    } else {
      run('pnpm', ['install'], repoRoot)
    }
  }
}
