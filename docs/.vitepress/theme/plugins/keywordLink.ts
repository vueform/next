import { keywordMap, type KeywordEntry, type PopoverBlock } from './keywordMap'
import type { Element, ElementContent } from 'hast'
import type { ShikiTransformer } from 'shiki'

const UNLINK_RE = /\/\/\s*\[!code\s+unlink:([^\]]+)\]/
const LINK_RE = /\/\/\s*\[!code\s+link:([^\]]+)\]/

// For dot-keywords like `.vf-element`, also register the bare form so that
// `vf-element` inside `class="..."` attribute values gets linked too.
const bareClassAliases: Record<string, KeywordEntry> = {}
for (const [k, v] of Object.entries(keywordMap)) {
  if (k.startsWith('.')) {
    const bare = k.slice(1)
    if (!keywordMap[bare]) bareClassAliases[bare] = v
  }
}
const extendedMap: Record<string, KeywordEntry> = {
  ...keywordMap,
  ...bareClassAliases,
}

const sortedKeywords = Object.keys(extendedMap).sort(
  (a, b) => b.length - a.length
)

const wordKeywords = sortedKeywords.filter((k) => /^\w/.test(k))
// Class keywords start with `.` — they must also match in compound selectors
// like `.vf-input.vf-disabled`, where the second class is preceded by a word
// char, so they do not get the `NOT_AFTER_IDENT` boundary.
const dotKeywords = sortedKeywords.filter((k) => k.startsWith('.'))
const otherNonWordKeywords = sortedKeywords.filter(
  (k) => /^\W/.test(k) && !k.startsWith('.')
)

// `$` is an identifier character in JS/TS, but not a `\w` character, so `\b`
// alone would let `http` match inside `$http` and `model` inside `model$`.
// Every keyword boundary therefore also refuses an adjacent `$`.
const NOT_AFTER_IDENT = '(?<![\\w$])'
const NOT_BEFORE_IDENT = '\\b(?!\\$)'

const globalPattern = (() => {
  const parts: string[] = []
  if (wordKeywords.length > 0) {
    parts.push(
      `${NOT_AFTER_IDENT}(${wordKeywords.map(escapeRe).join('|')})${NOT_BEFORE_IDENT}`
    )
  }
  if (dotKeywords.length > 0) {
    parts.push(`(${dotKeywords.map(escapeRe).join('|')})${NOT_BEFORE_IDENT}`)
  }
  if (otherNonWordKeywords.length > 0) {
    parts.push(
      `${NOT_AFTER_IDENT}(${otherNonWordKeywords.map(escapeRe).join('|')})${NOT_BEFORE_IDENT}`
    )
  }
  return parts.length > 0 ? new RegExp(parts.join('|'), 'g') : null
})()

interface BlockLinkDirective {
  nolink?: true | Set<string>
  link?: Set<string>
}

/**
 * Shiki transformer that auto-links keywords in code blocks.
 *
 * Every token that matches a keyword in `keywordMap` is wrapped in an `<a
 * class="keyword-link">` element. Two directive comments refine behaviour per
 * line:
 *
 *     // [!code unlink:Pager,FooBar]   – suppress auto-linking
 *     // [!code link:Name=/custom/url] – add a one-off keyword link
 *
 * Both directives are stripped from the rendered output.
 *
 * Block-level directives can be passed through fence meta (e.g. from the `:::
 * example` plugin):
 *
 *     ::: example nolink              – disable all keyword linking
 *     ::: example nolink=Foo,Bar      – disable linking for specific keywords
 *     ::: example link=Foo,Bar        – only link specific keywords
 *
 * Uses the `root` hook so it runs **after** `vueSfcHighlight`.
 */
