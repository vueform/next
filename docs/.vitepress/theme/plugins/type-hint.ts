import type { Element, ElementContent } from 'hast'
import type { ShikiTransformer } from 'shiki'

interface HintItem {
  kind: string
  label: string
  detail: string
  selected: boolean
}

interface Hint {
  column: number
  kind: 'completions' | 'type'
  placement: 'bottom' | 'right'
  gap: number | undefined
  items: HintItem[]
  type: string
}

const HINT_RE = /^[ \t]*\/\/[ \t]*([\^<])(\d*)(\||\?)(.*)$/
const BLANK_RE = /^[ \t]*\/\/[ \t]*\.[ \t]*$/

/**
 * Static caret hints in fenced code. Annotation lines are stripped and a widget
 * is inserted at the matching column on the line above:
 *
 *     form$.find('')
 *     //          ^|string:name|*string:email
 *
 *     country: { items
 *     //               ^|*items@"(property) ResolvedItem<{ label: string, ..."|itemsDebounce@"(property) number"
 *
 *     const el$ = form$.find('country')
 *     //    ^? VfSelectContext | undefined
 *
 * `^|` is a completion list. Each entry is `name`, `kind:name`, or
 * `name@"type"` (optional `kind:` prefix). Entries are separated by `|`. Prefix
 * `*` to select that row. `^?` is a type chip. Using `<` instead of `^` (`<|`,
 * `<?`) places the widget to the right of the caret instead of below it; an
 * optional character gap goes between the marker and the mark (`<4|` — 4
 * characters of space between caret and panel, default 0.5rem). A line that is
 * exactly `//.` renders as an empty line — padding that survives the trailing
 * trim, e.g. room below a right-placed panel. Neither type-checks the fence —
 * the payload is authored by hand.
 */
export function typeHint(): ShikiTransformer {
  return {
    name: 'type-hint',
    root(hast) {
      const preEl = hast.children.find(
        (c): c is Element => c.type === 'element' && c.tagName === 'pre'
      )
      if (!preEl) return

      const codeEl = preEl.children.find(
        (c): c is Element => c.type === 'element' && c.tagName === 'code'
      )
      if (!codeEl) return

      const lines = codeEl.children.filter(
        (c): c is Element => c.type === 'element'
      )
      const remove = new Set<Element>()

      for (let i = 0; i < lines.length; i++) {
        const text = collectText(lines[i].children)
        if (BLANK_RE.test(text)) {
          lines[i].children = []
          continue
        }
        const match = text.match(HINT_RE)
        if (!match) continue

        const target = previousCodeLine(lines, i, remove)
        if (!target) {
          remove.add(lines[i])
          continue
        }

        const hint = parseHint(text, match[1], match[2], match[3], match[4])
        if (hint.kind === 'type') {
          hint.column = endOfIdent(collectText(target.children), hint.column)
        }
        insertAtColumn(target, hint.column, [renderHint(hint)])
        remove.add(lines[i])
      }

      if (remove.size === 0) return
      const next: ElementContent[] = []
      for (let i = 0; i < codeEl.children.length; i++) {
        const child = codeEl.children[i]
        if (child.type === 'element' && remove.has(child)) {
          const after = codeEl.children[i + 1]
          if (after?.type === 'text' && after.value === '\n') i++
          continue
        }
        next.push(child)
      }
      codeEl.children = next
    },
  }
}

function previousCodeLine(
  lines: Element[],
  index: number,
  remove: Set<Element>
): Element | undefined {
  for (let i = index - 1; i >= 0; i--) {
    if (remove.has(lines[i])) continue
    if (HINT_RE.test(collectText(lines[i].children))) continue
    return lines[i]
  }
}

function parseHint(
  line: string,
  marker: string,
  gapDigits: string,
  mark: string,
  payload: string
): Hint {
  const column = line.indexOf(marker)
  const placement = marker === '<' ? 'right' : 'bottom'
  const gap = gapDigits ? Number(gapDigits) : undefined
  if (mark === '?') {
    return {
      column,
      kind: 'type',
      placement,
      gap,
      items: [],
      type: payload.trim(),
    }
  }

  return {
    column,
    kind: 'completions',
    placement,
    gap,
    items: parseCompletionItems(payload),
    type: '',
  }
}

function parseCompletionItems(payload: string): HintItem[] {
  const items: HintItem[] = []
  for (const token of splitPipes(payload)) {
    const item = parseCompletionItem(token)
    if (item) items.push(item)
  }
  return items
}

