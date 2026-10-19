import type { ShikiTransformer } from 'shiki'

const HTML_NOTATION_RE =
  /\s*<!--\s*\[!code\s+(?:highlight|focus|error|warning|\+\+|--)(?::\d+)?\]\s*-->\s*$/
const JS_NOTATION_RE =
  /\s*\/\/\s*\[!code\s+((?:highlight|focus|error|warning|\+\+|--)(?::\d+)?)\]\s*$/

const NOTATION_CLASSES: Record<string, string[]> = {
  highlight: ['highlighted'],
  focus: ['has-focus'],
  error: ['highlighted', 'error'],
  warning: ['highlighted', 'warning'],
  '++': ['diff', 'add'],
  '--': ['diff', 'remove'],
}

/**
 * Shiki transformer that re-highlights the <template> section of Vue SFC code
 * blocks using the `vue-html` grammar, which provides richer expression
 * highlighting for bound props, directives, etc.
 *
 * `[!code …]` notations in the template need special care: the built-in
 * notation transformers run first and strip `<!-- [!code …] -->` comments
 * from the rendered lines (dropping lines that held nothing else), so the
 * re-highlighted content must mirror that or the markers reappear. The
 * `// [!code …]` form is plain text to the built-in transformers inside
 * HTML, so it is handled here instead: stripped from the content with its
 * line classes applied manually.
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

      const tplLines: string[] = []
      const pendingClasses = new Map<number, string[]>()

      for (const raw of lines.slice(templateStart + 1, templateEnd)) {
        const htmlMatch = raw.match(HTML_NOTATION_RE)
        if (htmlMatch) {
          const stripped = raw.slice(0, raw.length - htmlMatch[0].length)
          if (stripped.trim() === '') continue // builtin dropped the line
          tplLines.push(stripped)
          continue
        }

        const jsMatch = raw.match(JS_NOTATION_RE)
        if (
          jsMatch &&
          raw.slice(0, raw.length - jsMatch[0].length).trim() !== ''
        ) {
          const [, spec] = jsMatch
          const [command, count] = spec.split(':')
          const classes = NOTATION_CLASSES[command]
          if (classes) {
            const span = count ? parseInt(count, 10) : 1
            for (let n = 0; n < span; n++) {
              const idx = tplLines.length + n
              pendingClasses.set(idx, [
                ...(pendingClasses.get(idx) ?? []),
                ...classes,
              ])
            }
            tplLines.push(raw.slice(0, raw.length - jsMatch[0].length))
            continue
          }
        }

        tplLines.push(raw)
      }

      const contentToHighlight = tplLines.join('\n')
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
            const classes = pendingClasses.get(i)
            if (classes) {
              for (const cls of classes) {
                this.addClassToHast(origLines[origIdx] as any, cls)
              }
            }
          }
        }
      } catch {
        // Fall back to original highlighting if vue-html fails
      }
    },
  }
}
