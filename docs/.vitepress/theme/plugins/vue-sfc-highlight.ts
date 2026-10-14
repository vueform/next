import type { ShikiTransformer } from 'shiki'

/**
 * Shiki transformer that re-highlights the <template> section of Vue SFC code
 * blocks using the `vue-html` grammar, which provides richer expression
 * highlighting for bound props, directives, etc.
 *
 * Requires `vue-html` to be loaded via `shikiSetup` in the VitePress config.
 */
export function vueSfcHighlight(): ShikiTransformer {
  return {
    name: 'vue-sfc-highlight',
    root(_hast) {
      if (this.options.lang !== 'vue') return

      const source = this.source
      const lines = source.split('\n')

      // Look for a root-level SFC <template> (no indentation, no slot syntax)
      let templateStart = -1
      let templateEnd = -1

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (
          templateStart === -1 &&
          /^<template(\s|>)/.test(line) &&
          !/#|v-slot/.test(line)
        ) {
          templateStart = i
        }
        if (templateStart !== -1 && /^<\/template\s*>/.test(line)) {
          templateEnd = i
        }
      }

      const isSfc =
        templateStart !== -1 &&
        templateEnd !== -1 &&
        templateEnd > templateStart + 1

      // Script-only / style-only Vue fences must keep Shiki's Vue highlighting.
      // Re-running the whole source as `vue-html` would strip TS/JS coloring.
      if (!isSfc) return

      const tag = lines[templateStart]
      if (/lang\s*=/.test(tag) && !/lang\s*=\s*["']html["']/.test(tag)) return

      const contentToHighlight = lines
        .slice(templateStart + 1, templateEnd)
        .join('\n')
      const startLineIdx = templateStart + 1

      try {
        const reHast = this.codeToHast(contentToHighlight, {
          ...this.options,
          lang: 'vue-html' as any,
          transformers: [],
        })

        const rePreEl = reHast.children.find(
          (c) => c.type === 'element' && c.tagName === 'pre'
        )
        if (!rePreEl || rePreEl.type !== 'element') return

        const reCodeEl = rePreEl.children.find(
          (c) => c.type === 'element' && c.tagName === 'code'
        )
        if (!reCodeEl || reCodeEl.type !== 'element') return

        const reLines = reCodeEl.children.filter((c) => c.type === 'element')
        const origLines = this.lines

        for (let i = 0; i < reLines.length; i++) {
          const origIdx = startLineIdx + i
          if (origIdx < origLines.length && reLines[i].type === 'element') {
            origLines[origIdx].children = reLines[i].children
          }
        }
      } catch {
        // Fall back to original highlighting if vue-html fails
      }
    },
  }
}