function splitPipes(payload: string): string[] {
  const parts: string[] = []
  let current = ''
  let inQuote = false
  for (const ch of payload) {
    if (ch === '"') inQuote = !inQuote
    if (ch === '|' && !inQuote) {
      if (current.trim()) parts.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function parseCompletionItem(token: string): HintItem | undefined {
  let rest = token
  const selected = rest.startsWith('*')
  if (selected) rest = rest.slice(1)
  if (!rest) return

  let detail = ''
  const at = rest.indexOf('@"')
  if (at >= 0) {
    const quoted = rest.slice(at + 2)
    const end = quoted.indexOf('"')
    if (end === -1) return
    detail = quoted.slice(0, end)
    rest = rest.slice(0, at)
  }

  let kind = ''
  let label = rest
  const colon = rest.indexOf(':')
  if (colon > 0) {
    kind = rest.slice(0, colon)
    label = rest.slice(colon + 1)
  }
  if (!label) return

  return { kind, label, detail, selected }
}

function renderHint(hint: Hint): Element {
  const panelChildren: ElementContent[] =
    hint.kind === 'type'
      ? [
          {
            type: 'element',
            tagName: 'span',
            properties: { class: 'type-hint-type' },
            children: [{ type: 'text', value: hint.type }],
          },
        ]
      : hint.items.map((item) => {
          const selected = item.selected
          const kindClass = item.kind
            ? ` type-hint-kind-${safeKind(item.kind)}`
            : ''
          const children: ElementContent[] = [
            {
              type: 'element',
              tagName: 'span',
              properties: {
                class: `type-hint-kind${kindClass}`,
                'aria-hidden': 'true',
              },
              children: [],
            },
            {
              type: 'element',
              tagName: 'span',
              properties: { class: 'type-hint-label' },
              children: [{ type: 'text', value: item.label }],
            },
          ]
          if (item.detail) {
            children.push({
              type: 'element',
              tagName: 'span',
              properties: { class: 'type-hint-detail' },
              children: [{ type: 'text', value: item.detail }],
            })
          }
          return {
            type: 'element' as const,
            tagName: 'span',
            properties: {
              class: selected ? 'type-hint-item is-selected' : 'type-hint-item',
            },
            children,
          }
        })

  return {
    type: 'element',
    tagName: 'span',
    properties: {
      class: 'type-hint vp-copy-ignore',
    },
    children: [
      {
        type: 'element',
        tagName: 'span',
        properties: { class: 'type-hint-caret', 'aria-hidden': 'true' },
        children: [],
      },
      {
        type: 'element',
        tagName: 'span',
        properties: {
          class:
            `type-hint-panel type-hint-panel-${hint.kind}` +
            (hint.placement === 'right' ? ' type-hint-panel-right' : ''),
          ...(hint.gap !== undefined && {
            style: `--type-hint-gap: ${hint.gap}ch`,
          }),
        },
        children: panelChildren,
      },
    ],
  }
}

function endOfIdent(text: string, column: number): number {
  const ident = /[\w$]/
  let i = Math.max(0, Math.min(column, text.length))
  while (i > 0 && ident.test(text[i - 1])) i--
  while (i < text.length && ident.test(text[i])) i++
  return i
}

function safeKind(kind: string): string {
  return kind.replace(/[^a-zA-Z0-9_-]/g, '') || 'value'
}

function insertAtColumn(
  line: Element,
  column: number,
  nodes: ElementContent[]
): void {
  const leftover = insertInto(line.children, Math.max(0, column), nodes)
  if (leftover > 0) line.children.push(...nodes)
}

function insertInto(
  children: ElementContent[],
  column: number,
  nodes: ElementContent[]
): number {
  let remaining = column

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (child.type === 'text') {
      const len = child.value.length
      if (remaining <= len) {
        const before = child.value.slice(0, remaining)
        const after = child.value.slice(remaining)
        const next: ElementContent[] = []
        if (before) next.push({ type: 'text', value: before })
        next.push(...nodes)
        if (after) next.push({ type: 'text', value: after })
        children.splice(i, 1, ...next)
        return 0
      }
      remaining -= len
      continue
    }

    if (child.type !== 'element') continue

    const len = collectText(child.children).length
    if (remaining < len) {
      return insertInto(child.children, remaining, nodes)
    }
    if (remaining === len) {
      children.splice(i + 1, 0, ...nodes)
      return 0
    }
    remaining -= len
  }

  return remaining
}

function collectText(children: ElementContent[] | undefined): string {
  if (!children) return ''
  let out = ''
  for (const c of children) {
    if (c.type === 'text') out += c.value
    else if (c.type === 'element') out += collectText(c.children)
  }
  return out
}
