import { onContentUpdated } from 'vitepress'
import { onMounted } from 'vue'

import { typeFileBase } from '../plugins/type-file-name'

// ---------------------------------------------------------------------------
// Keyword popovers: hover cards for keyword links, nesting up to one popover
// level per hovered link, fed by pre-rendered /type-snippets payloads.
// ---------------------------------------------------------------------------

const snippetCache = new Map<string, Promise<string>>()
let hideTimer: ReturnType<typeof setTimeout> | null = null
let showTimer: ReturnType<typeof setTimeout> | null = null
const SHOW_DELAY = 50

interface PopoverLevel {
  container: HTMLDivElement
  content: HTMLDivElement
  arrow: HTMLDivElement
}

const popoverPool: PopoverLevel[] = []
let maxVisibleLevel = -1

function ensurePopoverLevel(level: number): PopoverLevel {
  if (popoverPool[level]) return popoverPool[level]

  const container = document.createElement('div')
  container.className = 'keyword-popover'
  container.style.zIndex = String(30 + level * 10)

  const content = document.createElement('div')
  content.className = 'keyword-popover-content'

  const arrow = document.createElement('div')
  arrow.className = 'keyword-popover-arrow'

  container.appendChild(content)
  container.appendChild(arrow)

  container.addEventListener('mouseenter', () => {
    cancelHide()
    hideLevelsAbove(level)
  })
  container.addEventListener('mouseleave', () => scheduleHideFrom(0))

  document.body.appendChild(container)

  const entry: PopoverLevel = { container, content, arrow }
  popoverPool[level] = entry
  return entry
}

function hideLevelsAbove(level: number) {
  for (let i = maxVisibleLevel; i > level; i--) {
    popoverPool[i]?.container.classList.remove('visible')
  }
  if (maxVisibleLevel > level) maxVisibleLevel = level
}

function scheduleHideFrom(level: number) {
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    hideTimer = null
    hideLevelsAbove(level - 1)
  }, 200)
}

function cancelHide() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function cancelShow() {
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }
}

