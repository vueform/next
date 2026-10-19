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
  'composables-reference',
  path.join(API_DIR, 'core', 'composables.json'),
  API_EXTRACTOR_HINT
)
const COMPOSABLES_DIR = path.join(DOCS_ROOT, 'src/api/composables')
const SIDEBAR_PATH = path.join(DOCS_ROOT, '.vitepress/sidebar.ts')

// ============== TEMPLATE ==============

const TEMPLATE = fs.readFileSync(
  path.join(COMPOSABLES_DIR, '_template.md'),
  'utf-8'
)

// =============== TYPES ================

interface ComposableEntry {
  type?: string
  description?: string
  private?: boolean
  params?: Record<string, ParamEntry>
  returns?: ReturnEntry
}

interface ParamEntry {
  type: string
  members?: Record<string, any>
  description?: string
  required?: boolean
  rest?: boolean
}

interface ReturnEntry {
  type?: string
  members?: Record<string, MemberEntry>
  from?: string
  overloads?: OverloadEntry[]
}

interface MemberEntry {
  type?: string
  members?: Record<string, MemberEntry>
  description?: string
  from?: string
  params?: Record<string, any>
  returns?: { type: string }
  overloads?: OverloadEntry[]
  private?: boolean
}

interface OverloadEntry {
  description?: string
  params?: Record<string, { type: string; description?: string }>
  returns?: { type: string }
}

// ============== HELPERS ===============

function regionRE(name: string): RegExp {
  return new RegExp(
    `<!-- #region ${name} -->[\\s\\S]*?<!-- #endregion ${name} -->`
  )
}

function buildRegion(name: string, content: string): string {
  return [
    `<!-- #region ${name} -->`,
    content,
    `<!-- #endregion ${name} -->`,
  ].join('\n')
}

function replaceRegion(content: string, name: string, value: string): string {
  const re = regionRE(name)
  if (!re.test(content)) return content
  const region = buildRegion(name, value)
  return content.replace(re, () => region)
}

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

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ========= FROM-REFERENCE RESOLVER =========

const jsonCache = new Map<string, Record<string, any>>()

function loadGeneratedJSON(file: string): Record<string, any> {
  if (!jsonCache.has(file)) {
    jsonCache.set(file, loadJSON(`${file}.json`))
  }
  return jsonCache.get(file)!
}

/**
 * Resolves a `from` reference like `helpers.defineEvents.on` to the actual
 * member data. The path format is `{file}.{entry}.{member}` where `file` maps
 * to `{file}.json`, `entry` is a top-level key, and `member` is looked up
 * inside `returns.members`.
 */
function resolveFrom(from: string): MemberEntry | null {
  const parts = from.split('.')

  // Paths may have 3+ segments; the first is the file, the second the entry,
  // and the rest drill into returns.members.
  if (parts.length < 3) return null

  const [file, entry, ...rest] = parts
  const data = loadGeneratedJSON(file)
  const topLevel = data[entry]
  if (!topLevel) return null

  let members: any =
    file === 'features' ? topLevel.returns : topLevel.returns?.members
  let target: any = null

  for (const key of rest) {
    target = members?.[key]
    if (!target) return null
    members = target.members
  }

  return target as MemberEntry
}

// ============ TYPE FORMATTING ============

function escPipe(s: string): string {
  return s.replace(/\|/g, '\\|')
}

function escTitle(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/"/g, "'")
}

function formatTableDesc(s: string): string {
  return escPipe(s).replace(/\n/g, '<br>')
}

function formatFunctionType(member: {
  params?: Record<string, { type: string }>
  returns?: { type: string }
}): string {
  const params = member.params
    ? Object.entries(member.params)
        .map(([name, p]) => `${name}: ${p.type}`)
        .join(', ')
    : ''

  const ret = member.returns?.type ?? 'void'
  return `(${params}) => ${ret}`
}

/**
 * Splits a type string on top-level union (`|`) separators, ignoring `|` nested
 * inside generics, parentheses, objects, or arrays. Handles `=>` so the `>` of
 * an arrow type is not mistaken for a closing generic bracket.
 */
