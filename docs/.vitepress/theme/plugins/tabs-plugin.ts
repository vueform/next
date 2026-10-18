export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function tabsPlugin(md: any) {
  md.block.ruler.before('fence', 'tabs', tabsRule)

  md.core.ruler.push('tabs_headings', (state: any) => {
    let currentTabSlug: string | null = null
    const slugMap = new Map<string, string>()

    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i]

      if (token.type === 'tab_open') {
        currentTabSlug = slugify(token.info)
      } else if (token.type === 'tab_close') {
        currentTabSlug = null
      } else if (currentTabSlug && token.type === 'heading_open') {
        const oldId = token.attrGet('id')
        if (oldId) {
          const newId = `${currentTabSlug}.${oldId}`
          token.attrSet('id', newId)
          slugMap.set(oldId, newId)

          const inline = state.tokens[i + 1]
          if (inline?.type === 'inline' && inline.children) {
            for (const child of inline.children) {
              if (
                child.type === 'link_open' &&
                child.attrGet('class') === 'header-anchor'
              ) {
                child.attrSet('href', `#${newId}`)
              }
            }
          }
        }
      }
    }

    if (state.env?.headers) {
      patchHeaders(state.env.headers, slugMap)
    }
  })

  md.renderer.rules.tabs_open = () => '<VPTabs>\n'
  md.renderer.rules.tabs_close = () => '</VPTabs>\n'
  md.renderer.rules.tab_open = (tokens: any[], idx: number) => {
    const token = tokens[idx]
    const title = md.utils.escapeHtml(token.info)
    const slug = slugify(token.info)
    const dropdown = token.meta?.dropdown ? ' dropdown' : ''
    return `<VPTab title="${title}" slug="${slug}"${dropdown}>\n`
  }
  md.renderer.rules.tab_close = () => '</VPTab>\n'
}

function patchHeaders(headers: any[], slugMap: Map<string, string>) {
  for (const h of headers) {
    const newSlug = slugMap.get(h.slug)
    if (newSlug) {
      h.slug = newSlug
      h.link = `#${newSlug}`
    }
    if (h.children) {
      patchHeaders(h.children, slugMap)
    }
  }
}

function getLine(state: any, line: number): string {
  const pos = state.bMarks[line] + state.tShift[line]
  const max = state.eMarks[line]
  return state.src.slice(pos, max)
}

function tabsRule(
  state: any,
  startLine: number,
  endLine: number,
  silent: boolean
): boolean {
  const lineText = getLine(state, startLine).trim()

  if (!/^<!--\s*@tabs\s*-->$/.test(lineText)) return false

  let scanLine = startLine + 1
  let depth = 0
  let tabsClosingLine = -1

  while (scanLine < endLine) {
    const text = getLine(state, scanLine).trim()

    if (/^<!--\s*@tabs\s*-->$/.test(text)) {
      depth++
    } else if (/^<!--\s*@endtabs\s*-->$/.test(text)) {
      if (depth === 0) {
        tabsClosingLine = scanLine
        break
      }
      depth--
    }

    scanLine++
  }

  if (tabsClosingLine === -1) return false
  if (silent) return true

  interface TabInfo {
    title: string
    dropdown: boolean
    startLine: number
    endLine: number
  }

  const tabs: TabInfo[] = []
  let currentTab: TabInfo | null = null
  let line = startLine + 1

  while (line < tabsClosingLine) {
    const text = getLine(state, line).trim()
    const tabMatch = text.match(/^<!--\s*@tab\s+(.+?)\s*-->$/)
    const isEndTab = /^<!--\s*@endtab\s*-->$/.test(text)

    if (tabMatch) {
      if (currentTab) {
        currentTab.endLine = line
        tabs.push(currentTab)
      }
      // A `...` suffix after the name (`<!-- @tab Tokens... -->`) sends the
      // tab into the header's overflow dropdown regardless of available
      // space; the dots are not part of the display title.
      const rawTitle = tabMatch[1]
      const dropdown = rawTitle.endsWith('...')
      currentTab = {
        title: dropdown ? rawTitle.slice(0, -3).trim() : rawTitle,
        dropdown,
        startLine: line + 1,
        endLine: -1,
      }
    } else if (isEndTab && currentTab) {
      currentTab.endLine = line
      tabs.push(currentTab)
      currentTab = null
    }

    line++
  }

  if (currentTab) {
    currentTab.endLine = tabsClosingLine
    tabs.push(currentTab)
  }

  const tabsOpen = state.push('tabs_open', 'div', 1)
  tabsOpen.block = true
  tabsOpen.map = [startLine, tabsClosingLine + 1]

  for (const tab of tabs) {
    const tabOpen = state.push('tab_open', 'div', 1)
    tabOpen.info = tab.title
    tabOpen.meta = { dropdown: tab.dropdown }
    tabOpen.block = true
    tabOpen.map = [tab.startLine, tab.endLine]

    const oldParentType = state.parentType
    const oldLineMax = state.lineMax
    state.parentType = 'tab'
    state.lineMax = tab.endLine

    state.md.block.tokenize(state, tab.startLine, tab.endLine)

    state.parentType = oldParentType
    state.lineMax = oldLineMax

    const tabClose = state.push('tab_close', 'div', -1)
    tabClose.block = true
  }

  const tabsClose = state.push('tabs_close', 'div', -1)
  tabsClose.block = true

  state.line = tabsClosingLine + 1
  return true
}
