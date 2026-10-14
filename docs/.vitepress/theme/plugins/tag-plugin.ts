import type { Plugin } from 'vite'

const TAG_RE = /<!--\s*\[#(\w+)\s+(.+?)\]\s*-->/g

export function tagPlugin(): Plugin {
  return {
    name: 'vitepress-tag',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.md')) return

      TAG_RE.lastIndex = 0
      if (!TAG_RE.test(code)) return

      TAG_RE.lastIndex = 0
      return code.replace(TAG_RE, (_, color, text) => {
        return `<span class="vp-tag vp-tag-${color}">${text}</span>`
      })
    },
  }
}