export function keywordLink(): ShikiTransformer {
  return {
    name: 'keyword-link',
    root(hast) {
      const rawMeta = String(this.options.meta?.__raw ?? '')

      let block: BlockLinkDirective | undefined
      const nolinkMatch = rawMeta.match(/\bnolink(?:=(\S+))?/)
      if (nolinkMatch) {
        block = {
          nolink: nolinkMatch[1] ? new Set(nolinkMatch[1].split(',')) : true,
        }
      } else {
        const linkMatch = rawMeta.match(/\blink=(\S+)/)
        if (linkMatch) {
          block = { link: new Set(linkMatch[1].split(',')) }
        }
      }

      const preEl = hast.children.find(
        (c): c is Element => c.type === 'element' && c.tagName === 'pre'
      )
      if (!preEl) return

      const codeEl = preEl.children.find(
        (c): c is Element => c.type === 'element' && c.tagName === 'code'
      )
      if (!codeEl) return

      for (const line of codeEl.children) {
        if (line.type !== 'element') continue
        if (block?.nolink === true) continue
        processLine(line, block)
      }
    },
  }
}

// ---------------------------------------------------------------------------
// Line processing
// ---------------------------------------------------------------------------

function processLine(line: Element, block?: BlockLinkDirective) {
  const lineText = collectText(line.children)

  const unlinkMatch = lineText.match(UNLINK_RE)
  const linkMatch = lineText.match(LINK_RE)

  if (unlinkMatch) line.children = stripComment(line.children, unlinkMatch[0])
  if (linkMatch) line.children = stripComment(line.children, linkMatch[0])

  // Fast path – no directives at all → use the pre-built global pattern
  if (!unlinkMatch && !linkMatch && !block) {
    if (!globalPattern) return
    line.children = linkifyKeywords(line.children, extendedMap, globalPattern)
    return
  }

  // Build the effective keyword map for this line
  const excluded = new Set<string>()
  if (block?.nolink instanceof Set) {
    block.nolink.forEach((name) => excluded.add(name))
  }
  if (unlinkMatch) {
    for (const name of unlinkMatch[1].split(',')) excluded.add(name.trim())
  }

  const overrides: Record<string, KeywordEntry> = {}
  if (linkMatch) {
    for (const part of linkMatch[1].split(',')) {
      const eq = part.indexOf('=')
      if (eq !== -1) {
        const name = part.slice(0, eq).trim()
        const url = part.slice(eq + 1).trim()
        if (name && url) overrides[name] = { link: url }
      }
    }
  }

  let effectiveMap: Record<string, KeywordEntry>
  if (block?.link) {
    effectiveMap = {}
    block.link.forEach((name) => {
      if (extendedMap[name] && !excluded.has(name)) {
        effectiveMap[name] = extendedMap[name]
      }
    })
  } else {
    effectiveMap = {}
    for (const [name, entry] of Object.entries(extendedMap)) {
      if (!excluded.has(name)) effectiveMap[name] = entry
    }
  }
  for (const [name, entry] of Object.entries(overrides)) {
    if (!excluded.has(name)) effectiveMap[name] = entry
  }

  const names = Object.keys(effectiveMap)
  if (names.length === 0) return

  names.sort((a, b) => b.length - a.length)
  const wordNames = names.filter((k) => /^\w/.test(k))
  const nonWordNames = names.filter((k) => /^\W/.test(k))
  const patternParts: string[] = []
  if (wordNames.length > 0) {
    patternParts.push(
      `${NOT_AFTER_IDENT}(${wordNames.map(escapeRe).join('|')})${NOT_BEFORE_IDENT}`
    )
  }
  if (nonWordNames.length > 0) {
    patternParts.push(
      `${NOT_AFTER_IDENT}(${nonWordNames.map(escapeRe).join('|')})${NOT_BEFORE_IDENT}`
    )
  }
  if (patternParts.length === 0) return
  const pattern = new RegExp(patternParts.join('|'), 'g')
  line.children = linkifyKeywords(line.children, effectiveMap, pattern)
}

// ---------------------------------------------------------------------------
// HAST rewriting
// ---------------------------------------------------------------------------

/**
 * Normalise popover blocks into the object form that the runtime expects.
 * `$type` is expanded to `{ type: '$type', content: keywordName }`. `$github`
 * is expanded to `{ type: '$github', content: entry.github }`.
 */
