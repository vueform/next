import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import uiConfig from '../../.vitepress/adapters/ui/config'
import { requireData, SCRAPE_HINT } from './ensureData'

// =============== PATHS ================

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(SCRIPT_DIR, '..', '..')
const GENERATED_DIR = path.join(DOCS_ROOT, '.generated')
const SCRAPED_DIR = path.resolve(DOCS_ROOT, '..', '.generated')

requireData('keywords', path.join(SCRAPED_DIR, 'core'), SCRAPE_HINT)

interface AdapterDef {
  path: string
  typesOutputDir: string
  host: string
  config: string
  github?: string
  keywords?: Record<string, any>
}

const DOCS_CONFIG = JSON.parse(
  fs.readFileSync(path.join(DOCS_ROOT, 'config.json'), 'utf-8')
)
const adapters: Record<string, AdapterDef> = DOCS_CONFIG.adapters

// =============== SIDEBAR LINK MAP ================

type SidebarItem = { text?: string; link?: string; items?: SidebarItem[] }

function buildLinkMap(config: any): Map<string, string> {
  const map = new Map<string, string>()
  const sidebar = config?.themeConfig?.sidebar
  if (!sidebar || typeof sidebar !== 'object') return map

  function walk(items: SidebarItem[]) {
    for (const item of items) {
      if (item.text && item.link) {
        map.set(item.text, item.link)
      }
      if (item.items) walk(item.items)
    }
  }

  for (const groups of Object.values(sidebar)) {
    if (Array.isArray(groups)) walk(groups as SidebarItem[])
  }

  return map
}

const uiLinkMap = buildLinkMap(uiConfig)

function resolveLink(name: string): string | undefined {
  return uiLinkMap.get(name)
}

// =============== UTILS ================

function readJSON(filePath: string): Record<string, any> {
  if (!fs.existsSync(filePath)) return {}
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

// ============= SHARED COLLECTORS =============

function collectComposables(file: string): Record<string, any> {
  const data = readJSON(file)
  const result: Record<string, any> = {}
  for (const name of Object.keys(data)) {
    if (data[name]?.private) continue
    const link = resolveLink(name)
    if (link) result[name] = { link }
  }
  return result
}

function collectFeatures(file: string): Record<string, any> {
  const data = readJSON(file)
  const result: Record<string, any> = {}
  for (const name of Object.keys(data)) {
    const link = resolveLink(name)
    if (link) result[name] = { link }
  }
  return result
}

function collectHelpers(file: string): Record<string, any> {
  const data = readJSON(file)
  const result: Record<string, any> = {}
  for (const name of Object.keys(data)) {
    if (data[name]?.private) continue
    const link = resolveLink(name)
    if (link) result[name] = { link }
  }
  return result
}

interface ModifierData {
  description: string
  file?: string
  line?: number
  tokens?: string[]
}

/**
 * Builds a flat popover entry (description + optional tokens + github).
 */
function buildClassEntry(
  baseUrl: string,
  mod: ModifierData
): Record<string, any> {
  const githubUrl =
    mod.file && mod.line ? `${baseUrl}${mod.file}#L${mod.line}` : undefined
  const popover: string[] = [mod.description]
  if (mod.tokens?.length) popover.push('$tokens')
  if (githubUrl) popover.push('$github')
  const entry: Record<string, any> = {
    ...(githubUrl ? { github: githubUrl } : {}),
    popover,
  }
  if (mod.tokens?.length) entry.tokens = mod.tokens
  return entry
}

function collectClasses(
  classesFile: string,
  baseUrl: string
): Record<string, any> {
  const data = readJSON(classesFile)
  const result: Record<string, any> = {}

  // Collect every place a modifier name appears (it may belong to many roots).
  const modifierOccurrences: Record<
    string,
    { parent: string; mod: ModifierData }[]
  > = {}

  for (const [name, entry] of Object.entries(data)) {
    const classEntry = entry as {
      description: string
      file?: string
      line?: number
      tokens?: string[]
      modifiers?: Record<string, ModifierData>
    }
    result[`.${name}`] = buildClassEntry(baseUrl, classEntry)

    if (classEntry.modifiers) {
      for (const [modName, mod] of Object.entries(classEntry.modifiers)) {
        if (!modifierOccurrences[modName]) modifierOccurrences[modName] = []
        modifierOccurrences[modName].push({ parent: name, mod })
      }
    }
  }

  // Emit modifier keywords. Single parent → flat entry. Multiple parents →
  // a `variants` map keyed by parent class, surfaced via a `$variants` block.
  for (const [modName, occurrences] of Object.entries(modifierOccurrences)) {
    const modKey = `.${modName}`
    if (result[modKey]) continue // never override a documented root class

    if (occurrences.length === 1) {
      result[modKey] = buildClassEntry(baseUrl, occurrences[0].mod)
    } else {
      const variants: Record<string, any> = {}
      for (const { parent, mod } of occurrences) {
        variants[parent] = buildClassEntry(baseUrl, mod)
      }
      result[modKey] = { popover: ['$variants'], variants }
    }
  }

  return result
}

function collectTokens(
  tokensFile: string,
  classesFile: string,
  baseUrl: string
): Record<string, any> {
  const data = readJSON(tokensFile)
  const classesData = readJSON(classesFile)

  // Build reverse map: token → list of class names that use it
  const tokenToClasses: Record<string, string[]> = {}
  for (const [className, classEntry] of Object.entries(classesData)) {
    const entry = classEntry as { tokens?: string[] }
    if (entry.tokens) {
      for (const token of entry.tokens) {
        if (!tokenToClasses[token]) tokenToClasses[token] = []
        tokenToClasses[token].push(`.${className}`)
      }
    }
  }

  const result: Record<string, any> = {}
  for (const [cssVar, entry] of Object.entries(data)) {
    const tokenEntry = entry as {
      description?: string
      file?: string
      line?: number
    }
    if (!tokenEntry.description) continue
    const githubUrl =
      tokenEntry.file && tokenEntry.line
        ? `${baseUrl}${tokenEntry.file}#L${tokenEntry.line}`
        : undefined
    const classes = tokenToClasses[cssVar]
    const popover: string[] = [tokenEntry.description]
    if (classes?.length) popover.push('$classes')
    if (githubUrl) popover.push('$github')
    const kwEntry: Record<string, any> = {
      ...(githubUrl ? { github: githubUrl } : {}),
      popover,
    }
    if (classes?.length) {
      kwEntry.classes = classes.sort()
    }
    result[cssVar] = kwEntry
  }
  return result
}

// ============= PER-ADAPTER COMPONENT COLLECTORS =============

function collectComponents(componentsFile: string): Record<string, any> {
  const data = readJSON(componentsFile)
  const result: Record<string, any> = {}
  for (const name of Object.keys(data)) {
    result[name] = { link: `/components/${name}` }
  }
  return result
}

// ================ MAIN ================

function mergeInto(target: Record<string, any>, source: Record<string, any>) {
  for (const [key, value] of Object.entries(source)) {
    target[key] = target[key] ? { ...target[key], ...value } : value
  }
}

function sortRoot(value: Record<string, any>): Record<string, any> {
  const sorted: Record<string, any> = {}
  for (const key of Object.keys(value).sort()) sorted[key] = value[key]
  return sorted
}

function writeKeywords(dir: string, keywords: Record<string, any>): void {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    path.join(dir, 'keywords.json'),
    JSON.stringify(sortRoot(keywords), null, 2) + '\n'
  )
}

