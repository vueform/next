<script setup>
import {
  ref,
  computed,
  provide,
  reactive,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  useTemplateRef,
} from 'vue'

import { useActiveTab } from '../composables/useActiveTab'

const { activeTabSlug, tabs: outlineTabs } = useActiveTab()

const tabs = reactive([])
const activeIndex = ref(0)
const rootEl = useTemplateRef('root')
const headerEl = useTemplateRef('header')
// Keyed 'measureRow', not 'measure' — a string ref naming an existing
// setup binding (the measure() function) trips Vue's non-ref-value warning.
const measureEl = useTemplateRef('measureRow')

function syncOutlineTabs() {
  outlineTabs.splice(0, outlineTabs.length, ...tabs)
}

provide('vp-tabs', {
  tabs,
  activeIndex,
  registerTab(title, slug, dropdown = false) {
    const index = tabs.length
    tabs.push({ title, slug, dropdown })
    syncOutlineTabs()
    if (index === 0) activeTabSlug.value = slug
    return index
  },
})

watch(activeIndex, (i) => {
  activeTabSlug.value = tabs[i]?.slug ?? null
})

// ========== OVERFLOW / DROPDOWN ==========

/**
 * Tabs competing for the bar, with their original indices. Tabs flagged
 * `dropdown` (a `...` suffix on the markdown tab name) never enter the bar.
 */
const barTabs = computed(() =>
  tabs.map((tab, i) => ({ ...tab, i })).filter((tab) => !tab.dropdown)
)

const forcedTabs = computed(() =>
  tabs.map((tab, i) => ({ ...tab, i })).filter((tab) => tab.dropdown)
)

/**
 * How many bar tabs currently fit; the rest overflow into the dropdown.
 * Starts at Infinity so SSR / pre-measure renders show every bar tab.
 */
const visibleCount = ref(Infinity)

/**
 * Below 640px the header stacks vertically (see _tabs.scss), so every tab —
 * forced ones included — renders as a plain list and the dropdown is off.
 */
const isMobile = ref(false)

const shownBarTabs = computed(() =>
  visibleCount.value >= barTabs.value.length
    ? barTabs.value
    : barTabs.value.slice(0, visibleCount.value)
)

/**
 * Dropdown content in document order: overflown bar tabs first (they precede
 * the trailing forced tabs in the markup), then the always-dropdown ones.
 */
const dropdownTabs = computed(() =>
  [...barTabs.value.slice(visibleCount.value), ...forcedTabs.value].sort(
    (a, b) => a.i - b.i
  )
)

const menuOpen = ref(false)
const menuEl = useTemplateRef('menu')
const moreWrapperEl = useTemplateRef('moreWrapper')

/**
 * Horizontal shift applied to the open dropdown: it sits flush with the
 * trigger's left edge, pulled left only as far as needed to keep its right
 * edge inside the tabs container.
 */
const menuOffset = ref(0)

function positionMenu() {
  if (
    !menuOpen.value ||
    !menuEl.value ||
    !moreWrapperEl.value ||
    !headerEl.value
  ) {
    return
  }

  const headerRect = headerEl.value.getBoundingClientRect()
  const wrapperRect = moreWrapperEl.value.getBoundingClientRect()
  const overflow =
    wrapperRect.left + menuEl.value.offsetWidth - headerRect.right

  menuOffset.value = overflow > 0 ? -overflow : 0
}

watch(menuOpen, (open) => {
  if (open) {
    menuOffset.value = 0
    nextTick(positionMenu)
  }
})

const dropdownHoldsActive = computed(() =>
  dropdownTabs.value.some((tab) => tab.i === activeIndex.value)
)

