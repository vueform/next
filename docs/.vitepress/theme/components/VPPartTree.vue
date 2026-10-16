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
