import type { ShikiTransformer } from 'shiki'

/**
 * Shiki transformer that enables collapsible code blocks.
 *
 * Add `collapsed` to the fence meta to opt in:
 *
 *     ;```ts collapsed
 *     interface Pager { ... }
 *     ```
 *
 * The transformer marks the `<pre>` element with a `data-collapsed` attribute.
 * Client-side JS (in theme/index.ts) injects toggle buttons, and CSS handles
 * the max-height, gradient overlay, and chevron.
 */
export function collapsibleCode(): ShikiTransformer {
  return {
    name: 'collapsible-code',
    pre(preEl) {
      const meta = this.options.meta?.__raw || ''
      if (!meta.includes('collapsed')) return

      preEl.properties = {
        ...preEl.properties,
        'data-collapsed': '',
      }
    },
  }
}
