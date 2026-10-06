import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import { nonCoreAdapters } from '../lib/adapters'
import { generatedDir, monorepoRoot } from '../lib/paths'
import { parseScope } from '../lib/scope'

const { scope } = parseScope(process.argv.slice(2))
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const ROOT = monorepoRoot
const SCSS_DIR = path.join(ROOT, 'packages/core/src/scss')
const GENERATED_DIR = generatedDir

interface ModifierEntry {
  description: string
  file: string
  line: number
  tokens?: string[]
}

interface ClassEntry {
  description: string
  file?: string
  line?: number
  tokens?: string[]
  modifiers?: Record<string, ModifierEntry>
}

/**
 * Extracts the class name from a selector line following a docblock. E.g.
 * ".vf-addon {" → "vf-addon" "a.vf-btn, button.vf-btn {" → "vf-btn"
 * ".vf-element-label::after {" → "vf-element-label"
 */
function extractClassFromSelector(selectorLine: string): string | null {
  const trimmed = selectorLine.trim()
  const match = trimmed.match(/\.(vf-[\w-]+)/)
  return match ? match[1] : null
}

/**
 * Parses a multi-line root doc block (/** ... *​/) and returns description and
 * an optional @class override name.
 */
function parseRootDocBlock(block: string): {
  name: string | null
  description: string
} | null {
  const lines = block
    .replace(/^\/\*\*/, '')
    .replace(/\*\/$/, '')
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, ''))

  let className: string | null = null
  const descParts: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const classTag = trimmed.match(/^@class\s+\.([\w-]+)/)
    if (classTag) {
      className = classTag[1]
      continue
    }

    if (trimmed.startsWith('@')) continue

    descParts.push(trimmed)
  }

  if (descParts.length === 0 && !className) return null

  return {
    name: className,
    description: descParts.join(' '),
  }
}

/**
 * Extracts a single-line doc comment description. E.g. "/** Makes the button
 * full-width. *​/" → "Makes the button full-width."
 */
function parseInlineDoc(comment: string): string {
  return comment
    .replace(/^\/\*\*\s*/, '')
    .replace(/\s*\*\/$/, '')
    .trim()
}

/**
 * Extracts the modifier class name from a selector line. E.g. " &.vf-fluid {" →
 * "vf-fluid" ".vf-btn-icon-add:after {" → "vf-btn-icon-add"
 * ".vf-btn[class*='vf-btn-icon-'].vf-sm {" → "vf-sm"
 */
function extractModifierName(selectorLine: string): string | null {
  const trimmed = selectorLine.trim()

  // &.vf-xxx pattern (nested modifier)
  const nestedMatch = trimmed.match(/^&\.(vf-[\w-]+)/)
  if (nestedMatch) return nestedMatch[1]

  // Suffix .vf-xxx before { or :pseudo (e.g. .vf-btn[...].vf-sm {)
  const suffixMatch = trimmed.match(/\.(vf-[\w-]+)\s*[{:]/)
  if (suffixMatch) {
    // Find the *last* .vf-xxx match to handle compound selectors
    const allMatches = [...trimmed.matchAll(/\.(vf-[\w-]+)/g)]
    if (allMatches.length > 1) return allMatches[allMatches.length - 1][1]
  }

  // .vf-xxx at the start (top-level modifier like .vf-btn-icon-add:after)
  const topMatch = trimmed.match(/^\.(vf-[\w-]+)/)
  if (topMatch) return topMatch[1]

  return null
}

/**
 * Removes block (`/* *​/`) and line (`//`) comments from SCSS source.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}

/**
 * Resolves which documented class(es) a selector's vars should be attributed
 * to. Uses the subject (rightmost compound) class, falling back to the first
 * documented class in the selector when the subject is a bare element.
 */
function selectorTargetClasses(
  selector: string,
  documented: Set<string>
): string[] {
  // Split into compounds, treating combinators outside parentheses as separators.
  const compounds: string[] = []
  let buf = ''
  let depth = 0
  for (const ch of selector) {
    if (ch === '(') depth++
    else if (ch === ')') depth--

    if (depth === 0 && /[\s>+~]/.test(ch)) {
      if (buf.trim()) compounds.push(buf.trim())
      buf = ''
      continue
    }
    buf += ch
  }
  if (buf.trim()) compounds.push(buf.trim())
  if (compounds.length === 0) return []

  // Subject = rightmost compound, with parenthesised conditions removed.
  const subject = compounds[compounds.length - 1].replace(/\([^)]*\)/g, '')
  const subjectClasses = [...subject.matchAll(/\.(vf-[\w-]+)/g)]
    .map((m) => m[1])
    .filter((c) => documented.has(c))
  // For compound subjects like `.vf-element.vf-space-top-1` (base.modifier),
  // attribute only to the modifier (last class), so base classes don't absorb
  // tokens that belong to their separately documented modifiers.
  if (subjectClasses.length > 0) {
    return [subjectClasses[subjectClasses.length - 1]]
  }

  // Fallback: first documented class anywhere in the selector.
  const selNoParens = selector.replace(/\([^)]*\)/g, '')
  for (const m of selNoParens.matchAll(/\.(vf-[\w-]+)/g)) {
    if (documented.has(m[1])) return [m[1]]
  }
  return []
}

