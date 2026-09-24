<script setup lang="ts">
/**
 * Vue-level options → selection-keys model inference for PrimeVue VfTreeSelect.
 */
import { ref } from 'vue'
import VfTreeSelect from '@/components/VfTreeSelect/unstyled'

const treeOptions = [
  {
    key: 'documents',
    label: 'Documents',
    children: [{ key: 'annual', label: 'Annual Report' }],
  },
] as const

const singleOk = ref<{ documents?: true; annual?: true }>({})
const singleBad = ref('documents')
const checkboxOk = ref<{
  documents?: { checked: boolean; partialChecked: boolean }
}>({})
const checkboxBad = ref<{ documents?: true }>({ documents: true })
</script>

<template>
  <VfTreeSelect
    name="t1"
    v-model="singleOk"
    :options="treeOptions"
    selection-mode="single"
  />
  <!-- @vue-expect-error string model with keys-map selection -->
  <VfTreeSelect
    name="t2"
    v-model="singleBad"
    :options="treeOptions"
    selection-mode="single"
  />

  <VfTreeSelect
    name="t3"
    v-model="checkboxOk"
    :options="treeOptions"
    selection-mode="checkbox"
  />
  <!-- @vue-expect-error true map with checkbox selectionMode -->
  <VfTreeSelect
    name="t4"
    v-model="checkboxBad"
    :options="treeOptions"
    selection-mode="checkbox"
  />
</template>
