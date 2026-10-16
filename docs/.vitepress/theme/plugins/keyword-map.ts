import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export type PopoverBlock = string | { type: string; content: string }

export interface KeywordEntry {
  link?: string
  github?: string
  tokens?: string[]
  classes?: string[]
  variants?: Record<string, KeywordEntry>
  popover?: PopoverBlock[]
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ADAPTER = process.env.VF_ADAPTER ?? 'ui'
// Adapter manifests are generated git-tracked into docs/src/_<adapter>/.
const GENERATED_DIR = path.resolve(__dirname, `../../../src/_${ADAPTER}`)

function readJSONSafe<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return fallback
  }
}

// The adapter's manifests already merge core with the adapter's own
// additions (adapter wins), so each is a single read.
const adapterTypes: string[] = readJSONSafe(
  path.join(GENERATED_DIR, 'types.json'),
  []
)

const keywordsFile = path.join(GENERATED_DIR, 'keywords.json')
if (!fs.existsSync(keywordsFile)) {
  console.warn(
    `[keywordMap] ${keywordsFile} not found — keyword links/popovers will be ` +
      'missing. Run `pnpm api` at the monorepo root, then `pnpm gen` in ' +
      'docs/ ("Regenerate JSON data") first.'
  )
}
const adapterKeywords: Record<string, KeywordEntry> = readJSONSafe(
  keywordsFile,
  {}
)

function buildKeywordMap(): Record<string, KeywordEntry> {
  const map: Record<string, KeywordEntry> = {}

  // Layer 1: Types -- each becomes { popover: ['$type'] }
  for (const name of adapterTypes) {
    map[name] = { popover: ['$type'] }
  }

  // Layer 2: Generated keywords (merge onto existing)
  for (const [key, value] of Object.entries(adapterKeywords)) {
    if (map[key]) {
      map[key] = { ...map[key], ...value }
    } else {
      map[key] = value
    }
  }

  return map
}

export const keywordMap: Record<string, KeywordEntry> = buildKeywordMap()
