const TYPES = ['warning', 'tip', 'info', 'danger', 'caution', 'important']

// `::: <type> closed [title]` or `::: <type> [title] closed` — `closed` must be
// the first or the last word after the type (`::: tip closed`,
// `::: tip closed TIP`, `::: tip TIP closed`); a title merely containing the
// word "closed" is left to VitePress. Whatever remains is the title.
const openRe = new RegExp(`^:::\\s*(${TYPES.join('|')})(?:\\s+(.*))?$`, 'i')
const closedRe = /^closed(?:\s+|$)|(?:^|\s+)closed$/i

// VitePress registers its containers in this order (tip, info, warning,
// danger, details). Our rule has to run before the *first* of them, or an
// earlier container (e.g. `container_tip`) consumes `::: tip closed` as a
// regular block titled "closed" before we ever see it.
const CONTAINER_RULES = [
  'container_tip',
  'container_info',
  'container_warning',
  'container_danger',
  'container_details',
]

export function collapsibleCustomBlockPlugin(md: any) {
  const before = CONTAINER_RULES.find((name) => hasRule(md, name)) ?? 'fence'

  md.block.ruler.before(before, 'collapsible_custom_block', rule)
}

function hasRule(md: any, name: string) {
  return md.block.ruler.__rules__?.some(
    (r: { name: string }) => r.name === name
  )
}

function getLine(state: any, line: number): string {
  const pos = state.bMarks[line] + state.tShift[line]
  const max = state.eMarks[line]
  return state.src.slice(pos, max)
}

function findClosingLine(state: any, startLine: number, endLine: number) {
  let scanLine = startLine + 1
  let depth = 0

  while (scanLine < endLine) {
    const text = getLine(state, scanLine).trim()

    if (/^:::/.test(text)) {
      if (/^:::\s*$/.test(text)) {
        if (depth === 0) return scanLine
        depth--
      } else {
        depth++
      }
    }

    scanLine++
  }

  return -1
}

function findSplitLine(state: any, from: number, to: number) {
  for (let line = from; line < to; line++) {
    const text = getLine(state, line).trim()
    if (text.startsWith('```') || text.startsWith(':::')) return line
  }
  return -1
}

function tokenizeRange(
  state: any,
  from: number,
  to: number,
  parentType: string
) {
  const oldParentType = state.parentType
  const oldLineMax = state.lineMax
  state.parentType = parentType
  state.lineMax = to
  state.md.block.tokenize(state, from, to)
  state.parentType = oldParentType
  state.lineMax = oldLineMax
}

function pushHtml(state: any, content: string) {
  const token = state.push('html_block', '', 0)
  token.content = content
  token.map = [state.line, state.line]
}

function rule(
  state: any,
  startLine: number,
  endLine: number,
  silent: boolean
): boolean {
  const openMatch = getLine(state, startLine).trim().match(openRe)
  if (!openMatch) return false

  const params = openMatch[2] ?? ''
  if (!closedRe.test(params)) return false

  const closingLine = findClosingLine(state, startLine, endLine)
  if (closingLine === -1) return false
  if (silent) return true

  const type = openMatch[1].toLowerCase()
  const title = params.replace(closedRe, ' ').trim()
  const splitLine = findSplitLine(state, startLine + 1, closingLine)

  pushHtml(
    state,
    `<div class="custom-block ${type}">\n` +
      (title
        ? `<p class="custom-block-title">${state.md.utils.escapeHtml(title)}</p>\n`
        : '')
  )

  if (splitLine === -1) {
    tokenizeRange(state, startLine + 1, closingLine, 'custom_block')
  } else {
    tokenizeRange(state, startLine + 1, splitLine, 'custom_block')

    const open = state.push('details_open', 'details', 1)
    open.info = 'Example'
    open.block = true
    open.map = [splitLine, closingLine]

    tokenizeRange(state, splitLine, closingLine, 'details')

    const close = state.push('details_close', 'details', -1)
    close.block = true
  }

  pushHtml(state, '</div>\n')

  state.line = closingLine + 1
  return true
}