function splitTopLevelUnion(typeStr: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''

  for (let i = 0; i < typeStr.length; i++) {
    const c = typeStr[i]
    const prev = typeStr[i - 1]

    if (c === '<' || c === '(' || c === '{' || c === '[') depth++
    else if (c === ')' || c === '}' || c === ']') depth--
    else if (c === '>' && prev !== '=') depth--

    if (c === '|' && depth === 0) {
      parts.push(current.trim())
      current = ''
    } else {
      current += c
    }
  }

  if (current.trim()) parts.push(current.trim())
  return parts.filter((p) => p.length > 0)
}

const MULTILINE_THRESHOLD = 60

/**
 * Whether angle brackets and parentheses are balanced in a type fragment, so a
 * greedy `Wrapper<...>` match isn't mistaken for a union like `A<x> | B<y>`.
 * `=>` is ignored so an arrow type's `>` doesn't count as a closing bracket.
 */
function isBalanced(s: string): boolean {
  let angle = 0
  let paren = 0
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    const prev = s[i - 1]
    if (c === '<') angle++
    else if (c === '>' && prev !== '=') angle--
    else if (c === '(') paren++
    else if (c === ')') paren--
    if (angle < 0 || paren < 0) return false
  }
  return angle === 0 && paren === 0
}

/**
 * Renders a union as multiline with leading `|`, optionally wrapped by a single
 * generic (e.g. `Ref<...>`) whose `<`/`>` stay on their own lines.
 */
function multilineUnion(
  members: string[],
  prefix: string,
  suffix: string
): string {
  const lines = members.map((m) => `  | ${m}`).join('&#10;')
  return prefix ? `${prefix}&#10;${lines}&#10;${suffix}` : `&#10;${lines}`
}

/**
 * Formats a type string for display in a popover, preserving the real type
 * (including any `Ref<...>` wrapper). Long union types — including unions
 * nested inside a single generic wrapper — are broken onto separate lines;
 * inline object literals are collapsed to `object` since their shape is
 * unwieldy.
 */
function formatTypeString(rawType: string): string {
  const type = rawType.trim()

  if (type.startsWith('{') && type.includes(';')) return 'object'

  // Detect a single generic wrapper (e.g. `Ref<...>`) so a long inner union can
  // be broken while keeping the wrapper.
  let prefix = ''
  let suffix = ''
  let body = type

  const wrapperMatch = type.match(/^([A-Za-z_][\w.]*)<([\s\S]+)>$/)
  if (wrapperMatch && isBalanced(wrapperMatch[2])) {
    prefix = `${wrapperMatch[1]}<`
    suffix = '>'
    body = wrapperMatch[2].trim()
  }

  const members = splitTopLevelUnion(body)
  if (members.length <= 1) return type

  const inline = `${prefix}${members.join(' | ')}${suffix}`
  if (inline.length <= MULTILINE_THRESHOLD) return inline

  return multilineUnion(members, prefix, suffix)
}

function formatOverloadedType(overloads: OverloadEntry[]): string {
  const sigs = overloads.map((ol) => {
    const params = ol.params
      ? Object.entries(ol.params)
          .map(([n, p]) => `${n}: ${p.type}`)
          .join(', ')
      : ''
    const ret = ol.returns?.type ?? 'void'
    return `  (${params}): ${ret}`
  })
  return `{&#10;${sigs.join('&#10;')}&#10;}`
}

function formatMemberType(member: MemberEntry): string {
  if (member.type === 'function') {
    if (Array.isArray(member.overloads) && member.overloads.length) {
      return formatOverloadedType(member.overloads)
    }
    return formatFunctionType(member as any)
  }
  if (typeof member.type === 'string') return formatTypeString(member.type)
  return 'object'
}

// ============ KNOWN TYPES =============

const knownTypes: Set<string> = (() => {
  const filePath = path.join(GENERATED_DIR, 'core', 'types.json')
  if (!fs.existsSync(filePath)) {
    console.warn(
      `[composables-reference] ${filePath} not found — type links will be ` +
        'skipped. Run `pnpm gen` → "Regenerate JSON data" → types.json first ' +
        'for full output.'
    )
    return new Set<string>()
  }
  const arr = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  return new Set<string>(Array.isArray(arr) ? arr : [])
})()

/**
 * Derives the options type name for a composable, e.g. `useAutosave` →
 * `UseAutosaveOptions`. Returns the name only if it exists in types.json.
 */
