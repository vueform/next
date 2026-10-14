export function subtabsPlugin(md: any) {
  md.block.ruler.before('fence', 'subtabs', subtabsRule)

  md.renderer.rules.subtabs_open = () => '<VPSubtabs>\n'
  md.renderer.rules.subtabs_close = () => '</VPSubtabs>\n'
  md.renderer.rules.subtab_open = (tokens: any[], idx: number) => {
    const title = md.utils.escapeHtml(tokens[idx].info)
    return `<VPSubtab title="${title}">\n`
  }
  md.renderer.rules.subtab_close = () => '</VPSubtab>\n'
}

function getLine(state: any, line: number): string {
  const pos = state.bMarks[line] + state.tShift[line]
  const max = state.eMarks[line]
  return state.src.slice(pos, max)
}

function subtabsRule(
  state: any,
  startLine: number,
  endLine: number,
  silent: boolean
): boolean {
  const lineText = getLine(state, startLine).trim()

  if (!/^<!--\s*@subtabs\s*-->$/.test(lineText)) return false

  let scanLine = startLine + 1
  let depth = 0
  let closingLine = -1

  while (scanLine < endLine) {
    const text = getLine(state, scanLine).trim()

    if (/^<!--\s*@subtabs\s*-->$/.test(text)) {
      depth++
    } else if (/^<!--\s*@endsubtabs\s*-->$/.test(text)) {
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

  interface SubtabInfo {
    title: string
    startLine: number
    endLine: number
  }

  const subtabs: SubtabInfo[] = []
  let currentTab: SubtabInfo | null = null
  let line = startLine + 1

  while (line < closingLine) {
    const text = getLine(state, line).trim()
    const tabMatch = text.match(/^<!--\s*@subtab\s+(.+?)\s*-->$/)
    const isEndTab = /^<!--\s*@endsubtab\s*-->$/.test(text)

    if (tabMatch) {
      if (currentTab) {
        currentTab.endLine = line
        subtabs.push(currentTab)
      }
      currentTab = { title: tabMatch[1], startLine: line + 1, endLine: -1 }
    } else if (isEndTab && currentTab) {
      currentTab.endLine = line
      subtabs.push(currentTab)
      currentTab = null
    }

    line++
  }

  if (currentTab) {
    currentTab.endLine = closingLine
    subtabs.push(currentTab)
  }

  const open = state.push('subtabs_open', 'div', 1)
  open.block = true
  open.map = [startLine, closingLine + 1]

  for (const tab of subtabs) {
    const tabOpen = state.push('subtab_open', 'div', 1)
    tabOpen.info = tab.title
    tabOpen.block = true
    tabOpen.map = [tab.startLine, tab.endLine]

    const oldParentType = state.parentType
    const oldLineMax = state.lineMax
    state.parentType = 'subtab'
    state.lineMax = tab.endLine

    state.md.block.tokenize(state, tab.startLine, tab.endLine)

    state.parentType = oldParentType
    state.lineMax = oldLineMax

    const tabClose = state.push('subtab_close', 'div', -1)
    tabClose.block = true
  }

  const close = state.push('subtabs_close', 'div', -1)
  close.block = true

  state.line = closingLine + 1
  return true
}
