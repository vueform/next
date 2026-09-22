<script setup>
import { inject, computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  slug: { type: String, default: null },
})

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const { activeIndex, registerTab } = inject('vp-subtabs')
const slug = computed(() => props.slug ?? slugify(props.title))
const index = registerTab(props.title, slug.value)
const isActive = computed(() => activeIndex.value === index)
</script>

<template>
  <div
    v-show="isActive"
    class="vp-subtab-panel"
    role="tabpanel"
    :data-slug="slug"
  >
    <slot />
  </div>
</template>

<style>
.vp-subtab-panel > :first-child {
  margin-top: 16px;
  border-top: 0;
}

.vp-subtab-panel > :last-child {
  margin-bottom: 16px;
}
</style>
