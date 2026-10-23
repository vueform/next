<script setup>
import { useData, onContentUpdated } from 'vitepress'
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  defineComponent,
  h,
} from 'vue'

import { useActiveTab } from '../composables/useActiveTab'

const { activeTabSlug, tabs } = useActiveTab()
const { frontmatter, theme } = useData()

const container = ref()
const marker = ref()

const outlineTitle = computed(() => {
  const outline = theme.value.outline
  if (typeof outline === 'object' && !Array.isArray(outline) && outline.label) {
    return outline.label
  }
  return theme.value.outlineTitle || 'On this page'
})

const filteredHeaders = ref([])

const ignoreRE = /\b(?:VPBadge|header-anchor|footnote-ref|ignore-header)\b/

function serializeHeader(el) {
  let ret = ''
  for (const node of el.childNodes) {
    if (node.nodeType === 1) {
      if (ignoreRE.test(node.className)) continue
      ret += node.textContent
    } else if (node.nodeType === 3) {
      ret += node.textContent
    }
  }
  return ret.trim()
}

// Resolves the page's outline range the same way the default theme does,
// so untabbed pages behave as before. null means the outline is disabled.
function resolveRange() {
  const outline = frontmatter.value.outline ?? theme.value.outline
  if (outline === false) return null
  const levels =
    (typeof outline === 'object' && !Array.isArray(outline)
      ? outline.level
      : outline) || 2
  if (levels === 'deep') return [2, 6]
  return typeof levels === 'number' ? [levels, levels] : levels
}

function buildTree(data, min, max) {
  const result = []
  const stack = []

  for (const item of data) {
    const node = { ...item, children: [] }
    let parent = stack[stack.length - 1]

    while (parent && parent.level >= node.level) {
      stack.pop()
      parent = stack[stack.length - 1]
    }

    if (node.element.classList.contains('ignore-header')) {
      stack.push({ level: node.level, shouldIgnore: true })
      continue
    }

    if (parent && 'shouldIgnore' in parent) {
      stack.push({ level: node.level, shouldIgnore: true })
      continue
    }

    if (node.level < min || node.level > max) continue

    if (parent) parent.children.push(node)
    else result.push(node)

    stack.push(node)
  }

  return result
}

function getHeaders() {
  const els = [
    ...document.querySelectorAll('.VPDoc :is(h1, h2, h3, h4, h5, h6)'),
  ].filter(
    (el) =>
      el.id &&
      el.hasChildNodes() &&
      // Headings rendered by live demos stay out of the outline.
      !el.closest('.vp-usage, .vp-example-wrapper')
  )

  const items = els.map((el) => ({
    element: el,
    title: serializeHeader(el),
    link: '#' + el.id,
    level: Number(el.tagName[1]),
    id: el.id,
  }))

  if (!tabs.length) {
    const range = resolveRange()
    return range ? buildTree(items, range[0], range[1]) : []
  }

  const slug = activeTabSlug.value

  return tabs.map((tab) => {
    const tabItems = items.filter((item) => item.id.startsWith(tab.slug + '.'))
    const withoutTabHeading = tabItems.filter(
      (item) => item.title.toLowerCase() !== tab.title.toLowerCase()
    )
    const isCurrentTab = tab.slug === slug
    const children = isCurrentTab ? buildTree(withoutTabHeading, 2, 3) : []
    const panel = document.querySelector(
      `.vp-tab-panel[data-slug="${tab.slug}"]`
    )

    return {
      title: tab.title,
      link: '#' + tab.slug,
      level: 2,
      element: panel,
      children,
      isTab: true,
      isCurrentTab,
    }
  })
}

function getAbsoluteTop(element) {
  let offsetTop = 0
  while (element !== document.body) {
    if (element === null) return NaN
    offsetTop += element.offsetTop
    element = element.offsetParent
  }
  return offsetTop
}

let prevActiveLink = null

