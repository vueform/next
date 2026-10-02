<script setup lang="ts">
import {
  TabularMatrixTester,
  countries,
  defaultBindings,
} from '@vueform/utils/visual-test'
import { computed } from 'vue'

const params = new URLSearchParams(window.location.search)

const type = params.get('type') || 'auto-complete'
const combination = Number(params.get('combination') || 0)
const stacked = params.get('stacked') === '1'
const basic = params.get('basic') === '1'
const contentFiller = params.get('content') === '1'

const bindings = computed(() => ({
  ...defaultBindings,
  default: {
    ...defaultBindings.default,
    options: ['foo', 'bar', 'baz'],
    showUploadButton: true,
    mode: basic ? 'basic' : undefined,
  },
  'auto-complete': {
    suggestions: () => [
      { value: 'foo', label: 'foo' },
      { value: 'bar', label: 'bar' },
      { value: 'baz', label: 'baz' },
    ],
    optionLabel: 'label',
    dropdown: true,
    minLength: 1,
  },
  'cascade-select': {
    optionLabel: 'cname',
    optionValue: 'code',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: countries,
  },
  'select-button': {
    defaultValue: 'foo',
  },
  'toggle-button': {
    defaultValue: true,
  },
  knob: {
    defaultValue: 0,
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
    combination-type="input-number"
    :show-controls="false"
    :show-header="false"
  />
</template>

<style>
:root {
  --p-border-radius-md: 20px;
}
</style>
