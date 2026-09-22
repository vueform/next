import { onContentUpdated } from 'vitepress'
import { onMounted } from 'vue'

const chevronSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`

function initCollapsibleSections() {
  document
    .querySelectorAll<HTMLElement>('.collapsible-sections')
    .forEach((container) => {
      if (container.dataset.collapsibleInit) return
      container.dataset.collapsibleInit = '1'

      const children = Array.from(container.children) as HTMLElement[]
      const preamble: HTMLElement[] = []
      const sections: { heading: HTMLElement; content: HTMLElement[] }[] = []
      let current: { heading: HTMLElement; content: HTMLElement[] } | null =
        null

      for (const child of children) {
        if (/^H[1-6]$/.test(child.tagName)) {
          if (current) sections.push(current)
          current = { heading: child, content: [] }
        } else if (current) {
          current.content.push(child)
        } else {
          preamble.push(child)
        }
      }
      if (current) sections.push(current)

      while (container.firstChild) container.removeChild(container.firstChild)

      for (const el of preamble) container.appendChild(el)

      const defaultClosed = container.hasAttribute('data-closed')

      for (const section of sections) {
        const wrapper = document.createElement('div')
        wrapper.className = defaultClosed
          ? 'collapsible-section'
          : 'collapsible-section is-open'

        const header = document.createElement('div')
        header.className = 'collapsible-section-header'
        header.appendChild(section.heading)

        const body = document.createElement('div')
        body.className = 'collapsible-section-body'
        for (const el of section.content) body.appendChild(el)

        header.addEventListener('click', (e) => {
          if ((e.target as HTMLElement).closest('a.header-anchor')) return
          wrapper.classList.toggle('is-open')
        })

        wrapper.appendChild(header)
        wrapper.appendChild(body)
        container.appendChild(wrapper)
      }
    })
}

function initCollapsibleCodeBlocks() {
  document
    .querySelectorAll<HTMLPreElement>('pre[data-collapsed]')
    .forEach((pre) => {
      const wrapper = pre.closest<HTMLElement>('div[class*="language-"]')
      if (!wrapper || wrapper.classList.contains('collapsed-code')) return

      wrapper.classList.add('collapsed-code')

      const btn = document.createElement('button')
      btn.className = 'vp-code-toggle'
      btn.innerHTML = chevronSvg
      btn.addEventListener('click', () => wrapper.classList.toggle('expanded'))
      wrapper.appendChild(btn)
    })
}

/**
 * Activates collapsible sections and collapsed code blocks on mount and after
 * every content update.
 */
export function useCollapsibles() {
  onMounted(() => {
    initCollapsibleSections()
    initCollapsibleCodeBlocks()
  })
  onContentUpdated(() => {
    initCollapsibleSections()
    initCollapsibleCodeBlocks()
  })
}