function activateLink(hash) {
  if (prevActiveLink) {
    prevActiveLink.classList.remove('active')
  }

  if (hash == null) {
    prevActiveLink = null
  } else {
    prevActiveLink = container.value?.querySelector(
      `a[href="${decodeURIComponent(hash)}"]`
    )
  }

  if (prevActiveLink) {
    prevActiveLink.classList.add('active')
    marker.value.style.top = prevActiveLink.offsetTop + 7 + 'px'
    marker.value.style.opacity = '1'
  } else {
    marker.value.style.top = '33px'
    marker.value.style.opacity = '0'
  }
}

function setActiveLink() {
  if (!container.value || !marker.value) return

  const headers = filteredHeaders.value
    .flatMap(function collect(item) {
      if (item.isTab && !item.isCurrentTab) return []
      if (item.isTab && item.children?.length) {
        return item.children.flatMap(collect)
      }
      return [item, ...(item.children || []).flatMap(collect)]
    })
    .filter(({ element }) => element)
    .map(({ element, link }) => ({
      link,
      top: getAbsoluteTop(element),
    }))
    .filter(({ top }) => !Number.isNaN(top))
    .sort((a, b) => a.top - b.top)

  const currentTabLink = activeTabSlug.value ? `#${activeTabSlug.value}` : null

  if (!headers.length) {
    activateLink(currentTabLink)
    return
  }

  const scrollY = window.scrollY
  const innerHeight = window.innerHeight
  const offsetHeight = document.body.offsetHeight
  const isBottom = Math.abs(scrollY + innerHeight - offsetHeight) < 1

  if (scrollY < 1) {
    activateLink(currentTabLink)
    return
  }

  if (isBottom) {
    activateLink(headers[headers.length - 1].link)
    return
  }

  let activeLink = null
  for (const { link, top } of headers) {
    if (top > scrollY + 80) break
    activeLink = link
  }
  activateLink(activeLink ?? currentTabLink)
}

function throttle(fn, delay) {
  let timer = null
  let lastCall = 0
  return () => {
    const now = Date.now()
    const remaining = delay - (now - lastCall)
    if (remaining <= 0) {
      fn()
      lastCall = now
    } else if (!timer) {
      timer = setTimeout(() => {
        fn()
        lastCall = Date.now()
        timer = null
      }, remaining)
    }
  }
}

const onScroll = throttle(setActiveLink, 100)

function refresh() {
  filteredHeaders.value = getHeaders()
  nextTick(setActiveLink)
}

watch([activeTabSlug, () => tabs.map((tab) => tab.slug).join(',')], () => {
  nextTick(refresh)
})

onMounted(() => {
  refresh()
  window.addEventListener('scroll', onScroll)
})

onContentUpdated(() => {
  nextTick(refresh)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

// Recursive outline tree renderer
const VPOutlineItems = defineComponent({
  name: 'VPOutlineItems',
  props: {
    headers: { type: Array, required: true },
    root: { type: Boolean, default: true },
  },
  setup(props) {
    return () =>
      h(
        'ul',
        { class: props.root ? 'vp-outline-root' : 'vp-outline-nested' },
        props.headers.map((header) =>
          h('li', { class: { 'current-tab': header.isCurrentTab } }, [
            h(
              'a',
              {
                class: 'vp-outline-link',
                href: header.link,
                title: header.title,
                onClick: header.isTab
                  ? (e) => {
                      e.preventDefault()
                      if (location.hash !== header.link) {
                        history.replaceState(null, '', header.link)
                      }
                      window.dispatchEvent(new HashChangeEvent('hashchange'))
                    }
                  : undefined,
              },
              header.title
            ),
            header.children?.length
              ? h(VPOutlineItems, { headers: header.children, root: false })
              : null,
          ])
        )
      )
  },
})
</script>

<template>
  <div
    v-if="filteredHeaders.length"
    ref="container"
    class="vp-outline has-outline"
  >
    <div class="vp-outline-content">
      <div ref="marker" class="vp-outline-marker" />
      <div class="vp-outline-title" role="heading" aria-level="2">
        {{ outlineTitle }}
      </div>
      <nav aria-labelledby="doc-outline-aria-label">
        <span id="doc-outline-aria-label" class="visually-hidden">
          Table of Contents for current section
        </span>
        <VPOutlineItems :headers="filteredHeaders" />
      </nav>
    </div>
  </div>
</template>