/**
 * Collects the CSS custom properties consumed (via `var(--vf-…)`) by each
 * documented class. Top-level rule blocks are attributed to their subject, and
 * nested `&.vf-xxx` blocks within are attributed to the modifier class if it's
 * in the documented set.
 */
function collectCssVars(
  source: string,
  documented: Set<string>
): Record<string, Set<string>> {
  const clean = stripComments(source)
  const result: Record<string, Set<string>> = {}
  for (const c of documented) result[c] = new Set()

  const n = clean.length
  let i = 0
  let selStart = 0

  while (i < n) {
    if (clean[i] === '{') {
      const selector = clean.slice(selStart, i).trim()

      // Find the matching closing brace for this top-level block.
      let depth = 1
      let j = i + 1
      while (j < n && depth > 0) {
        if (clean[j] === '{') depth++
        else if (clean[j] === '}') depth--
        j++
      }

      const body = clean.slice(i + 1, j - 1)
      const targets = selectorTargetClasses(selector, documented)

      if (targets.length > 0) {
        // Split body into direct declarations and nested blocks.
        const { direct, nested } = splitBodyContent(body, documented)

        // Direct vars → parent class
        const directVars = [...direct.matchAll(/var\(\s*(--vf-[\w-]+)/g)].map(
          (m) => m[1]
        )
        for (const t of targets) {
          for (const v of directVars) result[t].add(v)
        }

        // Nested blocks → modifier if documented, otherwise parent
        for (const block of nested) {
          const nestedVars = [
            ...block.body.matchAll(/var\(\s*(--vf-[\w-]+)/g),
          ].map((m) => m[1])
          if (block.target) {
            for (const v of nestedVars) result[block.target].add(v)
          } else {
            for (const t of targets) {
              for (const v of nestedVars) result[t].add(v)
            }
          }
        }
      }

      i = j
      selStart = j
    } else {
      i++
    }
  }

  return result
}

/**
 * Splits a block body into direct declarations (no nesting) and nested
 * sub-blocks. Each nested block is tagged with its modifier target if the
 * selector contains a documented class.
 */
function splitBodyContent(
  body: string,
  documented: Set<string>
): { direct: string; nested: { target: string | null; body: string }[] } {
  const nested: { target: string | null; body: string }[] = []
  let direct = ''
  let i = 0
  let lastBlockEnd = 0
  const n = body.length

  while (i < n) {
    if (body[i] === '{') {
      // Selector is everything from lastBlockEnd to here
      const nestedSelector = body.slice(lastBlockEnd, i).trim()

      // Add the non-selector direct content (before this selector started)
      // Find where the selector begins by looking for last semicolon or brace before it
      const preSelector = body.slice(lastBlockEnd, i)
      const lastSemi = preSelector.lastIndexOf(';')
      const lastClose = preSelector.lastIndexOf('}')
      const directEnd = Math.max(lastSemi, lastClose)
      if (directEnd >= 0) {
        direct += preSelector.slice(0, directEnd + 1)
      }

      // Find matching close
      let depth = 1
      let j = i + 1
      while (j < n && depth > 0) {
        if (body[j] === '{') depth++
        else if (body[j] === '}') depth--
        j++
      }

      const nestedBody = body.slice(i + 1, j - 1)

      // Determine if this nested selector targets a documented modifier
      let target: string | null = null
      if (nestedSelector.includes('&')) {
        const classes = [...nestedSelector.matchAll(/\.(vf-[\w-]+)/g)].map(
          (m) => m[1]
        )
        const lastDocumented = classes.filter((c) => documented.has(c)).pop()
        if (lastDocumented) target = lastDocumented
      }

      nested.push({ target, body: nestedBody })
      i = j
      lastBlockEnd = j
    } else {
      i++
    }
  }

  // Remaining content after last nested block
  direct += body.slice(lastBlockEnd)

  return { direct, nested }
}

/**
 * Parses a single SCSS file and returns all documented class entries.
 */
function parseFile(filePath: string): Record<string, ClassEntry> {
  const source = fs.readFileSync(filePath, 'utf-8')
  const relPath = path.relative(ROOT, filePath)
  const entries: Record<string, ClassEntry> = {}

  const lines = source.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Look for multi-line root doc blocks
    if (line.match(/^\s*\/\*\*/) && !line.match(/\*\/\s*$/)) {
      const blockStart = i
      while (i < lines.length && !lines[i].includes('*/')) i++
      const blockEnd = i
      const block = lines.slice(blockStart, blockEnd + 1).join('\n')
      const parsed = parseRootDocBlock(block)

      if (parsed) {
        // Resolve class name: @class tag or extract from the next selector line
        let className = parsed.name
        if (!className) {
          let j = blockEnd + 1
          while (j < lines.length && lines[j].trim() === '') j++
          if (j < lines.length) {
            className = extractClassFromSelector(lines[j])
          }
        }

        if (className) {
          const entry: ClassEntry = {
            description: parsed.description,
            file: relPath,
            line: blockStart + 1,
            modifiers: {},
          }

          // Now scan the body for inline /** ... */ comments above modifiers
          i++
          const modifiers = scanModifiers(lines, i, relPath)
          Object.assign(entry.modifiers!, modifiers)

          entries[className] = entry
        }
      }

      i++
      continue
    }

    i++
  }

  // Collect CSS vars consumed by each documented class in this file.
  // Include modifier class names so they get their own var attribution.
  const documented = new Set(Object.keys(entries))
  for (const entry of Object.values(entries)) {
    for (const modName of Object.keys(entry.modifiers ?? {})) {
      documented.add(modName)
    }
  }
  const varsByClass = collectCssVars(source, documented)
  for (const entry of Object.values(entries)) {
    for (const modName of Object.keys(entry.modifiers ?? {})) {
      const modTokens = [...(varsByClass[modName] || [])].sort()
      if (modTokens.length) entry.modifiers![modName].tokens = modTokens
    }
  }
  for (const [name, entry] of Object.entries(entries)) {
    const tokens = [...(varsByClass[name] || [])].sort()
    if (tokens.length) entry.tokens = tokens
    if (!Object.keys(entry.modifiers ?? {}).length) delete entry.modifiers
  }

  return entries
}

/**
 * Starting from a position after a root doc block, scans for inline doc
 * comments (single-line /** ... *​/) followed by modifier selectors. Stops at
 * the next root doc block.
 */
function scanModifiers(
  lines: string[],
  startIdx: number,
  relPath: string
): Record<string, ModifierEntry> {
  const modifiers: Record<string, ModifierEntry> = {}
  let i = startIdx

  while (i < lines.length) {
    const line = lines[i]

    // Stop if we hit another root doc block (multi-line /** starting at col 0)
    if (line.match(/^\/\*\*/) && !line.match(/\*\/\s*$/)) break

    // Single-line inline doc: /** ... */
    if (line.match(/^\s*\/\*\*.*\*\/\s*$/)) {
      const desc = parseInlineDoc(line.trim())
      const docLine = i + 1 // 1-based

      // Look at the next non-empty line(s) for the modifier selector
      let j = i + 1
      while (j < lines.length && lines[j].trim() === '') j++

      if (j < lines.length) {
        const nextLine = lines[j]
        const modName = extractModifierName(nextLine)
        if (modName && desc) {
          modifiers[modName] = {
            description: desc,
            file: relPath,
            line: docLine,
          }
        }
      }
    }

    i++
  }

  return modifiers
}

function collectScssFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []

  const results: string[] = []

  function walk(current: string) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.name.endsWith('.scss')) {
        results.push(full)
      }
    }
  }

  walk(dir)
  return results.sort()
}