function getOptionsTypeName(composableName: string): string | null {
  const pascal =
    composableName.charAt(0).toUpperCase() + composableName.slice(1)
  const candidate = `${pascal}Options`
  return knownTypes.has(candidate) ? candidate : null
}

// ============ SECTION GENERATORS ============

function hasParams(params?: Record<string, ParamEntry>): boolean {
  return !!params && Object.keys(params).length > 0
}

function generateParamsTable(
  params: Record<string, ParamEntry>,
  composableName: string
): string {
  const lines: string[] = ['']
  lines.push('| Name | Description |')
  lines.push('| --- | --- |')

  for (const [name, param] of Object.entries(params)) {
    let typeStr: string

    if (param.members) {
      typeStr = getOptionsTypeName(composableName) ?? 'object'
    } else {
      typeStr = formatTypeString(param.type)
    }

    const displayName = param.required ? name : `${name}?`
    let desc = formatTableDesc(param.description || '')
    if (param.rest) desc = `**Rest.** ${desc}`

    lines.push(
      `| [\`${displayName}\`](!code#params.${name} "${escTitle(typeStr)}") | ${desc} |`
    )
  }

  lines.push('')
  return lines.join('\n')
}

function getOptionsMembers(entry: ComposableEntry): Record<string, any> | null {
  if (!entry.params) return null
  const entries = Object.entries(entry.params)
  if (entries.length === 1 && entries[0][1].members) {
    return entries[0][1].members as Record<string, any>
  }
  return null
}

function hasOptions(entry: ComposableEntry): boolean {
  return getOptionsMembers(entry) !== null
}

function generateOptionsTable(entry: ComposableEntry): string {
  const members = getOptionsMembers(entry)
  if (!members) return ''
  return generateMembersTable(members, 'options')
}

function hasReturnsTable(returns?: ReturnEntry): boolean {
  if (!returns) return false
  return (
    !!returns.members &&
    Object.entries(returns.members).some(([, m]) => !m.private)
  )
}

function generateReturnsTable(returns: ReturnEntry): string {
  const members = Object.entries(
    returns.members as Record<string, MemberEntry>
  ).filter(([, m]) => !m.private)

  const lines: string[] = ['']
  lines.push('| Name | Description |')
  lines.push('| --- | --- |')

  for (const [name, rawMember] of members) {
    const member =
      rawMember.from && !rawMember.type
        ? (resolveFrom(rawMember.from) ?? rawMember)
        : rawMember

    const typeStr = formatMemberType(member)
    const isMethod = member.type === 'function'
    const displayName = isMethod ? `${name}()` : name
    const desc = formatTableDesc(member.description || '')

    lines.push(
      `| [\`${displayName}\`](!code#returns.${name} "${escTitle(typeStr)}") | ${desc} |`
    )
  }

  lines.push('')
  return lines.join('\n')
}

function generateMembersTable(
  members: Record<string, any>,
  anchor: string
): string {
  const lines: string[] = ['']
  lines.push('| Name | Description |')
  lines.push('| --- | --- |')

  const sorted = Object.entries(members)
    .filter(([, m]) => !m.private)
    .sort(([, a], [, b]) => {
      const aReq = a.required ? 0 : 1
      const bReq = b.required ? 0 : 1
      return aReq - bReq
    })

  for (const [name, rawMember] of sorted) {
    const member =
      rawMember.from && !rawMember.type
        ? (resolveFrom(rawMember.from) ?? rawMember)
        : rawMember

    const typeStr = formatMemberType(member as MemberEntry)

    const isRequired = rawMember.required ?? member.required
    const displayName = isRequired ? name : `${name}?`
    let desc = formatTableDesc(
      member.description || rawMember.description || ''
    )
    if (rawMember.rest ?? member.rest) desc = `**Rest.** ${desc}`

    lines.push(
      `| [\`${displayName}\`](!code#${anchor}.${name} "${escTitle(typeStr)}") | ${desc} |`
    )
  }

  lines.push('')
  return lines.join('\n')
}

// ============ EVENT EXTRACTION ============

const EVENT_MEMBERS = new Set([
  'fire',
  'fireAsync',
  'on',
  'off',
  'onBefore',
  'onAfter',
])

