<script setup lang="ts">
/**
 * Vue-level suggestions → model inference for PrimeVue VfAutoComplete.
 */
import { ref } from 'vue'
import '@/components/VfAutoComplete/augment'
import VfAutoComplete from '@/components/VfAutoComplete/VfAutoComplete.vue'

const scalarOk = ref<1 | 2 | 3 | null>(1)
const scalarBad = ref('foo')
type Obj = { id: 1; label: 'A' } | { id: 2; label: 'B' }
const objOk = ref<Obj | null>({ id: 1, label: 'A' })
const objBad = ref(1)
const multiOk = ref<(1 | 2 | 3)[]>([1])
</script>

<template>
  <VfAutoComplete name="a1" v-model="scalarOk" :suggestions="[1, 2, 3]" />
  <!-- @vue-expect-error string model with number suggestions -->
  <VfAutoComplete name="a2" v-model="scalarBad" :suggestions="[1, 2, 3]" />

  <!-- object suggestions: whole item is the model -->
  <VfAutoComplete
    name="a3"
    v-model="objOk"
    :suggestions="[
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ]"
    option-label="label"
  />
  <!-- @vue-expect-error id alone is not the whole item -->
  <VfAutoComplete
    name="a4"
    v-model="objBad"
    :suggestions="[
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ]"
    option-label="label"
  />

  <VfAutoComplete
    name="a5"
    v-model="multiOk"
    :suggestions="[1, 2, 3]"
    :multiple="true"
  />
</template>