/**
 * Keywords built from one folder of the scraped tree (core/ or an adapter's):
 * composables, features, helpers, classes and tokens — everything except
 * components, which only exist per adapter.
 */
function collectShared(
  dir: string,
  classesBaseUrl: string
): { keywords: Record<string, any>; counts: Record<string, number> } {
  const keywords: Record<string, any> = {}
  const counts: Record<string, number> = {}

  const sections: [string, () => Record<string, any>][] = [
    [
      'composables',
      () => collectComposables(path.join(dir, 'composables.json')),
    ],
    ['features', () => collectFeatures(path.join(dir, 'features.json'))],
    ['helpers', () => collectHelpers(path.join(dir, 'helpers.json'))],
    [
      'classes',
      () => collectClasses(path.join(dir, 'classes.json'), classesBaseUrl),
    ],
    [
      'tokens',
      () =>
        collectTokens(
          path.join(dir, 'tokens.json'),
          path.join(dir, 'classes.json'),
          classesBaseUrl
        ),
    ],
  ]

  for (const [label, collect] of sections) {
    const entries = collect()
    counts[label] = Object.keys(entries).length
    mergeInto(keywords, entries)
  }

  return { keywords, counts }
}

/**
 * GitHub blob base for source links, from the adapter's `github` field.
 */
function sourceBaseUrl(adapterName: string): string {
  const github: string | undefined = adapters[adapterName]?.github
  return github ? `${github.replace(/\/$/, '')}/blob/main/` : ''
}

/**
 * Manual keywords from docs/config.json: root `keywords` apply to every output,
 * an adapter's `keywords` to its own — both win over generated entries key by
 * key.
 */
function applyManualKeywords(
  map: Record<string, any>,
  manual: Record<string, any> | undefined
): void {
  for (const [key, value] of Object.entries(manual ?? {})) {
    map[key] = { ...(map[key] ?? {}), ...(value as object) }
  }
}

function main() {
  // --- core/keywords.json (core data comes from the ui adapter's repo) ---
  const core = collectShared(
    path.join(SCRAPED_DIR, 'core'),
    sourceBaseUrl('ui')
  )
  applyManualKeywords(core.keywords, DOCS_CONFIG.keywords)
  writeKeywords(path.join(GENERATED_DIR, 'core'), core.keywords)

  const coreBreakdown = Object.entries(core.counts)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ')
  console.log(
    `core/keywords.json: ${Object.keys(core.keywords).length} total (${coreBreakdown})`
  )

  // --- Per-adapter keywords: the adapter folder's (already merged) data
  // plus its components ---
  for (const [adapterName] of Object.entries(adapters)) {
    const scrapedDir = path.join(SCRAPED_DIR, adapterName)

    const { keywords } = collectShared(scrapedDir, sourceBaseUrl(adapterName))
    mergeInto(
      keywords,
      collectComponents(path.join(scrapedDir, 'components.json'))
    )

    applyManualKeywords(keywords, DOCS_CONFIG.keywords)
    applyManualKeywords(keywords, adapters[adapterName]?.keywords)

    writeKeywords(path.join(GENERATED_DIR, adapterName), keywords)

    console.log(
      `${adapterName}/keywords.json: ${Object.keys(keywords).length} total`
    )
  }
}

try {
  main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