interface ExtractedEvent {
  name: string
  description: string
  params: Record<string, { type: string; description?: string }>
}

const FIRE_LIKE = new Set(['fire', 'fireAsync'])

/**
 * Parses a function type string like `(path: string, context$: any) => any` and
 * returns the parameter list as name→type entries.
 */
function parseCallbackParams(cbType: string): Record<string, { type: string }> {
  const match = cbType.match(/^\(([^)]*)\)\s*=>/)
  if (!match) return {}

  const inner = match[1].trim()
  if (!inner) return {}

  const result: Record<string, { type: string }> = {}
  let depth = 0
  let current = ''
  const segments: string[] = []

  for (const ch of inner) {
    if (ch === '<' || ch === '(' || ch === '{' || ch === '[') depth++
    else if (ch === '>' || ch === ')' || ch === '}' || ch === ']') depth--
    if (ch === ',' && depth === 0) {
      segments.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) segments.push(current.trim())

  for (const seg of segments) {
    const colonIdx = seg.indexOf(':')
    if (colonIdx === -1) continue
    const name = seg.slice(0, colonIdx).replace('?', '').trim()
    const type = seg.slice(colonIdx + 1).trim()
    if (name && type) result[name] = { type }
  }

  return result
}

/**
 * Extracts typed events from event-carrying members (fire, fireAsync, on, off,
 * onBefore, onAfter) within an object of members. For fire/fireAsync, event
 * args are the params after `e`. For on/off/onBefore/onAfter, args are parsed
 * from the callback's function signature. Generic signatures (e.g. `e: any`)
 * are skipped.
 */
