import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { requireData, SCRAPE_HINT } from './ensureData'

// =============== PATHS ================

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(SCRIPT_DIR, '..', '..')
const GENERATED_DIR = path.join(DOCS_ROOT, '.generated')
const SCRAPED_DIR = path.resolve(DOCS_ROOT, '..', '.api')

requireData(
  'helpers-reference',
  path.join(SCRAPED_DIR, 'core', 'helpers.json'),
  SCRAPE_HINT
)
const HELPERS_DIR = path.join(DOCS_ROOT, 'src/api/helpers')

const DOCS_CONFIG = JSON.parse(
  fs.readFileSync(path.join(DOCS_ROOT, 'config.json'), 'utf-8')
)

const HELPER_ORDER: string[] = DOCS_CONFIG.orders?.helpers ?? []

interface AdapterDef {
  path: string
  typesOutputDir: string
  host: string
  config: string
  displayName?: string
}

const adapters: Record<string, AdapterDef> = DOCS_CONFIG.adapters

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
  // Scraped structural jsons live at the monorepo root, docs-own ones
  // (types.json, keywords.json) under docs/.generated; both use core/ for
  // the shared data and one folder per adapter.
  const scrapedPath = path.join(SCRAPED_DIR, 'core', name)
  const filePath = fs.existsSync(scrapedPath)
    ? scrapedPath
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

  const allNames = Object.keys(helpers).filter((n) => !helpers[n].private)

  const indent = '            '

  for (const [adapterName, adapterDef] of Object.entries(adapters)) {
    const adapterPath = path.join(SCRAPED_DIR, adapterName, 'helpers.json')
    const adapterHelpers: Record<string, HelperEntry> = fs.existsSync(
      adapterPath
    )
      ? JSON.parse(fs.readFileSync(adapterPath, 'utf-8'))
      : {}

    const mergedNames = [
      ...new Set([...allNames, ...Object.keys(adapterHelpers)]),
    ].filter((n) => !helpers[n]?.private)
    const helperNames = sortNames(mergedNames, HELPER_ORDER)

    const configPath = path.join(
      DOCS_ROOT,
      path.relative(DOCS_ROOT, path.resolve(DOCS_ROOT, '..', adapterDef.config))
    )
    let config = fs.readFileSync(configPath, 'utf-8')
    config = patchConfigRegion(
      config,
      'helpers',
      serializeItems(helperNames, indent)
    )
    fs.writeFileSync(configPath, config)
  }

  console.log(
    `helpers-reference: ${created} created, ${updated} updated, ${removed} removed, ${unchanged} unchanged`
  )
}

main()
