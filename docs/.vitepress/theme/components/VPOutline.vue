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
const { theme } = useData()

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

function buildTree(data) {
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

    if (node.level < 2 || node.level > 3) continue

    if (parent) parent.children.push(node)
    else result.push(node)

    stack.push(node)
  }

  return result
}

function getHeaders() {
  if (!tabs.length) return []

  const els = [
    ...document.querySelectorAll('.VPDoc :is(h1, h2, h3, h4, h5, h6)'),
  ].filter((el) => el.id && el.hasChildNodes())

  const items = els.map((el) => ({
    element: el,
    title: serializeHeader(el),
    link: '#' + el.id,
    level: Number(el.tagName[1]),
    id: el.id,
  }))

  const slug = activeTabSlug.value

  return tabs.map((tab) => {
    const tabItems = items.filter((item) => item.id.startsWith(tab.slug + '.'))
    const withoutTabHeading = tabItems.filter(
      (item) => item.title.toLowerCase() !== tab.title.toLowerCase()
    )
    const isCurrentTab = tab.slug === slug
    const children = isCurrentTab ? buildTree(withoutTabHeading) : []
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
        { class: props.root ? 'root' : 'nested' },
        props.headers.map((header) =>
          h('li', { class: { 'current-tab': header.isCurrentTab } }, [
            h(
              'a',
              {
                class: 'outline-link',
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
    v-if="activeTabSlug && filteredHeaders.length"
    ref="container"
    class="VPOutlineCustom has-outline"
  >
    <div class="content">
      <div ref="marker" class="outline-marker" />
      <div class="outline-title" role="heading" aria-level="2">
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

<style>
.VPOutlineCustom {
  display: block;
}

.VPOutlineCustom .content {
  position: relative;
  border-left: 1px solid var(--vp-c-divider);
  padding-left: 16px;
  font-size: 13px;
  font-weight: 500;
}

.VPOutlineCustom .outline-marker {
  position: absolute;
  top: 32px;
  left: -1px;
  z-index: 0;
  opacity: 0;
  width: 2px;
  border-radius: 2px;
  height: 18px;
  background-color: var(--vp-c-brand-1);
  transition:
    top 0.25s cubic-bezier(0, 1, 0.5, 1),
    background-color 0.5s,
    opacity 0.25s;
}

.VPOutlineCustom .outline-title {
  line-height: 32px;
  font-size: 14px;
  font-weight: 600;
}

.VPOutlineCustom ul.root {
  list-style: none;
  padding: 0;
  margin: 0;
}

.VPOutlineCustom ul.nested {
  list-style: none;
  padding: 0 0 0 13px;
  margin: 0;
}

.VPOutlineCustom .outline-link {
  display: block;
  line-height: 32px;
  font-size: 14px;
  font-weight: 400;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.5s;
  text-decoration: none;
}

.VPOutlineCustom .outline-link:hover,
.VPOutlineCustom .outline-link.active {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.VPOutlineCustom .visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
