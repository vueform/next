import type { Element, ElementContent } from 'hast'
import type { ShikiTransformer } from 'shiki'

/**
 * Shiki transformer that highlights individual words/phrases inside code
 * blocks.
 *
 * Syntax (in the code-fence meta string, after the language):
 *
 * ```ts
 * const word = 'highlighted'
 * ```
 *
 * Multiple patterns are supported:
 *
 * ```ts
 * const foo = bar
 * ```
 *
 * The matched text receives a `highlighted-word` class styled with the same
 * background as VitePress's line highlight (`--vp-code-line-highlight-color`).
 */
export function wordHighlight(): ShikiTransformer {
  return {
    name: 'word-highlight',
    code(codeEl) {
      const raw = (this.options.meta as Record<string, unknown>)?.__raw as
        string | undefined
      if (!raw) return

      const words = parseWordPatterns(raw)
      if (words.length === 0) return

      const pattern = buildCombinedPattern(words)

      for (const line of codeEl.children) {
        if (line.type !== 'element') continue
        line.children = highlightInLine(line.children, pattern)
      }
    },
  }
}

function parseWordPatterns(meta: string): string[] {
  const words: string[] = []
  const re = /\/([^/]+)\//g
  let m
  while ((m = re.exec(meta)) !== null) {
    words.push(m[1])
  }
  return words
}

function buildCombinedPattern(words: string[]): RegExp {
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(`(${escaped.join('|')})`, 'g')
}

function highlightInLine(
  children: ElementContent[],
  pattern: RegExp
): ElementContent[] {
  const result: ElementContent[] = []

  for (const child of children) {
    if (child.type !== 'element' || child.tagName !== 'span') {
      result.push(child)
      continue
    }

    const textNode = child.children[0]
    if (!textNode || textNode.type !== 'text') {
      result.push(child)
      continue
    }

    const parts = splitText(textNode.value, pattern)

    if (parts.length === 1 && !parts[0].highlighted) {
      result.push(child)
      continue
    }

    for (const part of parts) {
      if (part.text === '') continue
      result.push(makeSpan(child, part.text, part.highlighted))
    }
  }

  return result
}

function splitText(
  text: string,
  pattern: RegExp
): { text: string; highlighted: boolean }[] {
  pattern.lastIndex = 0
  const parts: { text: string; highlighted: boolean }[] = []
  let lastIndex = 0
  let m

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, m.index), highlighted: false })
    }
    parts.push({ text: m[0], highlighted: true })
    lastIndex = m.index + m[0].length
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlighted: false })
  }

  return parts.length > 0 ? parts : [{ text, highlighted: false }]
}

function makeSpan(
  original: Element,
  text: string,
  highlighted: boolean
): Element {
  return {
    type: 'element',
    tagName: 'span',
    properties: {
      ...original.properties,
      ...(highlighted ? { class: 'highlighted-word' } : {}),
    },
    children: [{ type: 'text', value: text }],
  }
}
