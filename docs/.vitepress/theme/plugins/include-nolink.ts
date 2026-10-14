import type { Plugin } from 'vite'

const INCLUDE_RE = /<!--\s*@include:\s*(\S+?\.md)(?:\?\S+?)?\s*-->/g

/**
 * Vite pre-transform that wraps each `@include` directive with scoped nolink
 * markers so the included file's own name is only excluded from keyword linking
 * within the included content, not the entire host page.
 *
 * The markers are consumed and stripped by `autoPageNolink` (markdown-it core
 * rule) which applies scoped `nolink` to fences between each marker pair.
 */
export function includeNolink(): Plugin {
  return {
    name: 'vitepress-include-nolink',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.md')) return

      INCLUDE_RE.lastIndex = 0
      if (!INCLUDE_RE.test(code)) return

      INCLUDE_RE.lastIndex = 0
      return code.replace(INCLUDE_RE, (match, path) => {
        const basename = path.replace(/^.*\//, '').replace(/\.md$/, '')
        return `<!-- @nolink-scope: ${basename} -->\n${match}\n<!-- @nolink-scope-end -->`
      })
    },
  }
}
