import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { ScenarioResult, SizeResults as Results } from '@vueform/utils'

/**
 * Fills the generated parts of each rule reference page (`src/rules/<rule>.md`)
 * from two sources, matching pages to rules by filename:
 *
 * - **Category, parameters, and related rules** come from the rule's own
 *   docblock in `packages/core/src/rules/<rule>.ts` (`@category`, `@param`,
 *   `@related` tags). Category and related rules are written into the meta
 *   table's `<!-- @rule:category -->` / `<!-- @rule:related -->` inline
 *   markers, parameters into the `<!-- @rule:params start/end -->` region —
 *   a page without the matching markers fails the run.
 * - **Bundle size** comes from the core package's size suite results
 *   (`packages/core/size.json`, see `pnpm size --core`): the gzipped delta
 *   of the `rule+<name>` scenario against its base, the same way the
 *   code-splitting guide's per-rule table is filled. The value is written
 *   between the page's `<!-- @size:rule -->` / `<!-- /@size -->` markers.
 */

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(SCRIPT_DIR, '..', '..')
const ROOT = path.resolve(DOCS_ROOT, '..')
const PAGES_DIR = path.join(DOCS_ROOT, 'src', 'rules')
const RULES_SRC = path.join(ROOT, 'packages', 'core', 'src', 'rules')

// ---------------------------------------------------------------------------
// Rule docblocks
// ---------------------------------------------------------------------------

interface RuleMeta {
  category: string
  params: [name: string, description: string][]
  related: string[]
}

/**
 * Parses the `@category` / `@param` / `@related` tags out of the docblock
 * directly above a rule's `createRule` export. Tag descriptions may wrap:
 * continuation lines are joined with a space.
 */
