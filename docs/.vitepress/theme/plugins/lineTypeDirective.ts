import type { Plugin } from 'vite'

const DIRECTIVE_RE = /\s*\/\/\s*\[!code\s+type=([^\]\n]+)\]\s*$/
const HAS_DIRECTIVE_RE = /\/\/\s*\[!code\s+type=/
const FENCE_RE = /^(```+|~~~+)/
const INLINE_CODE_RE = /`([^`\n]+)`/g
const IDENT_CHARS = '[A-Za-z0-9_$]'

/**
 * Vite pre-transform that processes a `// [!code type=name1:Type1,name2:Type2]`
 * directive placed at the end of a markdown line.
 *
 * For each matching line the directive is stripped and any inline-code spans
 * (`...`) on the same line have matched keywords replaced with a single raw
 * `<code>` element containing `<a class="keyword-link">` wrappers that show the
 * `$type` popover on hover.
 *
 * Lines inside fenced code blocks are skipped.
 */
export function lineTypeDirective(): Plugin {
  return {
    name: 'vitepress-line-type-directive',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.md')) return
      if (!HAS_DIRECTIVE_RE.test(code)) return

      const lines = code.split('\n')
      let inFence = false
      let changed = false

      for (let i = 0; i < lines.length; i++) {
        if (FENCE_RE.test(lines[i])) {
          inFence = !inFence
          continue
        }
        if (inFence) continue

        const line = lines[i]
        const m = line.match(DIRECTIVE_RE)
        if (!m) continue

        const pairs = parseDirective(m[1])
        if (pairs.length === 0) continue

        const before = line.slice(0, line.length - m[0].length)
        lines[i] = rewriteLine(before, pairs)
        changed = true
      }

      return changed ? lines.join('\n') : undefined
    },
  }
}

function parseDirective(spec: string): [string, string][] {
  const pairs: [string, string][] = []
  for (const part of spec.split(',')) {
    const colon = part.indexOf(':')
    if (colon === -1) continue
    const name = part.slice(0, colon).trim()
    const type = part.slice(colon + 1).trim()
    if (name && type) pairs.push([name, type])
  }
  pairs.sort((a, b) => b[0].length - a[0].length)
  return pairs
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

function rewriteLine(line: string, pairs: [string, string][]): string {
  const pattern = new RegExp(
    `(?<!${IDENT_CHARS})(${pairs.map(([k]) => escapeRe(k)).join('|')})(?!${IDENT_CHARS})`,
    'g'
  )
  const typeOf = new Map(pairs)

  return line.replace(INLINE_CODE_RE, (_match, content: string) => {
    pattern.lastIndex = 0
    if (!pattern.test(content)) return _match

    pattern.lastIndex = 0
    let html = ''
    let pos = 0
    let m: RegExpExecArray | null
    while ((m = pattern.exec(content)) !== null) {
      const key = m[1]
      const type = typeOf.get(key)!
      if (m.index > pos) {
        html += escapeHtml(content.slice(pos, m.index))
      }
      const popover = JSON.stringify([{ type: '$type', content: type }])
      html += `<a class="keyword-link" data-popover="${escapeHtml(popover)}">${escapeHtml(key)}</a>`
      pos = m.index + key.length
    }
    if (pos < content.length) {
      html += escapeHtml(content.slice(pos))
    }
    return `<code>${html}</code>`
  })
}
