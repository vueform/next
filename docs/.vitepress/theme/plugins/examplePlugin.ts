export function examplePlugin(md: any) {
  md.block.ruler.before('fence', 'example', exampleRule)
}

function indent(text: string, spaces: number): string {
  const pad = ' '.repeat(spaces)
  return text
    .split('\n')
    .map((line) => (line ? pad + line : line))
    .join('\n')
}

function getLine(state: any, line: number): string {
  const pos = state.bMarks[line] + state.tShift[line]
  const max = state.eMarks[line]
  return state.src.slice(pos, max)
}

const INNER_FENCE_RE = /^(`{3,})(\w*)[ \t]*(.*)\n([\s\S]*?)\n\1\s*$/

/**
 * Vue's template compiler only applies boolean casting for props declared as
 * `Boolean`. Props typed as complex unions (e.g. `ConditionalProp`) receive
 * `""` instead of `true` when using HTML boolean shorthand. This transforms
 * bare boolean attributes on Vf* components into explicit `:attr="true"`
 * bindings so the rendered preview works correctly while the displayed code
 * block keeps the clean shorthand form.
 */
function expandBooleanShorthands(template: string): string {
  return template.replace(/<Vf\w+[\s\S]*?>/g, (tag) => {
    const strings: string[] = []
    const safe = tag.replace(/(["'])[\s\S]*?\1/g, (m) => {
      strings.push(m)
      return `__Q${strings.length - 1}__`
    })

    const expanded = safe.replace(
      /(?<=\s)([a-zA-Z][\w-]*)(?!\s*=)(?=\s|\/|>)/g,
      ':$1="true"'
    )

    return expanded.replace(/__Q(\d+)__/g, (_, i) => strings[+i])
  })
}

function exampleRule(
  state: any,
  startLine: number,
  endLine: number,
  silent: boolean
): boolean {
  const lineText = getLine(state, startLine).trim()

  const match = lineText.match(/^:{3,}\s*example\s*(.*)$/)
  if (!match) return false

  let closingLine = -1

  for (let line = startLine + 1; line < endLine; line++) {
    const text = getLine(state, line).trim()
    if (/^:{3,}\s*$/.test(text)) {
      closingLine = line
      break
    }
  }

  if (closingLine === -1) return false
  if (silent) return true

  const params = match[1].trim()
  const isTabbed = /\btabbed\b/.test(params)
  const isStepped = /\bstepped\b/.test(params)
  const isPlain = /\bplain\b/.test(params)
  const isCentered = /\bcenter\b/.test(params)
  const isNoCode = /\bno-code\b/.test(params)
  const isRtl = /\brtl\b/.test(params)
  const isFit = /\bfit\b/.test(params)
  const isClosed = /\bclosed\b/.test(params)
  const widthMatch = params.match(/\bw-([\w-]+)\b/)
  const width = widthMatch ? widthMatch[1] : ''

  const vpExampleAttrs = params
    .replace(/\btabbed\b/, '')
    .replace(/\bstepped\b/, '')
    .replace(/\bplain\b/, '')
    .replace(/\bcenter\b/, '')
    .replace(/\bno-code\b/, '')
    .replace(/\brtl\b/, '')
    .replace(/\bfit\b/, '')
    .replace(/\bclosed\b/, '')
    .replace(/\bw-[\w-]+\b/, '')
    .trim()

  const contentStart = state.bMarks[startLine + 1]
  const contentEnd = state.bMarks[closingLine]
  const rawContent = state.src.slice(contentStart, contentEnd).trim()

  // Parse inner fenced code block
  const fenceMatch = rawContent.match(INNER_FENCE_RE)

  let content: string
  let fenceInfo: string

  if (fenceMatch) {
    const lang = fenceMatch[2] || 'vue'
    const meta = fenceMatch[3].trim()
    content = fenceMatch[4]
    fenceInfo = meta ? `${lang} ${meta}` : lang
  } else {
    content = rawContent
    fenceInfo = 'vue'
  }

  const expandedContent = expandBooleanShorthands(content)
  const liveContent = isTabbed
    ? `<VfForm :tabbed="true">\n${indent(expandedContent, 2)}\n</VfForm>`
    : isStepped
      ? `<VfForm :stepped="true">\n${indent(expandedContent, 2)}\n</VfForm>`
      : expandedContent

  const exampleToken = state.push('html_block', '', 0)
  exampleToken.map = [startLine, closingLine + 1]
  const attrParts = [
    width ? `width="${width}"` : '',
    isPlain ? 'plain' : '',
    isCentered ? 'center' : '',
    isRtl ? 'rtl' : '',
    isFit ? 'fit' : '',
    isClosed ? 'closed' : '',
    vpExampleAttrs,
  ]
    .filter(Boolean)
    .join(' ')

  exampleToken.content = `<VPExample${attrParts ? ` ${attrParts}` : ''}>\n${liveContent}\n</VPExample>\n`

  let followedByCode = false
  for (let line = closingLine + 1; line < endLine; line++) {
    const text = getLine(state, line).trim()
    if (text === '') continue
    followedByCode = /^`{3,}/.test(text) || /^:{3,}\s*code-group/.test(text)
    break
  }

  if (!followedByCode && !isNoCode) {
    const fenceToken = state.push('fence', 'code', 0)
    fenceToken.info = fenceInfo
    fenceToken.content = isTabbed
      ? `<VfForm tabbed>\n${indent(content, 2)}\n</VfForm>\n`
      : isStepped
        ? `<VfForm stepped>\n${indent(content, 2)}\n</VfForm>\n`
        : content + '\n'
    fenceToken.map = [startLine, closingLine + 1]
    fenceToken.markup = '```'
  }

  state.line = closingLine + 1
  return true
}
