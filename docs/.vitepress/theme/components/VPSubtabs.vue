<script setup>
import {
  ref,
  provide,
  reactive,
  onMounted,
  onUnmounted,
  nextTick,
  useTemplateRef,
} from 'vue'

const tabs = reactive([])
const activeIndex = ref(0)
const rootEl = useTemplateRef('root')

provide('vp-subtabs', {
  tabs,
  activeIndex,
  registerTab(title, slug) {
    const index = tabs.length
    tabs.push({ title, slug })
    return index
  },
})

// Slug of the VPTab panel this group is nested in, if any. Hashes are then
// written as `<tab>.<subtab>` so the parent VPTabs restores its tab too.
function parentTabSlug() {
  return rootEl.value?.closest('.vp-tab-panel')?.dataset.slug ?? null
}

function selectTab(i) {
  activeIndex.value = i
  const slug = tabs[i]?.slug
  if (slug) {
    const parent = parentTabSlug()
    history.replaceState(null, '', `#${parent ? `${parent}.` : ''}${slug}`)
  }
}

function resolveHash(hash) {
  // Tab-name hash: `#icons`, or `#tokens.css` when nested in a VPTab.
  const parent = parentTabSlug()
  const index = tabs.findIndex(
    (t) => hash === t.slug || (parent && hash === `${parent}.${t.slug}`)
  )
  if (index >= 0) return { index, target: rootEl.value }

  // Panels are hidden with v-show, so a hash pointing at an element inside
  // a non-active tab has no layout to scroll to. Activate the tab that owns
  // the hash target, then scroll to it once it is visible.
  const target = document.getElementById(hash)
  const panel = target?.closest('.vp-subtab-panel')
  if (!panel || panel.closest('.vp-subtabs') !== rootEl.value) return null

  const panels = Array.from(
    rootEl.value.querySelectorAll('.vp-subtab-panel')
  ).filter((el) => el.closest('.vp-subtabs') === rootEl.value)

  const panelIndex = panels.indexOf(panel)
  if (panelIndex < 0) return null

  return { index: panelIndex, target }
}

function handleHash() {
  const hash = decodeURIComponent(location.hash.slice(1))
  if (!hash) return

  const resolved = resolveHash(hash)
  if (!resolved) return

  activeIndex.value = resolved.index

  nextTick(() => {
    requestAnimationFrame(() => {
      const { target } = resolved
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
})
</script>

<template>
  <div ref="root" class="vp-subtabs">
    <div class="vp-subtabs-content">
      <slot />
    </div>
    <div class="vp-subtabs-header" role="tablist">
      <button
        v-for="(tab, i) in tabs"
        :key="i"
        role="tab"
        :aria-selected="activeIndex === i"
        :class="['vp-subtab-button', { active: activeIndex === i }]"
        @click="selectTab(i)"
      >
        {{ tab.title }}
      </button>
    </div>
  </div>
</template>

<style>
.vp-subtabs {
  display: flex;
  flex-direction: column;
}

.vp-subtabs-header {
  order: -1;
  display: flex;
  border-bottom: 1px solid var(--vp-c-divider);
  overflow-x: auto;
}

.vp-subtab-button {
  padding: 8px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-base);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition:
    color 0.25s,
    border-color 0.25s;
}

.vp-subtab-button:hover {
  color: var(--vp-c-text-1);
}

.vp-subtab-button.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}
</style>
