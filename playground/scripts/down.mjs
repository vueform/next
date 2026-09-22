import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const outputDir = path.join(repoRoot, '.playgrounds', 'templates')

const TEMPLATES = [
  'ui',
  'primevue',
  'nuxt',
  'nuxt-primevue',
  'vapor',
  'vapor-primevue',
]
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
      `[pg:down] Unknown playground(s): ${unknown.join(', ')}\nAvailable: ${TEMPLATES.join(', ')}`
    )
    process.exit(1)
  }

  return selected
}

if (!exists(outputDir)) {
  console.log('[pg:down] No .playgrounds/templates directory found.')
  process.exit(0)
}

const argv = process.argv.slice(2)
const selected = parseArgs(argv)

const toRemove = selected ? TEMPLATES.filter((n) => selected.has(n)) : TEMPLATES

let removed = 0

for (const name of toRemove) {
  const fullPath = path.join(outputDir, name)

  if (!exists(fullPath)) {
    console.log(`[pg:down] "${name}" does not exist, skipping.`)
    continue
  }

  fs.rmSync(fullPath, { recursive: true, force: true })
  console.log(`[pg:down] Removed .playgrounds/templates/${name}`)
  removed++
}

if (!removed) {
  console.log('[pg:down] Nothing was removed.')
}
