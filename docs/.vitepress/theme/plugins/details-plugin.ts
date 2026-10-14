export function detailsPlugin(md: any) {
  md.block.ruler.before('fence', 'details_block', detailsRule)

  md.renderer.rules.details_open = (tokens: any[], idx: number) => {
    const label = md.utils.escapeHtml(tokens[idx].info)
    return `<details>\n<summary>${label}</summary>\n`
  }
  md.renderer.rules.details_close = () => '</details>\n'
}

function getLine(state: any, line: number): string {
  const pos = state.bMarks[line] + state.tShift[line]
  const max = state.eMarks[line]
  return state.src.slice(pos, max)
}

function detailsRule(
  state: any,
  startLine: number,
  endLine: number,
  silent: boolean
): boolean {
  const lineText = getLine(state, startLine).trim()

  const openMatch = lineText.match(/^<!--\s*@details\s+(.+?)\s*-->$/)
  if (!openMatch) return false

  let scanLine = startLine + 1
  let depth = 0
  let closingLine = -1

  while (scanLine < endLine) {
    const text = getLine(state, scanLine).trim()

    if (/^<!--\s*@details\s+/.test(text)) {
      depth++
    } else if (/^<!--\s*@enddetails\s*-->$/.test(text)) {
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

  const label = openMatch[1]

  const detailsOpen = state.push('details_open', 'details', 1)
  detailsOpen.info = label
  detailsOpen.block = true
  detailsOpen.map = [startLine, closingLine + 1]

  const oldParentType = state.parentType
  const oldLineMax = state.lineMax
  state.parentType = 'details'
  state.lineMax = closingLine

  state.md.block.tokenize(state, startLine + 1, closingLine)

  state.parentType = oldParentType
  state.lineMax = oldLineMax

  const detailsClose = state.push('details_close', 'details', -1)
  detailsClose.block = true

  state.line = closingLine + 1
  return true
}
