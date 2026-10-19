import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import { requireData, API_EXTRACTOR_HINT } from './ensure-data'

// =============== PATHS ================

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(SCRIPT_DIR, '..', '..')
const GENERATED_DIR = path.join(DOCS_ROOT, '..', '.vueform', 'docs')
const API_DIR = path.resolve(DOCS_ROOT, '..', '.vueform/api')

requireData(
  'helpers-reference',
  path.join(API_DIR, 'core', 'helpers.json'),
  API_EXTRACTOR_HINT
)
const HELPERS_DIR = path.join(DOCS_ROOT, 'src/api/helpers')

const DOCS_CONFIG = JSON.parse(
  fs.readFileSync(path.join(DOCS_ROOT, 'config.json'), 'utf-8')
)

const HELPER_ORDER: string[] = DOCS_CONFIG.orders?.helpers ?? []

const SIDEBAR_PATH = path.join(DOCS_ROOT, '.vitepress/sidebar.ts')

// ============== TEMPLATE ==============

const TEMPLATE = fs.readFileSync(
  path.join(HELPERS_DIR, '_template.md'),
  'utf-8'
)

// =============== TYPES ================

interface HelperEntry {
  private?: true
  description?: string
}

// ============== HELPERS ===============

const DESCRIPTION_RE =
  /<!-- #region description -->[\s\S]*?<!-- #endregion description -->/

function loadJSON<T>(name: string): Record<string, T> {
  // Extracted structural jsons live at the monorepo root, docs-own ones
  // (types.json, keywords.json) under .vueform/docs/core for the shared
  // data (adapters' live in docs/src/_<adapter>).
  const apiPath = path.join(API_DIR, 'core', name)
  const filePath = fs.existsSync(apiPath)
    ? apiPath
    : path.join(GENERATED_DIR, 'core', name)
  if (!fs.existsSync(filePath)) return {}
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function sortNames(names: string[], order: string[]): string[] {
  const orderIndex = new Map(order.map((n, i) => [n, i]))
  const listed = names.filter((n) => orderIndex.has(n))
  const unlisted = names.filter((n) => !orderIndex.has(n))
  listed.sort((a, b) => orderIndex.get(a)! - orderIndex.get(b)!)
  unlisted.sort()
  return [...listed, ...unlisted]
}

function buildDescriptionRegion(description: string): string {
  return [
    '<!-- #region description -->',
    description,
    '<!-- #endregion description -->',
  ].join('\n')
}

function scaffoldPage(name: string, description: string): string {
  return TEMPLATE.replaceAll('helperName', name).replace(
    DESCRIPTION_RE,
    buildDescriptionRegion(description)
  )
}

function serializeItems(names: string[], indent: string): string {
  return names
    .map((n) => `${indent}{ text: '${n}', link: '/api/helpers/${n}' },`)
    .join('\n')
}

function patchConfigRegion(
  config: string,
  marker: string,
  items: string
): string {
  const startTag = `// @generated:${marker}-start`
  const endTag = `// @generated:${marker}-end`
  const re = new RegExp(
    `(${escapeRe(startTag)}\\n)(?:[\\s\\S]*?\\n)?([ \\t]*${escapeRe(endTag)})`
  )
  return config.replace(re, `$1${items}\n$2`)
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ================ MAIN ================

function main() {
  fs.mkdirSync(HELPERS_DIR, { recursive: true })

  const helpers = loadJSON<HelperEntry>('helpers.json')

  const expected = new Map<string, { description: string }>()

  for (const [name, entry] of Object.entries(helpers)) {
    if (entry.private) continue
    expected.set(name, { description: entry.description ?? '' })
  }

  const existing = fs
    .readdirSync(HELPERS_DIR)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => f.replace(/\.md$/, ''))

  let created = 0
  let updated = 0
  let removed = 0
  let unchanged = 0

  for (const name of existing) {
    if (!expected.has(name)) {
      fs.unlinkSync(path.join(HELPERS_DIR, `${name}.md`))
      removed++
    }
  }

  for (const [name, { description }] of expected) {
    const filePath = path.join(HELPERS_DIR, `${name}.md`)
    const descRegion = buildDescriptionRegion(description)

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')

      if (!DESCRIPTION_RE.test(content)) {
        unchanged++
        continue
      }

      const newContent = content.replace(DESCRIPTION_RE, descRegion)

      if (newContent === content) {
        unchanged++
        continue
      }

      fs.writeFileSync(filePath, newContent)
      updated++
    } else {
      fs.writeFileSync(filePath, scaffoldPage(name, description))
      created++
    }
  }

  // Patch the shared sidebar config. It is used by every adapter build, so
  // only core helpers go in; an adapter-only helper needs an `/api` sidebar
  // section in that adapter's own config instead.
  const allNames = Object.keys(helpers).filter((n) => !helpers[n].private)
  const helperNames = sortNames(allNames, HELPER_ORDER)

  const sidebarSrc = fs.readFileSync(SIDEBAR_PATH, 'utf-8')
  fs.writeFileSync(
    SIDEBAR_PATH,
    patchConfigRegion(
      sidebarSrc,
      'helpers',
      serializeItems(helperNames, '        ')
    )
  )

  console.log(
    `helpers-reference: ${created} created, ${updated} updated, ${removed} removed, ${unchanged} unchanged`
  )
}

main()
