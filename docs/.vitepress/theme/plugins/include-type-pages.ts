import type { Plugin } from 'vite'

import { canonicalTypeName, typeFileBase } from './type-file-name'

const INCLUDE_RE = /(<!--\s*@include:\s*)(\S+?)\.md(\?\S+?)?(\s*-->)/g

/**
 * Vite pre-transform that lets authored pages include generated type pages by
 * symbol name (`types/defineConfig.md`) while the file on disk carries the
 * case-collision `_` suffix (`types/defineConfig_.md`, see
 * {@link typeFileBase}).
 *
 * Must be registered before `includeNolink` and `autoCollapseTypes`, which
 * read the directive's path as it appears on disk.
 */
export function includeTypePages(): Plugin {
  return {
    name: 'vitepress-include-type-pages',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.md')) return

      INCLUDE_RE.lastIndex = 0
      if (!INCLUDE_RE.test(code)) return
      INCLUDE_RE.lastIndex = 0

      return code.replace(INCLUDE_RE, (match, open, file, query, close) => {
        const m = file.match(/^(.*\btypes\/(?:[\w-]+\/)*)(\w+)$/)
        if (!m) return match

        // canonicalTypeName first keeps an already-suffixed path as-is.
        const base = typeFileBase(canonicalTypeName(m[2]))
        return `${open}${m[1]}${base}.md${query ?? ''}${close}`
      })
    },
  }
}
