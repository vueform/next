import { onContentUpdated } from 'vitepress'
import { onMounted } from 'vue'

function correctScroll() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const hash = decodeURIComponent(location.hash).slice(1)
      if (!hash) return
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
  })
}

function initScrollOffset() {
  document.addEventListener('click', (e) => {
    const link = (e.target as Element)?.closest?.('a[href^="#"]')
    if (link) correctScroll()
  })

  window.addEventListener('hashchange', correctScroll)

  if (location.hash) correctScroll()
}

function scrollSidebarToActiveLink() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const activeItem = document.querySelector<HTMLElement>(
        '.VPSidebar .VPSidebarItem.is-active'
      )
      if (!activeItem) return

      const sidebar = activeItem.closest<HTMLElement>('.VPSidebar')
      if (!sidebar) return

      const sidebarRect = sidebar.getBoundingClientRect()
      const itemRect = activeItem.getBoundingClientRect()

      const isVisible =
        itemRect.top >= sidebarRect.top && itemRect.bottom <= sidebarRect.bottom

      if (!isVisible) {
        sidebar.scrollTop +=
          itemRect.top -
          sidebarRect.top -
          sidebarRect.height / 2 +
          itemRect.height / 2
      }
    })
  })
}

/**
 * Smooth-scroll correction for anchor navigation and keeping the sidebar's
 * active link in view.
 */
export function useSidebarScroll() {
  onMounted(() => {
    initScrollOffset()
    scrollSidebarToActiveLink()
  })
  onContentUpdated(() => {
    scrollSidebarToActiveLink()
  })
}