function normalizePopover(
  blocks: PopoverBlock[],
  keywordName: string,
  entry?: KeywordEntry,
  map?: Record<string, KeywordEntry>
): { type: string; content: string }[] {
  return blocks.map((b) => {
    if (typeof b === 'string') {
      if (b === '$type') return { type: '$type', content: keywordName }
      if (b === '$github')
        return { type: '$github', content: entry?.github ?? '' }
      if (b === '$tokens')
        return { type: '$tokens', content: resolveTokensContent(entry, map) }
      if (b === '$classes')
        return { type: '$classes', content: resolveClassesContent(entry, map) }
      if (b === '$variants')
        return {
          type: '$variants',
          content: resolveVariantsContent(entry, keywordName, map),
        }
      return { type: 'text', content: b }
    }
    if (b.type === '$type' && !b.content) {
      return { type: '$type', content: keywordName }
    }
    if (b.type === '$github' && !b.content) {
      return { type: '$github', content: entry?.github ?? '' }
    }
    if (b.type === '$tokens' && !b.content) {
      return { type: '$tokens', content: resolveTokensContent(entry, map) }
    }
    if (b.type === '$classes' && !b.content) {
      return { type: '$classes', content: resolveClassesContent(entry, map) }
    }
    if (b.type === '$variants' && !b.content) {
      return {
        type: '$variants',
        content: resolveVariantsContent(entry, keywordName, map),
      }
    }
    return b
  })
}

function resolveTokensContent(
  entry?: KeywordEntry,
  map?: Record<string, KeywordEntry>
): string {
  const tokens = entry?.tokens ?? []
  if (!tokens.length) return '[]'
  const resolved = tokens.map((name) => {
    const tokenEntry = map?.[name]
    const item: {
      name: string
      popover?: { type: string; content: string }[]
      link?: string
    } = { name }
    if (tokenEntry?.popover?.length) {
      const filtered = tokenEntry.popover.filter(
        (b) => b !== '$tokens' && b !== '$classes'
      )
      item.popover = normalizePopover(filtered, name, tokenEntry, map)
    }
    if (tokenEntry?.link) item.link = tokenEntry.link
    return item
  })
  return JSON.stringify(resolved)
}

function resolveClassesContent(
  entry?: KeywordEntry,
  map?: Record<string, KeywordEntry>
): string {
  const classes = entry?.classes ?? []
  if (!classes.length) return '[]'
  const resolved = classes.map((name) => {
    const classEntry = map?.[name]
    const item: {
      name: string
      popover?: { type: string; content: string }[]
      link?: string
    } = { name }
    if (classEntry?.popover?.length) {
      const filtered = classEntry.popover.filter(
        (b) => b !== '$tokens' && b !== '$classes'
      )
      item.popover = normalizePopover(filtered, name, classEntry, map)
    }
    if (classEntry?.link) item.link = classEntry.link
    return item
  })
  return JSON.stringify(resolved)
}

function resolveVariantsContent(
  entry: KeywordEntry | undefined,
  keywordName: string,
  map?: Record<string, KeywordEntry>
): string {
  const variants = entry?.variants ?? {}
  const modName = keywordName.replace(/^\./, '')
  const resolved = Object.entries(variants).map(([parent, variant]) => {
    const display = `.${parent}.${modName}`
    const item: {
      name: string
      popover?: { type: string; content: string }[]
      link?: string
    } = { name: display }
    if (variant.popover?.length) {
      item.popover = normalizePopover(variant.popover, display, variant, map)
    }
    if (variant.link) item.link = variant.link
    return item
  })
  return JSON.stringify(resolved)
}

/**
 * Builds the normalized popover blocks for a matched keyword. When the keyword
 * is a multi-variant modifier and `context` (the class it is chained to in a
 * compound selector, e.g. `vf-input` in `.vf-input.vf-disabled`) names one of
 * its variants, it resolves directly to that variant instead of the variant
 * list. Returns `null` when there is nothing to show.
 */
