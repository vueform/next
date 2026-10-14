export function collapsibleSectionPlugin(md: any) {
  md.block.ruler.before('fence', 'collapsible_block', collapsibleRule)

  md.renderer.rules.collapsible_open = (tokens: any[], idx: number) => {
    const token = tokens[idx]
    const closed = token.meta?.closed ? ' data-closed' : ''
    return `<div class="collapsible-sections"${closed}>\n`
  }
  md.renderer.rules.collapsible_close = () => '</div>\n'
}

function getLine(state: any, line: number): string {
  const pos = state.bMarks[line] + state.tShift[line]
  const max = state.eMarks[line]
  return state.src.slice(pos, max)
}

function collapsibleRule(
  state: any,
  startLine: number,
  endLine: number,
  silent: boolean
): boolean {
  const lineText = getLine(state, startLine).trim()

  const openMatch = lineText.match(
    /^<!--\s*@collapsible(?:\s+(closed))?\s*-->$/
  )
  if (!openMatch) return false
  const closed = openMatch[1] === 'closed'

  let scanLine = startLine + 1
  let depth = 0
  let closingLine = -1

  while (scanLine < endLine) {
    const text = getLine(state, scanLine).trim()

    if (/^<!--\s*@collapsible(?:\s+closed)?\s*-->$/.test(text)) {
      depth++
    } else if (/^<!--\s*@endcollapsible\s*-->$/.test(text)) {
      if (depth === 0) {
        closingLine = scanLine
        break
      }
      depth--
    }

    scanLine++
  }

  if (closingLine === -1) return false
  if (silent) return true

  const open = state.push('collapsible_open', 'div', 1)
  open.block = true
  open.map = [startLine, closingLine + 1]
  open.meta = { closed }

  const oldParentType = state.parentType
  const oldLineMax = state.lineMax
  state.parentType = 'collapsible'
  state.lineMax = closingLine

  state.md.block.tokenize(state, startLine + 1, closingLine)

  state.parentType = oldParentType
  state.lineMax = oldLineMax

  const close = state.push('collapsible_close', 'div', -1)
  close.block = true

  state.line = closingLine + 1
  return true
}
