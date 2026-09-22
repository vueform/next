export function usagePlugin(md: any) {
  md.block.ruler.before('fence', 'usage', usageRule)
}

function getLine(state: any, line: number): string {
  const pos = state.bMarks[line] + state.tShift[line]
  const max = state.eMarks[line]
  return state.src.slice(pos, max)
}

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

interface FenceBlock {
  label: string
  lang: string
  content: string
}

function parseInnerFences(raw: string): FenceBlock[] {
  const blocks: FenceBlock[] = []
  const lines = raw.split('\n')
  let i = 0

  while (i < lines.length) {
    const openMatch = lines[i].match(
      /^(`{3,})(\w*(?:\{[^}]*\})?)\s*\[(\w+)\]\s*$/
    )
    if (openMatch) {
      const marker = openMatch[1]
      const lang = openMatch[2] || 'vue'
      const label = openMatch[3]
      const contentLines: string[] = []
      i++
      while (i < lines.length) {
        if (lines[i].trimEnd() === marker) {
          break
        }
        contentLines.push(lines[i])
        i++
      }
      blocks.push({ label, lang, content: contentLines.join('\n') })
    }
    i++
  }

  return blocks
}

function ensureTemplateWrapper(content: string): string {
  const trimmed = content.trim()

  // Full SFC with <script> and <template> — keep as-is
  if (/<script[\s>]/i.test(trimmed) && /<template[\s>]/i.test(trimmed)) {
    return trimmed
  }

  // Already wrapped in <template> — keep as-is
  if (/^<template[\s>]/i.test(trimmed) && /<\/template>\s*$/i.test(trimmed)) {
    return trimmed
  }

  const indented = trimmed
    .split('\n')
    .map((line) => (line.trim() ? `  ${line}` : line))
    .join('\n')

  return `<template>\n${indented}\n</template>`
}

/**
 * Extract only the template body from content that may be a full SFC.
 * Strips<script> blocks and <template> wrapper tags, returning just the inner
 * template content for live rendering.
 */
function extractTemplateBody(content: string): string {
  let result = content

  // Strip <script ...>...</script> blocks
  result = result.replace(/<script[\s\S]*?<\/script>/gi, '')

  // Extract content between <template> and </template> if present
  const templateMatch = result.match(/<template[^>]*>([\s\S]*)<\/template>/i)
  if (templateMatch) {
    result = templateMatch[1]
  }

  return result.trim()
}

function usageRule(
  state: any,
  startLine: number,
  endLine: number,
  silent: boolean
): boolean {
  const lineText = getLine(state, startLine).trim()

  const match = lineText.match(/^:{3,}\s*usage\s*(.*)$/)
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
  const isNoModel = /\bnomodel\b/.test(params)
  const isNoLive = /\bnolive\b/.test(params)
  const isNoCode = /\bnocode\b/.test(params)
  const isModel = /\bmodel\b/.test(params)
  const isValidate = /\bvalidate\b/.test(params)
  const isFit = /\bfit\b/.test(params)
  const isFull = /\bfull\b/.test(params)
  const isCenter = /\bcenter\b/.test(params)
  const isMiddle = /\bmiddle\b/.test(params)
  const isRtl = /\brtl\b/.test(params)
  const widthMatch = params.match(/\bw-([\w-]+)\b/)
  const width = widthMatch ? widthMatch[1] : ''

  const contentStart = state.bMarks[startLine + 1]
  const contentEnd = state.bMarks[closingLine]
  const rawContent = state.src.slice(contentStart, contentEnd).trim()

  const fences = parseInnerFences(rawContent)

  const previewBlock = fences.find((f) => f.label === 'Preview')
  let templateBlock = fences.find((f) => f.label === 'Template')
  const schemaBlock = fences.find((f) => f.label === 'Schema')
  const liveBlock = fences.find((f) => f.label === 'Live')

  if (!templateBlock && previewBlock) {
    templateBlock = {
      label: 'Template',
      lang: 'vue',
      content: previewBlock.content,
    }
  }

  if (templateBlock) {
    templateBlock = {
      ...templateBlock,
      content: ensureTemplateWrapper(templateBlock.content),
    }
  }

  let liveCode: string
  if (liveBlock) {
    liveCode = liveBlock.content.trim()
  } else if (templateBlock) {
    liveCode = extractTemplateBody(templateBlock.content)
  } else if (previewBlock) {
    liveCode = previewBlock.content.trim()
  } else {
    liveCode = ''
  }

  const expandedLiveCode = expandBooleanShorthands(liveCode)

  const attrParts = [
    isNoModel ? 'nomodel' : '',
    isNoLive ? 'nolive' : '',
    isNoCode ? 'nocode' : '',
    isModel ? 'model' : '',
    isValidate ? 'validate' : '',
    isFit ? 'fit' : '',
    isFull ? 'full' : '',
    isCenter ? 'center' : '',
    isMiddle ? 'middle' : '',
    isRtl ? 'rtl' : '',
    width ? `width="${width}"` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const usageToken = state.push('html_block', '', 0)
  usageToken.map = [startLine, closingLine + 1]
  usageToken.content = `<VPUsage${attrParts ? ` ${attrParts}` : ''}>\n${expandedLiveCode}\n</VPUsage>\n`

  if (!isNoCode) {
    const codesOpen = state.push('html_block', '', 0)
    codesOpen.content = '<div class="vp-usage-codes">\n'

    if (previewBlock) {
      const fence = state.push('fence', 'code', 0)
      fence.info = previewBlock.lang
      fence.content = previewBlock.content + '\n'
      fence.map = [startLine, closingLine + 1]
      fence.markup = '```'
    }

    if (templateBlock) {
      const fence = state.push('fence', 'code', 0)
      fence.info = templateBlock.lang
      fence.content = templateBlock.content + '\n'
      fence.map = [startLine, closingLine + 1]
      fence.markup = '```'
    }

    if (schemaBlock) {
      const fence = state.push('fence', 'code', 0)
      fence.info = schemaBlock.lang
      fence.content = schemaBlock.content + '\n'
      fence.map = [startLine, closingLine + 1]
      fence.markup = '```'
    }

    const codesClose = state.push('html_block', '', 0)
    codesClose.content = '</div>\n'
  }

  state.line = closingLine + 1
  return true
}
