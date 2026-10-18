/**
 * Markdown-it plugin that turns special link syntaxes into popover- enabled
 * anchors:
 *
 * - `[!type:Pager](/reference/usePager#types.pager)` — link text starts with
 *   `!type:`, rendered as a type-snippet popover.
 * - `[name](!code "Type | string")` — href is `!code`, the link **title** carries
 *   the type shown in an inline code popover with "(property) name:" prefix.
 * - `[name](!value "expression")` — href is `!value`, the link **title** carries
 *   a plain value shown in an inline code popover without any prefix.
 * - `[`name`](!type "TypeName")` — href is `!type`, the link **title** carries a
 *   registered type name; rendered as inline code with the same `$type` popover
 *   the keyword auto-linker uses (full type snippet from
 *   `docs/types/<TypeName>.md`).
 * - `[`name`](#anchor "popover text")` — heading/tab hash link whose title
 *   becomes a text popover; the href is kept so the click still navigates.
 */
export function typeLinkPlugin(md: any) {
  md.core.ruler.push('type_links', (state: any) => {
    for (const blockToken of state.tokens) {
      if (blockToken.type !== 'inline' || !blockToken.children) continue

      const children: any[] = blockToken.children
      for (let i = 0; i < children.length; i++) {
        if (children[i].type !== 'link_open') continue

        const openToken = children[i]
        const href = openToken.attrGet('href') || ''

        // [!type:TypeName](/url) — type-snippet popover
        const textToken = children[i + 1]
        if (
          textToken?.type === 'text' &&
          textToken.content.startsWith('!type:')
        ) {
          const typeName = textToken.content.slice('!type:'.length)
          textToken.content = typeName

          openToken.attrSet('class', 'type-link')
          openToken.attrSet(
            'data-popover',
            JSON.stringify([{ type: '$type', content: typeName }])
          )
          continue
        }

        // [`name`](#anchor "popover text") — heading/tab link with text popover
        const title = openToken.attrGet('title') || ''
        if (href.startsWith('#') && title) {
          const codeToken = children[i + 1]
          if (codeToken?.type === 'code_inline') {
            openToken.attrSet(
              'data-popover',
              JSON.stringify([{ type: 'text', content: title }])
            )
            openToken.attrSet('class', 'keyword-link')
            const titleIdx = openToken.attrIndex('title')
            if (titleIdx >= 0) openToken.attrs.splice(titleIdx, 1)
            continue
          }
        }

        // [`name`](!code "type string") — inline code popover
        // [`name`](!code#anchor "type string") — with anchor id
        // [`name`](!value "expression") — plain value popover (no prefix)
        // [`name`](!type "TypeName") — $type snippet popover
        // Restructure from <a><code>name</code></a> to <code><a>name</a></code>
        const isCode = href === '!code' || href.startsWith('!code#')
        const isValue = href === '!value' || href.startsWith('!value#')
        const isType = href === '!type' || href.startsWith('!type#')
        if (isCode || isValue || isType) {
          const anchorId = href.includes('#')
            ? href.slice(href.indexOf('#') + 1)
            : ''
          const title = openToken.attrGet('title') || ''
          const codeToken = children[i + 1]
          const closeIdx = children.findIndex(
            (t: any, j: number) => j > i && t.type === 'link_close'
          )
          if (codeToken?.type !== 'code_inline' || closeIdx === -1) continue

          const cleanName = codeToken.content.replace(/\(\)$/, '')
          // Kebab-case keys (attribute names like `data-invalid`) render
          // camelCased in the popover code — quoting breaks the code styling.
          const codeName = cleanName.includes('-')
            ? cleanName.replace(/-([a-z0-9])/g, (_: string, c: string) =>
                c.toUpperCase()
              )
            : cleanName
          const popoverType = isType ? '$type' : isValue ? 'value' : 'code'

          let popoverItems: { type: string; content: string }[]
          if (isCode && title.includes('\t')) {
            const [typeStr, ...descParts] = title.split('\t')
            const desc = descParts.join('\t').trim()
            popoverItems = [{ type: 'code', content: `${codeName}: ${typeStr}` }]
            if (desc) popoverItems.push({ type: 'text', content: desc })
          } else {
            const popoverContent = isType
              ? title
              : isValue
                ? title
                : `${codeName}: ${title}`
            popoverItems = [{ type: popoverType, content: popoverContent }]
          }
          const popover = JSON.stringify(popoverItems)
          const escaped = popover
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')

          const escapedId = anchorId ? md.utils.escapeHtml(anchorId) : ''
          const idAttr = escapedId ? ` id="${escapedId}"` : ''
          const clickAttr = escapedId
            ? ` onclick="event.preventDefault();history.replaceState(null,null,'#${escapedId}')"`
            : ''
          const cls = isType ? 'keyword-link' : 'code-popover'
          const htmlToken = new state.Token('html_inline', '', 0)
          htmlToken.content =
            `<code><a class="${cls}"` +
            `${idAttr}${clickAttr}` +
            ` data-popover="${escaped}"` +
            `>${md.utils.escapeHtml(codeToken.content)}</a></code>`

          children.splice(i, closeIdx - i + 1, htmlToken)
        }
      }
    }
  })
}