function contextualPopover(
  entry: KeywordEntry,
  keywordName: string,
  map: Record<string, KeywordEntry>,
  context: string | null,
  fallback: PopoverBlock[] = []
): { type: string; content: string }[] | null {
  if (entry.variants && context && entry.variants[context]) {
    const variant = entry.variants[context]
    return normalizePopover(variant.popover ?? [], keywordName, variant, map)
  }
  const blocks = entry.popover?.length ? entry.popover : fallback
  if (!blocks.length) return null
  return normalizePopover(blocks, keywordName, entry, map)
}

/**
 * Returns the class name (without leading `.`) for a matched class part.
 */
function classContextOf(part: { text: string; match: boolean }): string | null {
  return part.match && part.text.startsWith('.') ? part.text.slice(1) : null
}

/**
 * The display form of a keyword. Class keywords keep their leading `.` for
 * identification/matching but are shown without it (e.g. `.vf-input` →
 * `vf-input`).
 */
function displayKeyword(name: string): string {
  return name.startsWith('.') ? name.slice(1) : name
}

/**
 * True when `part` is a class that only serves as context for the immediately
 * following modifier (e.g. `.vf-input` in `.vf-input.vf-disabled`, where
 * `.vf-disabled` has a `vf-input` variant). Such context classes are hidden in
 * inline references so only the contextual modifier is shown.
 */
function isContextClassPart(
  part: { text: string; match: boolean },
  next: { text: string; match: boolean } | undefined,
  map: Record<string, KeywordEntry>
): boolean {
  const cls = classContextOf(part)
  if (!cls || !next?.match) return false
  const nextEntry = map[next.text]
  return !!(nextEntry?.variants && nextEntry.variants[cls])
}