function parseDirectory(dir: string): Record<string, ClassEntry> {
  const files = collectScssFiles(dir)
  const result: Record<string, ClassEntry> = {}

  for (const file of files) {
    const entries = parseFile(file)
    for (const [name, entry] of Object.entries(entries)) {
      result[name] = entry
    }
  }

  return result
}

const VIRTUAL_CLASSES_FILE = path.join(
  SCRIPT_DIR,
  '..',
  'data',
  'virtual-classes.json'
)

function main(): void {
  // Core (ui) adapter
  const coreResult = parseDirectory(SCSS_DIR)

  const virtualClasses: Record<string, string> = JSON.parse(
    fs.readFileSync(VIRTUAL_CLASSES_FILE, 'utf-8')
  )

  for (const [name, description] of Object.entries(virtualClasses)) {
    if (!coreResult[name]) {
      coreResult[name] = {
        description,
      }
    }
  }

  if (scope.core) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true })
    fs.writeFileSync(
      path.join(GENERATED_DIR, 'classes.json'),
      JSON.stringify(coreResult, null, 2)
    )
  }

  console.log(
    `[classes] Generated classes.json with ${Object.keys(coreResult).length} entries`
  )

  // Other adapters
  for (const [adapterName, adapterDef] of nonCoreAdapters) {
    if (!scope.adapters.includes(adapterName)) continue
    const adapterSrcDir = path.join(ROOT, adapterDef.path, 'src')
    if (!fs.existsSync(adapterSrcDir)) continue

    const adapterResult = parseDirectory(adapterSrcDir)
    if (Object.keys(adapterResult).length === 0) continue

    const adapterDir = path.join(GENERATED_DIR, `_${adapterName}`)
    fs.mkdirSync(adapterDir, { recursive: true })
    fs.writeFileSync(
      path.join(adapterDir, 'classes.json'),
      JSON.stringify(adapterResult, null, 2)
    )

    console.log(
      `[classes] ${adapterName}: ${Object.keys(adapterResult).length} entries`
    )
  }
}

main()
