<script setup lang="ts">
import { TabularGridTester, defaultBindings } from '@vueform/utils/visual-test'
import { computed } from 'vue'

const params = new URLSearchParams(window.location.search)

const type = params.get('type') || 'text'
const combination = Number(params.get('combination') || 0)
const stacked = params.get('stacked') === '1'

const bindings = computed(() => ({
  ...defaultBindings,
  default: {
    ...defaultBindings.default,
    items: ['foo', 'bar', 'baz'],
  },
}))

const fillers = {
  middle: 'textarea',
  lower: 'text',
}
</script>

<template>
  <TabularGridTester
    :types="[type]"
    :type
    :combination
    :stacked
    :bindings
    :fillers
    :show-controls="false"
    :show-header="false"
  />
</template>

<style>
:root {
  --vf-radius: 20px;
}
</style>