function inlineCodeToHtml(text: string): string {
  return text
    .replace(/`([^`]+)`/g, (_, code) => {
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `<code>${escaped}</code>`
    })
    .replace(/\n/g, '<br>')
}

function fetchSnippet(name: string): Promise<string> {
  if (!snippetCache.has(name)) {
    snippetCache.set(
      name,
      fetch(`/type-snippets/${typeFileBase(name)}.html`)
        .then((r) => (r.ok ? r.text() : ''))
        .catch(() => '')
    )
  }
  return snippetCache.get(name)!
}

function positionPopover(anchor: HTMLElement, entry: PopoverLevel) {
  const pop = entry.container
  const arrow = entry.arrow
  const rect = anchor.getBoundingClientRect()
  const gap = 10
  const margin = 12
  const anchorCenter = rect.left + rect.width / 2

  pop.style.removeProperty('width')
  pop.style.width = 'max-content'
  pop.style.left = '0'
  pop.style.top = '0'
  pop.style.visibility = 'hidden'
  pop.style.display = 'block'
  const naturalWidth = Math.min(
    Math.ceil(pop.getBoundingClientRect().width),
    560
  )
  pop.style.removeProperty('visibility')
  pop.style.removeProperty('display')
  pop.style.width = `${naturalWidth}px`

  let left = rect.left
  if (left + naturalWidth > window.innerWidth - margin) {
    left = window.innerWidth - margin - naturalWidth
  }
  left = Math.max(margin, left)
  pop.style.left = `${left}px`

  const arrowLeft = anchorCenter - left
  arrow.style.left = `${Math.max(12, Math.min(arrowLeft, naturalWidth - 12))}px`

  pop.style.removeProperty('bottom')
  pop.style.removeProperty('top')
  arrow.classList.remove('top', 'bottom')

  const spaceBelow = window.innerHeight - rect.bottom - gap
  if (spaceBelow >= 300 || spaceBelow >= rect.top - gap) {
    pop.style.top = `${rect.bottom + gap}px`
    arrow.classList.add('top')
  } else {
    pop.style.bottom = `${window.innerHeight - rect.top + gap}px`
    arrow.classList.add('bottom')
  }
}

async function renderPopoverBlocks(
  blocks: { type: string; content: string }[]
): Promise<string> {
  const parts: string[] = []

  for (const block of blocks) {
    if (block.type === '$type') {
      const raw = await fetchSnippet(block.content)
      if (raw) {
        try {
          const data = JSON.parse(raw)
          parts.push(
            `<div class="popover-block popover-block-type">${data.codeHtml}</div>`
          )
          if (data.description) {
            const descHtml = inlineCodeToHtml(data.description.trim())
            parts.push(
              `<div class="popover-block popover-block-desc">${descHtml}</div>`
            )
          }
          for (const tag of data.tags || []) {
            parts.push(
              `<div class="popover-block popover-block-tag">` +
                `<span class="popover-tag-label">@${tag.tag}</span>` +
                (tag.name
                  ? ` <code class="popover-tag-name">${tag.name}</code>`
                  : '') +
                (tag.text?.trim()
                  ? ` <span class="popover-tag-text">&mdash; ${inlineCodeToHtml(tag.text.trim())}</span>`
                  : '') +
                `</div>`
            )
          }
        } catch {
          parts.push(
            `<div class="popover-block popover-block-type">${raw}</div>`
          )
        }
      }
    } else if (block.type === '$tokens' && block.content) {
      try {
        const tokens: {
          name: string
          popover?: { type: string; content: string }[]
          link?: string
        }[] = JSON.parse(block.content)
        if (tokens.length) {
          const tokenItems = tokens
            .map((t) => {
              if (t.popover) {
                const popoverStr = JSON.stringify(t.popover).replace(
                  /"/g,
                  '&quot;'
                )
                const href = t.link ? ` href="${t.link}"` : ''
                return `<code><a class="keyword-link"${href} data-popover="${popoverStr}">${t.name}</a></code>`
              }
              return `<code>${t.name}</code>`
            })
            .join('')
          parts.push(
            `<div class="popover-block popover-block-tokens">` +
              `<div class="popover-tokens-label">Tokens</div>` +
              `<div class="popover-tokens-list">${tokenItems}</div>` +
              `</div>`
          )
        }
      } catch {
        /* ignore parse errors */
      }
    } else if (block.type === '$classes' && block.content) {
      try {
        const classes: {
          name: string
          popover?: { type: string; content: string }[]
          link?: string
        }[] = JSON.parse(block.content)
        if (classes.length) {
          const classItems = classes
            .map((c) => {
              if (c.popover) {
                const popoverStr = JSON.stringify(c.popover).replace(
                  /"/g,
                  '&quot;'
                )
                const href = c.link ? ` href="${c.link}"` : ''
                return `<code><a class="keyword-link"${href} data-popover="${popoverStr}">${c.name}</a></code>`
              }
              return `<code>${c.name}</code>`
            })
            .join('')
          parts.push(
            `<div class="popover-block popover-block-classes">` +
              `<div class="popover-classes-label">Used by</div>` +
              `<div class="popover-classes-list">${classItems}</div>` +
              `</div>`
          )
        }
      } catch {
        /* ignore parse errors */
      }
    } else if (block.type === '$variants' && block.content) {
      try {
        const variants: {
          name: string
          popover?: { type: string; content: string }[]
          link?: string
        }[] = JSON.parse(block.content)
        if (variants.length) {
          const variantItems = variants
            .map((v) => {
              if (v.popover) {
                const popoverStr = JSON.stringify(v.popover).replace(
                  /"/g,
                  '&quot;'
                )
                const href = v.link ? ` href="${v.link}"` : ''
                return `<code><a class="keyword-link"${href} data-popover="${popoverStr}">${v.name}</a></code>`
              }
              return `<code>${v.name}</code>`
            })
            .join('')
          parts.push(
            `<div class="popover-block popover-block-variants">` +
              `<div class="popover-variants-label">Variants</div>` +
              `<div class="popover-variants-list">${variantItems}</div>` +
              `</div>`
          )
        }
      } catch {
        /* ignore parse errors */
      }
    } else if (block.type === '$github' && block.content) {
      const url = block.content
      const urlWithoutHash = url.replace(/#L\d+$/, '')
      const packagesIdx = urlWithoutHash.indexOf('packages/')
      const displayPath =
        packagesIdx !== -1
          ? urlWithoutHash.slice(packagesIdx + 'packages/'.length)
          : (urlWithoutHash.split('/').pop() ?? urlWithoutHash)
      parts.push(
        `<div class="popover-block popover-block-github">` +
          `Source: ` +
          `<svg class="popover-github-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg> ` +
          `<a class="popover-github-link" href="${url}" target="_blank" rel="noopener noreferrer">${displayPath}</a>` +
          `<svg class="popover-ext-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>` +
          `</div>`
      )
    } else if (block.type === 'code' || block.type === 'value') {
      const prefix = block.type === 'value' ? '_value/' : '_code/'
      const encoded = btoa(block.content)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
      const html = await fetchSnippet(`${prefix}${encoded}`)
      if (html)
        parts.push(
          `<div class="popover-block popover-block-type">${html}</div>`
        )
    } else {
      const textHtml = inlineCodeToHtml(block.content)
      parts.push(
        `<div class="popover-block popover-block-text">${textHtml}</div>`
      )
    }
  }

  return parts.join('<hr class="popover-divider">')
}

