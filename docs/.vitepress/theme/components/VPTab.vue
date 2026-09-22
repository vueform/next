<script setup>
import { inject, computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  slug: { type: String, required: true },
})

const { activeIndex, registerTab } = inject('vp-tabs')
const index = registerTab(props.title, props.slug)
const isActive = computed(() => activeIndex.value === index)
</script>

<template>
  <div v-show="isActive" class="vp-tab-panel" role="tabpanel" :data-slug="slug">
    <slot />
  </div>
</template>

<style>
.vp-tab-button {
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

.vp-tab-button:hover {
  color: var(--vp-c-text-1);
}

.vp-tab-button.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.vp-tab-panel table {
  width: 100%;
}

.vp-tab-panel table td:first-child {
  width: 1%;
}

.vp-tab-panel > :first-child {
  margin-top: 16px;
  border-top: 0;
}

.vp-tab-panel > :last-child {
  margin-bottom: 16px;
}
</style>
