<script setup>
import {
  ref,
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

function syncOutlineTabs() {
  outlineTabs.splice(0, outlineTabs.length, ...tabs)
}

provide('vp-tabs', {
  tabs,
  activeIndex,
  registerTab(title, slug) {
    const index = tabs.length
    tabs.push({ title, slug })
    syncOutlineTabs()
    if (index === 0) activeTabSlug.value = slug
    return index
  },
})

watch(activeIndex, (i) => {
  activeTabSlug.value = tabs[i]?.slug ?? null
})

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
})

onUnmounted(() => {
  window.removeEventListener('hashchange', handleHash)
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
    <div class="vp-tabs-header" role="tablist">
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
    </div>
  </div>
</template>

<style>
.vp-tabs {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}

.vp-tabs-header {
  order: -1;
  display: flex;
  border-bottom: 1px solid var(--vp-c-divider);
  overflow-x: auto;
}

@media (max-width: 639px) {
  .vp-tabs-header {
    flex-direction: column;
    border-bottom: none;
    border-left: 1px solid var(--vp-c-divider);
    overflow-x: visible;
  }

  .vp-tab-button {
    text-align: left;
    border-bottom: none !important;
    border-left: 2px solid transparent;
    margin-left: -1px;
  }

  .vp-tab-button.active {
    border-left-color: var(--vp-c-brand-1);
    border-bottom-color: transparent;
  }
}
</style>
