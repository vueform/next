<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'

interface SectionNode {
  key: string
  children?: SectionNode[]
  repeatable?: boolean
  callable?: boolean
  description?: string
}

const props = defineProps<{
  node: SectionNode
  isLast: boolean
  isRoot?: boolean
}>()

const highlightedKey = inject<Ref<string | null>>('highlightedKey')
const lockedKey = inject<Ref<string | null>>('lockedKey')
const tooltipAnchor = inject<Ref<HTMLElement | null>>('tooltipAnchor')
const tooltipFromHtml = inject<Ref<boolean>>('tooltipFromHtml')

const isLocked = computed(() => lockedKey?.value === props.node.key)
const isHighlighted = computed(
  () =>
    highlightedKey?.value === props.node.key ||
    lockedKey?.value === props.node.key
)

function highlight(key: string, e: Event) {
  if (highlightedKey) highlightedKey.value = key
  if (tooltipAnchor) tooltipAnchor.value = e.target as HTMLElement
  if (tooltipFromHtml) tooltipFromHtml.value = false
}

function clearHighlight() {
  if (highlightedKey) highlightedKey.value = null
  if (tooltipAnchor) tooltipAnchor.value = null
}

function toggleLock(key: string) {
  if (!lockedKey) return
  lockedKey.value = lockedKey.value === key ? null : key
}
</script>

<template>
  <li :class="['vp-tree-item', { 'is-last': isLast, 'is-root': isRoot }]">
    <span
      class="vp-tree-key"
      :class="{ 'is-locked': isLocked, 'is-highlighted': isHighlighted }"
      @mouseenter="highlight(node.key, $event)"
      @mouseleave="clearHighlight()"
      @click="toggleLock(node.key)"
    >
      <svg
        v-if="isLocked"
        class="vp-lock-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="10"
        height="10"
      >
        <path
          d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"
        />
      </svg>
      {{ node.key }}
      <!-- <span v-if="node.repeatable || node.callable" class="vp-tree-repeatable"
        >()</span> -->
    </span>
    <ul v-if="node.children?.length" class="vp-tree-children">
      <VPPartTree
        v-for="(child, i) in node.children"
        :key="child.key"
        :node="child"
        :is-last="i === node.children.length - 1"
      />
    </ul>
  </li>
</template>

<style scoped lang="scss">
.vp-tree-item {
  position: relative;
  padding-left: 12px;
  list-style: none;
  margin: 0;

  &:not(.is-root)::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 9px;
    height: 14px;
    border-left: 1px solid var(--vp-c-divider);
    border-bottom: 1px solid var(--vp-c-divider);
  }

  &:not(.is-root):not(.is-last)::after {
    content: '';
    position: absolute;
    top: 11px;
    left: 0;
    bottom: 0;
    border-left: 1px solid var(--vp-c-divider);
  }

  &.is-root {
    padding-left: 6px;
  }
}

.vp-tree-key {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  position: relative;
  font-size: 13px;
  line-height: 24px;
  cursor: pointer;
  color: var(--vp-c-black);
  opacity: 0.7;
  line-height: 1.6;
  font-size: 0.7em;
  font-weight: 600;
  border-radius: 4px;
  padding: 0px 6px;
  background-color: var(--vp-code-bg);
  transition:
    color 0.25s,
    background-color 0.5s;
  font-family: var(--vp-font-family-mono);

  &:hover,
  &.is-highlighted {
    color: var(--vp-c-brand-1);
    opacity: 1;
  }

  &.is-locked {
    color: var(--vp-c-brand-1);
    opacity: 1;
  }
}

.dark .vp-tree-key {
  color: var(--vp-c-text-1);

  &:hover,
  &.is-highlighted {
    color: var(--vp-c-brand-1);
    opacity: 1;
  }

  &.is-locked {
    color: var(--vp-c-brand-1);
    opacity: 1;
  }
}

.vp-lock-icon {
  flex-shrink: 0;
  position: absolute;
  left: -17px;
  top: 3px;
  z-index: 1;
}

.vp-tree-repeatable {
  font-size: 11px;
  opacity: 0.5;
  margin-left: 0;
}

.vp-tree-children {
  margin: 0;
  padding: 0;
}
</style>