function measure() {
  if (isMobile.value || !headerEl.value || !measureEl.value) return

  const containerWidth = headerEl.value.clientWidth
  if (!containerWidth) return

  const buttons = Array.from(
    measureEl.value.querySelectorAll('.vp-tab-button:not(.vp-tabs-more)')
  )
  const moreButton = measureEl.value.querySelector('.vp-tabs-more')
  const moreWidth = moreButton ? moreButton.offsetWidth : 0
  const widths = buttons.map((el) => el.offsetWidth)
  const total = widths.reduce((sum, width) => sum + width, 0)

  // Without forced tabs the "..." trigger only exists when the bar actually
  // overflows; with them it is always there and always costs its width.
  if (!forcedTabs.value.length && total <= containerWidth) {
    visibleCount.value = widths.length
    return
  }

  let used = moreWidth
  let count = 0
  for (const width of widths) {
    if (used + width > containerWidth) break
    used += width
    count++
  }
  visibleCount.value = count

  nextTick(positionMenu)
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function selectFromMenu(i) {
  menuOpen.value = false
  selectTab(i)
}

function handleDocumentClick(e) {
  if (!menuOpen.value) return
  if (headerEl.value && !headerEl.value.contains(e.target)) {
    menuOpen.value = false
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape') menuOpen.value = false
}

let resizeObserver = null
let mobileQuery = null

const handleMobileChange = (e) => {
  isMobile.value = e.matches
  if (!e.matches) nextTick(measure)
}

watch(
  () => tabs.length,
  () => nextTick(measure)
)

// =========== TAB SELECTION ============

function selectTab(i) {
  activeIndex.value = i
  if (tabs[i]) {
    history.replaceState(null, '', `#${tabs[i].slug}`)
  }
}

function resolveHash(hash) {
  const dotIndex = hash.indexOf('.')
  if (dotIndex >= 0) {
    const tabSlug = hash.slice(0, dotIndex)
    const tabIndex = tabs.findIndex((t) => t.slug === tabSlug)
    if (tabIndex >= 0) return { tabIndex, headingId: hash }
  }

  // Fallback: match dash-separated hash against known tab slugs.
  // A hash like "types-pager" is matched as tab "types" + heading "types.pager".
  for (let i = 0; i < tabs.length; i++) {
    const prefix = tabs[i].slug + '-'
    if (hash.startsWith(prefix)) {
      const headingId = tabs[i].slug + '.' + hash.slice(prefix.length)
      if (document.getElementById(headingId)) {
        return { tabIndex: i, headingId }
      }
    }
  }

  // Tab-only hash (no heading)
  const tabIndex = tabs.findIndex((t) => t.slug === hash)
  if (tabIndex >= 0) return { tabIndex, headingId: null }

  return null
}

function handleHash() {
  const hash = decodeURIComponent(location.hash.slice(1))
  if (!hash) return

  const resolved = resolveHash(hash)
  if (!resolved) return

  activeIndex.value = resolved.tabIndex

  nextTick(() => {
    requestAnimationFrame(() => {
      const target = resolved.headingId
        ? document.getElementById(resolved.headingId)
        : rootEl.value

      if (!target) return

      const rect = target.getBoundingClientRect()
      const isVisible = rect.top >= -10 && rect.top < window.innerHeight * 0.5

      if (!isVisible) {
        target.scrollIntoView({ block: 'start' })
      }
    })
  })
}

onMounted(() => {
  handleHash()
  window.addEventListener('hashchange', handleHash)
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)

  mobileQuery = window.matchMedia('(max-width: 639px)')
  isMobile.value = mobileQuery.matches
  mobileQuery.addEventListener('change', handleMobileChange)

  resizeObserver = new ResizeObserver(() => measure())
  if (headerEl.value) resizeObserver.observe(headerEl.value)
  if (measureEl.value) resizeObserver.observe(measureEl.value)

  nextTick(measure)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', handleHash)
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
  mobileQuery?.removeEventListener('change', handleMobileChange)
  resizeObserver?.disconnect()
  if (outlineTabs[0] && tabs.includes(outlineTabs[0])) {
    outlineTabs.length = 0
    activeTabSlug.value = null
  }
})
</script>

<template>
  <div ref="root" class="vp-tabs">
    <div class="vp-tabs-content">
      <slot />
    </div>
    <div ref="header" class="vp-tabs-header" role="tablist">
      <template v-if="isMobile">
        <button
          v-for="(tab, i) in tabs"
          :key="i"
          role="tab"
          :aria-selected="activeIndex === i"
          :class="['vp-tab-button', { active: activeIndex === i }]"
          @click="selectTab(i)"
        >
          {{ tab.title }}
        </button>
      </template>
      <template v-else>
        <button
          v-for="tab in shownBarTabs"
          :key="tab.i"
          role="tab"
          :aria-selected="activeIndex === tab.i"
          :class="['vp-tab-button', { active: activeIndex === tab.i }]"
          @click="selectTab(tab.i)"
        >
          {{ tab.title }}
        </button>
        <div
          v-if="dropdownTabs.length"
          ref="moreWrapper"
          class="vp-tabs-more-wrapper"
        >
          <button
            :class="[
              'vp-tab-button',
              'vp-tabs-more',
              { active: dropdownHoldsActive },
            ]"
            aria-haspopup="menu"
            :aria-expanded="menuOpen"
            aria-label="More tabs"
            @click.stop="toggleMenu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
          <div
            v-if="menuOpen"
            ref="menu"
            class="vp-tabs-dropdown"
            role="menu"
            :style="{ left: `${menuOffset}px` }"
          >
            <button
              v-for="tab in dropdownTabs"
              :key="tab.i"
              role="menuitem"
              :class="[
                'vp-tabs-dropdown-item',
                { active: activeIndex === tab.i },
              ]"
              @click="selectFromMenu(tab.i)"
            >
              {{ tab.title }}
            </button>
          </div>
        </div>
      </template>
      <div ref="measureRow" class="vp-tabs-measure" aria-hidden="true">
        <button
          v-for="tab in barTabs"
          :key="tab.i"
          class="vp-tab-button"
          tabindex="-1"
        >
          {{ tab.title }}
        </button>
        <button class="vp-tab-button vp-tabs-more" tabindex="-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
