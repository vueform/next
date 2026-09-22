import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import type { Plugin } from 'vite'

const includeParamsRE = /<!--\s*@include:\s*(\S+?\?\S+?)\s*-->/g

export function includeParams(): Plugin {
  return {
    name: 'vitepress-include-params',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.md')) return

      if (!includeParamsRE.test(code)) return
      includeParamsRE.lastIndex = 0

      const dir = dirname(id)

      const result = code.replace(includeParamsRE, (_, rawValue: string) => {
        const qIndex = rawValue.indexOf('?')
        const filePath = rawValue.slice(0, qIndex)
        const queryString = rawValue.slice(qIndex + 1)

        const params = new URLSearchParams(queryString)
        const fullPath = resolve(dir, filePath)

        const collapsed = params.has('collapsed')
        params.delete('collapsed')
        params.delete('expand')

        this.addWatchFile(fullPath)

        let content: string
        try {
          content = readFileSync(fullPath, 'utf-8')
        } catch {
          console.warn(`[include-params] Could not read: ${fullPath}`)
          return ''
        }

        for (const [key, value] of params) {
          content = content.replaceAll(`%${key}%`, value)
        }

        if (collapsed) {
          // Fences can be longer than ``` when the source contains a nested
          // code example (see `fenceTs` in the types generator).
          content = content.replace(/^(`{3,}\w+)(.*?)$/gm, (_, fence, rest) => {
            return rest ? `${fence}${rest} collapsed` : `${fence} collapsed`
          })
        }

        return content
      })

      return result
    },
  }
}
