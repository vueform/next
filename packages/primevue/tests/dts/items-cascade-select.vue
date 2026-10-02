<script setup lang="ts">
/**
 * Vue-level options → model inference for PrimeVue VfCascadeSelect.
 */
import VfCascadeSelect from '@vueform/primevue/components/VfCascadeSelect/unstyled'
import { ref } from 'vue'

const cascadeOptions = [
  {
    name: 'Australia',
    code: 'AU',
    states: [
      {
        name: 'New South Wales',
        cities: [
          { cname: 'Sydney', code: 'A-SY' },
          { cname: 'Newcastle', code: 'A-NE' },
        ],
      },
    ],
  },
] as const

const codeOk = ref<'AU' | null>('AU')
const codeBad = ref(123)
</script>

<template>
  <VfCascadeSelect
    name="c1"
    v-model="codeOk"
    :options="cascadeOptions"
    option-label="name"
    option-value="code"
    :option-group-children="['states', 'cities']"
  />
  <!-- @vue-expect-error number model with string code -->
  <VfCascadeSelect
    name="c2"
    v-model="codeBad"
    :options="cascadeOptions"
    option-label="name"
    option-value="code"
    :option-group-children="['states', 'cities']"
  />
</template>