function extractEventsFromMembers(
  members: Record<string, any>
): ExtractedEvent[] {
  const seen = new Map<string, ExtractedEvent>()

  for (const [memberName, member] of Object.entries(members)) {
    if (!EVENT_MEMBERS.has(memberName)) continue
    if (member.type !== 'function') continue

    const isFire = FIRE_LIKE.has(memberName)

    const sources: Array<{
      params?: Record<string, { type: string; description?: string }>
      description?: string
    }> = []

    if (Array.isArray(member.overloads) && member.overloads.length) {
      sources.push(...member.overloads)
    } else if (member.params) {
      sources.push(member)
    }

    for (const source of sources) {
      if (!source.params) continue
      const eParam = source.params.e ?? source.params.event
      if (!eParam) continue

      const eType = eParam.type?.trim()
      if (!eType) continue

      const nameMatch = eType.match(/^["'](.+)["']$/)
      if (!nameMatch) continue

      const eventName = nameMatch[1]
      if (seen.has(eventName)) continue

      let eventParams: Record<string, { type: string; description?: string }> =
        {}

      if (isFire) {
        for (const [pName, pData] of Object.entries(source.params)) {
          if (pName === 'e' || pName === 'event') continue
          eventParams[pName] = pData as { type: string; description?: string }
        }
      } else {
        const cbParam = source.params.callback
        if (cbParam?.type) {
          eventParams = parseCallbackParams(cbParam.type)
        }
      }

      seen.set(eventName, {
        name: eventName,
        description: source.description || '',
        params: eventParams,
      })
    }
  }

  return [...seen.values()]
}

/**
 * Collects events from the composable's returns (its own defineEvents-powered
 * fire/on/off members).
 */
function getOwnEvents(entry: ComposableEntry): ExtractedEvent[] {
  if (!entry.returns?.members) return []
  return extractEventsFromMembers(entry.returns.members as Record<string, any>)
}

function generateEventsTable(events: ExtractedEvent[]): string {
  if (events.length === 0) return ''

  const lines: string[] = ['']
  lines.push('| Name | Params | Description |')
  lines.push('| --- | --- | --- |')

  for (const event of events) {
    const paramEntries = Object.entries(event.params)
    let paramStr = '—'

    if (paramEntries.length > 0) {
      paramStr = paramEntries
        .map(([pName, pData]) => {
          const type = pData.type || 'any'
          return `[\`${pName}\`](!code#events.${event.name}.${pName} "${escTitle(type)}")`
        })
        .join(', ')
    }

    const desc = formatTableDesc(event.description || '')
    lines.push(`| \`${event.name}\` | ${paramStr} | ${desc} |`)
  }

  lines.push('')
  return lines.join('\n')
}

// ============ SECTION REMOVAL ============

function sectionRE(heading: string, region: string): RegExp {
  return new RegExp(
    `\\n## ${escapeRe(heading)}\\n[\\s\\S]*?<!-- #endregion ${region} -->`
  )
}

function removeSection(
  content: string,
  heading: string,
  region: string
): string {
  return content.replace(sectionRE(heading, region), '')
}

// ============ PAGE GENERATION ============

function buildPage(
  page: string,
  entry: ComposableEntry,
  composableName: string
): string {
  page = replaceRegion(page, 'description', entry.description ?? '')

  // Params — raw args as-is
  if (hasParams(entry.params)) {
    page = replaceRegion(
      page,
      'params',
      generateParamsTable(entry.params!, composableName)
    )
  } else {
    page = removeSection(page, 'Params', 'params')
  }

  // Options — expanded first-arg object
  if (hasOptions(entry)) {
    page = replaceRegion(page, 'options', generateOptionsTable(entry))
  } else {
    page = removeSection(page, 'Options', 'options')
  }

  // Returns
  if (hasReturnsTable(entry.returns)) {
    page = replaceRegion(page, 'api', generateReturnsTable(entry.returns!))
  } else {
    page = removeSection(page, 'Returns', 'api')
  }

  // Events — from the composable's own returns (defineEvents)
  const ownEvents = getOwnEvents(entry)
  if (ownEvents.length > 0) {
    page = replaceRegion(page, 'events', generateEventsTable(ownEvents))
  } else {
    page = removeSection(page, 'Events', 'events')
  }

  return page
}

function cleanupBlanks(content: string): string {
  return content.replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '\n')
}

function scaffoldPage(name: string, entry: ComposableEntry): string {
  return cleanupBlanks(
    buildPage(TEMPLATE.replaceAll('composableName', name), entry, name)
  )
}

function updatePage(
  content: string,
  name: string,
  entry: ComposableEntry
): string {
  return cleanupBlanks(buildPage(content, entry, name))
}

// ============ SIDEBAR CONFIG ============

function serializeItems(names: string[], indent: string): string {
  return names
    .map((n) => `${indent}{ text: '${n}', link: '/api/composables/${n}' },`)
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

// ================ MAIN ================

function main() {
  fs.mkdirSync(COMPOSABLES_DIR, { recursive: true })

  const composables = loadJSON<ComposableEntry>('composables.json')

  const expected = new Map<string, ComposableEntry>()

  for (const [name, entry] of Object.entries(composables)) {
    if (entry.private) continue
    expected.set(name, entry)
  }

  // 1. Remove stale files
  const existing = fs
    .readdirSync(COMPOSABLES_DIR)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => f.replace(/\.md$/, ''))

  let created = 0
  let updated = 0
  let removed = 0
  let unchanged = 0

  for (const name of existing) {
    if (!expected.has(name)) {
      fs.unlinkSync(path.join(COMPOSABLES_DIR, `${name}.md`))
      removed++
    }
  }

  // 2. Create new / update existing
  for (const [name, entry] of expected) {
    const filePath = path.join(COMPOSABLES_DIR, `${name}.md`)

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const newContent = updatePage(content, name, entry)

      if (newContent === content) {
        unchanged++
      } else {
        fs.writeFileSync(filePath, newContent)
        updated++
      }
    } else {
      fs.writeFileSync(filePath, scaffoldPage(name, entry))
      created++
    }
  }

  // 3. Patch the shared sidebar config. It is used by every adapter build,
  // so only core composables go in; an adapter-only composable needs an
  // `/api` sidebar section in that adapter's own config instead.
  const names = [...expected.keys()].sort()

  const sidebarSrc = fs.readFileSync(SIDEBAR_PATH, 'utf-8')
  fs.writeFileSync(
    SIDEBAR_PATH,
    patchConfigRegion(
      sidebarSrc,
      'composables',
      serializeItems(names, '        ')
    )
  )

  console.log(
    `composables-reference: ${created} created, ${updated} updated, ${removed} removed, ${unchanged} unchanged`
  )
}

main()
