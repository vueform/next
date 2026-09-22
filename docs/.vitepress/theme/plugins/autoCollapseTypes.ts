import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import type { Plugin } from 'vite'

const INCLUDE_RE = /<!--\s*@include:\s*(\S+?)\s*-->/g
const LINE_THRESHOLD = 30

/**
 * Vite pre-transform that automatically adds `?collapsed` to `@include`
 * directives pointing at type files (`types/*.md`, `types/blueprints/*.md`)
 * when the included file is longer than {@link LINE_THRESHOLD} lines.
 *
 * Use `?expand` on an include to opt out of auto-collapsing.
 */
export function autoCollapseTypes(): Plugin {
  return {
    name: 'vitepress-auto-collapse-types',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.md')) return

      INCLUDE_RE.lastIndex = 0
      if (!INCLUDE_RE.test(code)) return
      INCLUDE_RE.lastIndex = 0

      const dir = dirname(id)
      let changed = false

      const result = code.replace(INCLUDE_RE, (match, rawPath: string) => {
        const filePath = rawPath.split('?')[0]
        if (!filePath.includes('/types/')) return match
        if (rawPath.includes('collapsed') || rawPath.includes('expand'))
          return match

        const fullPath = resolve(dir, filePath)

        let content: string
        try {
          content = readFileSync(fullPath, 'utf-8')
        } catch {
          return match
        }

        const lineCount = content.split('\n').length
        if (lineCount <= LINE_THRESHOLD) return match

        changed = true

        if (rawPath.includes('?')) {
          return match.replace(rawPath, `${rawPath}&collapsed`)
        }
        return match.replace(rawPath, `${rawPath}?collapsed`)
      })

      return changed ? result : undefined
    },
  }
}
