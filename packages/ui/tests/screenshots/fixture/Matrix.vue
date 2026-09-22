<script setup lang="ts">
import { TabularMatrixTester, defaultBindings } from '@vueform/testing'
import { computed } from 'vue'

const params = new URLSearchParams(window.location.search)

const type = params.get('type') || 'text'
const combination = Number(params.get('combination') || 0)
const stacked = params.get('stacked') === '1'
const contentFiller = params.get('content') === '1'

const bindings = computed(() => ({
  ...defaultBindings,
  default: {
    ...defaultBindings.default,
    items: ['foo', 'bar', 'baz'],
  },
}))
</script>

<template>
  <TabularMatrixTester
    :types="[type]"
    :type
    :combination
    :stacked
    :content-filler="contentFiller"
    :bindings
    filler="textarea"
    :show-controls="false"
    :show-header="false"
  />
</template>

<style>
:root {
  --vf-radius: 20px;
}
</style>
