import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { TokenJsonEntry } from '@vueform/utils'

import { requireData, SCRAPE_HINT } from './ensureData'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(SCRIPT_DIR, '..', '..')
const ROOT = path.resolve(DOCS_ROOT, '..')
const TOKENS_JSON = path.resolve(DOCS_ROOT, '../.vueform/api/core/tokens.json')
requireData('tokens', TOKENS_JSON, SCRAPE_HINT)
const TOKENS_GUIDE = path.join(DOCS_ROOT, 'src/guide/themes-tokens.md')

const PRIMITIVES_START = '<!-- @token-table:primitives start -->'
const PRIMITIVES_END = '<!-- @token-table:primitives end -->'
const SEMANTIC_START = '<!-- @token-table:semantic start -->'
const SEMANTIC_END = '<!-- @token-table:semantic end -->'

interface TokenGroup {
  name: string
  tokens: { cssVar: string; description: string }[]
}

function collectGroups(
  tokens: Record<string, TokenJsonEntry>,
  groupFilter: string
): TokenGroup[] {
  const groups: TokenGroup[] = []
  const groupMap = new Map<string, TokenGroup>()

  // tokens.json has alphabetic root key order; the guide keeps the source
  // declaration order, so sort back by position.
  const bySource = Object.entries(tokens).sort(
    ([, a], [, b]) =>
      (a.file ?? '').localeCompare(b.file ?? '') ||
      (a.line ?? 0) - (b.line ?? 0)
  )

  for (const [cssVar, entry] of bySource) {
    if (entry.group !== groupFilter) continue
    if (!entry.description) continue

    const subgroup = entry.subgroup ?? 'Other'

    if (!groupMap.has(subgroup)) {
      const group: TokenGroup = { name: subgroup, tokens: [] }
      groupMap.set(subgroup, group)
      groups.push(group)
    }

    groupMap
      .get(subgroup)!
      .tokens.push({ cssVar, description: entry.description })
  }

  return groups
}

function renderTable(groups: TokenGroup[]): string {
  const sections: string[] = ['<VPSubtabs>']

  for (const group of groups) {
    if (group.tokens.length === 0) continue

    sections.push(`<VPSubtab title="${group.name}">`)
    sections.push('')
    sections.push('| CSS Variable | Description |')
    sections.push('| --- | --- |')

    for (const token of group.tokens) {
      const anchorId = token.cssVar
      const cssVar = `<a id="${anchorId}"></a>\`${token.cssVar}\``
      sections.push(`| ${cssVar} | ${token.description} |`)
    }

    sections.push('')
    sections.push('</VPSubtab>')
  }

  sections.push('</VPSubtabs>')

  return sections.join('\n')
}

function replaceRegion(
  content: string,
  startMarker: string,
  endMarker: string,
  replacement: string
): string {
  const startIdx = content.indexOf(startMarker)
  const endIdx = content.indexOf(endMarker)

  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Could not find markers: ${startMarker} / ${endMarker}`)
  }

  const before = content.slice(0, startIdx + startMarker.length)
  const after = content.slice(endIdx)

  return before + '\n' + replacement + '\n' + after
}

function main(): void {
  const tokens: Record<string, TokenJsonEntry> = JSON.parse(
    fs.readFileSync(TOKENS_JSON, 'utf-8')
  )

  const primitiveGroups = collectGroups(tokens, 'primitives')
  const semanticGroups = collectGroups(tokens, 'semantic')

  const primitivesTable = renderTable(primitiveGroups)
  const semanticTable = renderTable(semanticGroups)

  let guide = fs.readFileSync(TOKENS_GUIDE, 'utf-8')

  guide = replaceRegion(
    guide,
    PRIMITIVES_START,
    PRIMITIVES_END,
    primitivesTable
  )
  guide = replaceRegion(guide, SEMANTIC_START, SEMANTIC_END, semanticTable)

  fs.writeFileSync(TOKENS_GUIDE, guide)

  console.log(
    `[tokens] Primitives: ${primitiveGroups.reduce((n, g) => n + g.tokens.length, 0)} tokens in ${primitiveGroups.length} groups`
  )
  console.log(
    `[tokens] Semantic: ${semanticGroups.reduce((n, g) => n + g.tokens.length, 0)} tokens in ${semanticGroups.length} groups`
  )
  console.log(`[tokens] Updated ${path.relative(ROOT, TOKENS_GUIDE)}`)
}

main()