function linkifyKeywords(
  children: ElementContent[],
  map: Record<string, KeywordEntry>,
  pattern: RegExp
): ElementContent[] {
  const result: ElementContent[] = []

  for (const child of children) {
    if (child.type !== 'element' || child.tagName !== 'span') {
      result.push(child)
      continue
    }

    const text = textOf(child)
    if (text === null) {
      result.push(child)
      continue
    }

    pattern.lastIndex = 0
    if (!pattern.test(text)) {
      result.push(child)
      continue
    }

    const parts = splitByPattern(text, pattern)
    if (parts.length === 1 && !parts[0].match) {
      result.push(child)
      continue
    }

    let prevClass: string | null = null
    for (const part of parts) {
      if (part.text === '') continue

      const span = cloneWithText(child, part.text)
      const entry = part.match ? map[part.text] : undefined
      const context = prevClass
      prevClass = classContextOf(part)

      if (entry) {
        const isExternal =
          entry.link?.startsWith('http://') ||
          entry.link?.startsWith('https://')

        const props: Record<string, string> = {
          class: isExternal
            ? 'keyword-link keyword-link-external'
            : 'keyword-link',
        }

        if (entry.link) {
          props.href = entry.link
          if (isExternal) {
            props.target = '_blank'
            props.rel = 'noopener noreferrer'
          }
        }

        const blocks = contextualPopover(entry, part.text, map, context, [
          'Go to definition',
        ])
        props['data-popover'] = JSON.stringify(blocks ?? [])

        const textNode = span.children?.[0]
        const linkChildren: ElementContent[] = textNode ? [textNode] : []

        if (isExternal) {
          linkChildren.push({
            type: 'element',
            tagName: 'span',
            properties: {
              class: 'keyword-link-ext-icon',
              'aria-hidden': 'true',
            },
            children: [],
          })
        }

        span.children = [
          {
            type: 'element',
            tagName: 'a',
            properties: props,
            children: linkChildren,
          },
        ]
        result.push(span)
      } else {
        result.push(span)
      }
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectText(children: ElementContent[] | undefined): string {
  if (!children) return ''
  let out = ''
  for (const c of children) {
    if (c.type === 'text') out += c.value
    else if (c.type === 'element') out += collectText(c.children)
  }
  return out
}

function textOf(el: Element): string | null {
  const first = el.children[0]
  return first?.type === 'text' ? first.value : null
}

function cloneWithText(original: Element, text: string): Element {
  return {
    type: 'element',
    tagName: 'span',
    properties: { ...original.properties },
    children: [{ type: 'text', value: text }],
  }
}

function splitByPattern(
  text: string,
  pattern: RegExp
): { text: string; match: boolean }[] {
  pattern.lastIndex = 0
  const parts: { text: string; match: boolean }[] = []
  let last = 0
  let m: RegExpExecArray | null

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last)
      parts.push({ text: text.slice(last, m.index), match: false })
    parts.push({ text: m[0], match: true })
    last = m.index + m[0].length
  }

  if (last < text.length) parts.push({ text: text.slice(last), match: false })
  return parts.length > 0 ? parts : [{ text, match: false }]
}

/**
 * Remove a comment string (and any preceding whitespace) from the HAST line.
 * Shiki tokenises comments into several spans, so we track character offsets
 * and trim/remove spans that overlap with the comment region.
 */
function stripComment(
  children: ElementContent[],
  comment: string
): ElementContent[] {
  const fullText = collectText(children)
  let commentStart = fullText.indexOf(comment)
  if (commentStart === -1) return children

  while (commentStart > 0 && fullText[commentStart - 1] === ' ') commentStart--

  const result: ElementContent[] = []
  let pos = 0

  for (const child of children) {
    if (child.type !== 'element' || child.tagName !== 'span') {
      result.push(child)
      continue
    }

    const text = textOf(child)
    if (text === null) {
      result.push(child)
      continue
    }

    const childEnd = pos + text.length

    if (childEnd <= commentStart) {
      result.push(child)
    } else if (pos >= commentStart) {
      // entirely inside comment – skip
    } else {
      const keep = text.slice(0, commentStart - pos)
      if (keep) result.push(cloneWithText(child, keep))
    }

    pos = childEnd
  }

  return result
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ---------------------------------------------------------------------------
// Markdown-it plugin – inline `code` keywords
// ---------------------------------------------------------------------------

const NOLINK_SCOPE_START_RE = /<!--\s*@nolink-scope:\s*(\S+?)\s*-->/
const NOLINK_SCOPE_END_RE = /<!--\s*@nolink-scope-end\s*-->/

/**
 * Markdown-it core rule that automatically adds `nolink={names}` to every fence
 * token, so the page's own name (last URI segment) is never auto-linked.
 *
 * Included-file scopes are handled via paired `<!-- @nolink-scope: Name -->` /
 * `<!-- @nolink-scope-end -->` markers injected by the `includeNolink` Vite
 * plugin. Fences that fall between a marker pair additionally receive the
 * included file's basename in their `nolink` list, so an included type
 * definition doesn't link to itself while the rest of the host page still can.
 */
export function autoPageNolink(md: any) {
  md.core.ruler.push('auto_page_nolink', (state: any) => {
    const rel: string | undefined = state.env?.relativePath
    if (!rel) return

    const m = rel.match(/(\w+)\.md$/)
    if (!m) return

    const pageName = m[1]

    // Only the page's own name is globally excluded from inline keyword linking
    state.env._nolinkNames = new Set([pageName])

    const scopeStack: string[] = []

    state.tokens = state.tokens.filter((token: any) => {
      if (token.type === 'html_block') {
        const startMatch = token.content.match(NOLINK_SCOPE_START_RE)
        if (startMatch) {
          scopeStack.push(startMatch[1])
          return false
        }
        if (NOLINK_SCOPE_END_RE.test(token.content)) {
          scopeStack.pop()
          return false
        }
      }

      if (
        token.type === 'fence' &&
        token.info.trim() &&
        !/\bnolink\b|\blink=/.test(token.info)
      ) {
        const names = [pageName, ...scopeStack]
        token.info += ` nolink=${names.join(',')}`
      }

      return true
    })
  })
}

// ---------------------------------------------------------------------------

/**
 * Returns true when the token at `idx` sits between an unmatched `link_open`
 * and its corresponding `link_close`, i.e. the code span is already a link
 * child and must not receive another `<a>` wrapper.
 */
function isInsideLink(tokens: any[], idx: number): boolean {
  for (let i = idx - 1; i >= 0; i--) {
    if (tokens[i].type === 'link_open') return true
    if (tokens[i].type === 'link_close') return false
  }
  return false
}

/**
 * Markdown-it plugin that auto-links keywords inside inline code spans.
 *
 * Unlike the Shiki transformer for fenced code blocks, this does **not** add
 * the default "Go to definition" popover. Only keywords that carry an explicit
 * `popover` in the keyword map receive one; all others are rendered as plain
 * links (or left untouched when they have no link either).
 */
export function inlineKeywordLink(md: any) {
  const defaultRender = md.renderer.rules.code_inline

  md.renderer.rules.code_inline = (
    tokens: any[],
    idx: number,
    options: any,
    env: any,
    self: any
  ) => {
    const token = tokens[idx]
    let content: string = token.content

    // `!keyword` → render as plain `keyword` with no auto-linking
    if (content.startsWith('!')) {
      token.content = content.slice(1)
      return defaultRender(tokens, idx, options, env, self)
    }

    if (isInsideLink(tokens, idx)) {
      return defaultRender(tokens, idx, options, env, self)
    }

    if (!globalPattern) {
      return defaultRender(tokens, idx, options, env, self)
    }

    globalPattern.lastIndex = 0
    if (!globalPattern.test(content)) {
      return defaultRender(tokens, idx, options, env, self)
    }

    const parts = splitByPattern(content, globalPattern)
    if (parts.length === 1 && !parts[0].match) {
      return defaultRender(tokens, idx, options, env, self)
    }

    const nolinkNames: Set<string> = env?._nolinkNames ?? new Set()

    let html = `<code${self.renderAttrs(token)}>`

    let prevClass: string | null = null
    let escapeNext = false
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (part.text === '') continue

      if (!part.match) {
        prevClass = null
        // A trailing backslash before a class keyword hides its leading dot,
        // so `\.vf-disabled` is displayed as `vf-disabled` (the dot is shown
        // by default for `.vf-disabled`).
        const next = parts[i + 1]
        if (
          part.text.endsWith('\\') &&
          next?.match &&
          next.text.startsWith('.')
        ) {
          html += escapeHtml(part.text.slice(0, -1))
          escapeNext = true
        } else {
          html += escapeHtml(part.text)
        }
        continue
      }

      const entry = extendedMap[part.text]
      const context = prevClass
      prevClass = classContextOf(part)

      const escaped = escapeNext
      escapeNext = false

      // Hide a class that only provides context for the next modifier, so
      // `.vf-input.vf-disabled` renders as just `.vf-disabled`.
      if (isContextClassPart(part, parts[i + 1], extendedMap)) {
        continue
      }

      if (
        entry &&
        (entry.link || entry.popover?.length) &&
        !nolinkNames.has(part.text)
      ) {
        const isExternal =
          entry.link?.startsWith('http://') ||
          entry.link?.startsWith('https://')

        const cls = isExternal
          ? 'keyword-link keyword-link-external'
          : 'keyword-link'
        const attrs: string[] = [`class="${cls}"`]

        if (entry.link) {
          attrs.push(`href="${escapeHtml(entry.link)}"`)
          if (isExternal) {
            attrs.push('target="_blank"', 'rel="noopener noreferrer"')
          }
        }

        const blocks = contextualPopover(entry, part.text, extendedMap, context)
        if (blocks) {
          attrs.push(`data-popover="${escapeHtml(JSON.stringify(blocks))}"`)
        }

        const extIcon = isExternal
          ? '<span class="keyword-link-ext-icon" aria-hidden="true"></span>'
          : ''
        const display = escaped ? displayKeyword(part.text) : part.text
        html += `<a ${attrs.join(' ')}>${escapeHtml(display)}${extIcon}</a>`
      } else {
        const display = escaped ? displayKeyword(part.text) : part.text
        html += escapeHtml(display)
      }
    }

    html += '</code>'
    return html
  }
}