function unwrapSelfLinks(container: HTMLElement, keywordName: string) {
  container
    .querySelectorAll<HTMLAnchorElement>('a.keyword-link')
    .forEach((a) => {
      if (a.textContent?.trim() === keywordName) {
        a.replaceWith(...Array.from(a.childNodes))
      }
    })
}

async function showPopoverForLink(link: HTMLElement, level: number) {
  cancelHide()

  let blocks: { type: string; content: string }[]
  try {
    blocks = JSON.parse(link.dataset.popover!)
  } catch {
    return
  }

  const html = await renderPopoverBlocks(blocks)
  if (!html) return

  hideLevelsAbove(level)

  const entry = ensurePopoverLevel(level)
  entry.content.innerHTML = html

  const selfKeyword = link.textContent?.trim()
  if (selfKeyword) unwrapSelfLinks(entry.content, selfKeyword)

  positionPopover(link, entry)
  entry.container.classList.add('visible')
  maxVisibleLevel = level

  bindKeywordLinks(entry.content, level + 1)
}

function bindKeywordLinks(container: HTMLElement, nextLevel: number) {
  container.querySelectorAll<HTMLElement>('[data-popover]').forEach((link) => {
    if (link.dataset.popoverBound) return
    link.dataset.popoverBound = '1'

    link.addEventListener('mouseenter', () => {
      cancelShow()
      showTimer = setTimeout(
        () => showPopoverForLink(link, nextLevel),
        SHOW_DELAY
      )
    })
    link.addEventListener('mouseleave', () => {
      cancelShow()
      scheduleHideFrom(nextLevel)
    })
  })
}

export function initKeywordPopovers() {
  document.querySelectorAll<HTMLElement>('[data-popover]').forEach((link) => {
    if (link.closest('.keyword-popover')) return
    if (link.dataset.popoverBound) return
    link.dataset.popoverBound = '1'

    link.addEventListener('mouseenter', () => {
      cancelShow()
      showTimer = setTimeout(() => showPopoverForLink(link, 0), SHOW_DELAY)
    })
    link.addEventListener('mouseleave', () => {
      cancelShow()
      scheduleHideFrom(0)
    })
  })
}

/**
 * Binds keyword popovers on mount and after every content update (closing
 * anything left open from the previous page first).
 */
export function usePopovers() {
  onMounted(() => {
    initKeywordPopovers()
  })
  onContentUpdated(() => {
    cancelShow()
    cancelHide()
    hideLevelsAbove(-1)
    initKeywordPopovers()
  })
}