function parseRuleMeta(name: string): RuleMeta {
  const file = path.join(RULES_SRC, `${name}.ts`)

  if (!fs.existsSync(file)) {
    throw new Error(`src/rules/${name}.md has no ${path.relative(ROOT, file)}`)
  }

  const source = fs.readFileSync(file, 'utf-8')
  const exportMatch = source.match(/^export const \w+ = createRule\(/m)
  const before =
    exportMatch?.index !== undefined ? source.slice(0, exportMatch.index) : ''
  const open = before.lastIndexOf('/**')
  const close = before.lastIndexOf('*/')

  if (
    !exportMatch ||
    open === -1 ||
    close < open ||
    before.slice(close + 2).trim()
  ) {
    throw new Error(`No docblock above the createRule export in ${name}.ts`)
  }

  const lines = before
    .slice(open + '/**'.length, close)
    .split('\n')
    .map((line) => line.replace(/^\s*\*( |$)/, ''))

  // Tag name → its collected lines (continuations joined below).
  const tags: [tag: string, text: string][] = []

  for (const line of lines) {
    const tag = line.match(/^@([\w-]+)\s*(.*)$/)
    if (tag) {
      tags.push([tag[1], tag[2]])
    } else if (tags.length && line.trim()) {
      tags[tags.length - 1][1] += ` ${line.trim()}`
    }
  }

  const meta: RuleMeta = { category: '', params: [], related: [] }

  for (const [tag, text] of tags) {
    if (tag === 'category') {
      meta.category = text.trim()
    } else if (tag === 'param') {
      const [, param, description] = text.match(/^(\S+)\s+([\s\S]*)$/) ?? []
      if (!param) throw new Error(`Malformed @param in ${name}.ts: "${text}"`)
      meta.params.push([param, description.trim()])
    } else if (tag === 'related') {
      meta.related = text.split(',').map((item) => item.trim())
    }
  }

  if (!meta.category) {
    throw new Error(`No @category tag on the ${name} rule's docblock`)
  }

  return meta
}

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

/**
 * The effective size of a scenario: CSS counts only when the scenario
 * registers the theme module — without it the CSS is not functional.
 */
function pick(result: ScenarioResult): number {
  return (result.themed ? result.total : result.js).gzip
}

/**
 * Per-rule gzipped deltas (`size(base + rule) − size(base)`) from the core
 * size suite results.
 */
function ruleSizes(): Map<string, number> {
  const file = path.join(ROOT, 'packages', 'core', 'size.json')

  if (!fs.existsSync(file)) {
    throw new Error(
      'packages/core has no size.json — run `pnpm size --core` at the repo root first'
    )
  }

  const { scenarios } = JSON.parse(fs.readFileSync(file, 'utf-8')) as Results
  const sizes = new Map<string, number>()

  for (const [name, result] of Object.entries(scenarios)) {
    if (result.group !== 'rule') continue
    const base = scenarios[result.base ?? 'core']
    if (!base) continue
    sizes.set(result.item ?? name, pick(result) - pick(base))
  }

  return sizes
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Replaces the value between an inline `<!-- @<key> -->` / `<!-- /@<close> -->`
 * marker pair.
 */
function updateInline(
  content: string,
  key: string,
  closeKey: string,
  value: string,
  page: string
): string {
  const close = `<!-- /@${closeKey} -->`
  const open = `<!-- @${key} -->`
  const pattern = new RegExp(
    `(${escapeRegExp(open)})[\\s\\S]*?(${escapeRegExp(close)})`
  )

  if (!pattern.test(content)) {
    throw new Error(`${page} has no ${open} marker`)
  }

  return content.replace(pattern, `$1${value}$2`)
}

/**
 * Replaces the content between `<!-- @<key> start -->` / `<!-- @<key> end -->`
 * region markers. An empty body leaves just the adjacent marker lines; a
 * non-empty one is padded with blank lines so the markdown inside renders.
 */
function updateRegion(
  content: string,
  key: string,
  body: string,
  page: string
): string {
  const start = `<!-- @${key} start -->`
  const end = `<!-- @${key} end -->`
  const startIdx = content.indexOf(start)
  const endIdx = content.indexOf(end)

  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    if (!body) return content
    throw new Error(`${page} has no ${start} / ${end} markers`)
  }

  const inner = body ? `\n\n${body}\n\n` : '\n'

  return (
    content.slice(0, startIdx + start.length) + inner + content.slice(endIdx)
  )
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function categoryLink(category: string): string {
  const anchor = category.toLowerCase().replace(/\s+/g, '-')
  return `[${category}](/rules/#${anchor})`
}

function paramsTable(params: RuleMeta['params']): string {
  const rows = params.map(([name, desc]) => `| \`${name}\` | ${desc} |`)
  return [
    '## Parameters',
    '',
    '| Parameter | Description |',
    '| --- | --- |',
    ...rows,
  ].join('\n')
}

function relatedLinks(related: string[]): string {
  if (!related.length) return '—'
  return related.map((name) => `[${name}](/rules/${name})`).join(' · ')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const sizes = ruleSizes()
  const pages = fs
    .readdirSync(PAGES_DIR)
    .filter((entry) => entry.endsWith('.md') && entry !== 'index.md')
    .sort()

  const documented = new Set(pages.map((page) => page.slice(0, -'.md'.length)))

  for (const entry of fs.readdirSync(RULES_SRC)) {
    const name = entry.replace(/\.ts$/, '')
    if (
      entry.endsWith('.ts') &&
      entry !== 'index.ts' &&
      !documented.has(name)
    ) {
      console.warn(`[rules] no src/rules/${name}.md page for the ${name} rule`)
    }
  }

  let updated = 0

  for (const entry of pages) {
    const name = entry.slice(0, -'.md'.length)
    const page = `src/rules/${entry}`
    const meta = parseRuleMeta(name)
    const bytes = sizes.get(name)

    if (bytes === undefined) {
      throw new Error(
        `No measured "rule+${name}" scenario in packages/core/size.json for ${page}`
      )
    }

    const file = path.join(PAGES_DIR, entry)
    const content = fs.readFileSync(file, 'utf-8')

    let next = updateInline(content, 'size:rule', 'size', `${bytes} B`, page)
    next = updateInline(
      next,
      'rule:category',
      'rule:category',
      categoryLink(meta.category),
      page
    )
    next = updateInline(
      next,
      'rule:related',
      'rule:related',
      relatedLinks(meta.related),
      page
    )
    next = updateRegion(
      next,
      'rule:params',
      meta.params.length ? paramsTable(meta.params) : '',
      page
    )

    if (next !== content) {
      fs.writeFileSync(file, next)
      updated++
    }
  }

  console.log(
    `[rules] ${updated} of ${pages.length} rule pages updated from rule docblocks and packages/core's size.json`
  )
}

main()
