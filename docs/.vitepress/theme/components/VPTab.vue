<script setup>
import { inject, computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  dropdown: { type: Boolean, default: false },
})

const { activeIndex, registerTab } = inject('vp-tabs')
const index = registerTab(props.title, props.slug, props.dropdown)
const isActive = computed(() => activeIndex.value === index)
</script>

<template>
  <div v-show="isActive" class="vp-tab-panel" role="tabpanel" :data-slug="slug">
    <slot />
  </div>
</template>
