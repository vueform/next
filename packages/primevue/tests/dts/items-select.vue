<script setup lang="ts">
/**
 * Vue-level options → model inference for PrimeVue VfSelect.
 */
import { ref } from 'vue'
import VfSelect from '@/components/VfSelect/unstyled'

const ok = ref<1 | 2 | 3 | null>(1)
const bad = ref('foo')
const multiOk = ref<(1 | 2 | 3)[]>([1])
</script>

<template>
  <VfSelect name="s1" v-model="ok" :options="[1, 2, 3]" />
  <!-- @vue-expect-error string model with number options -->
  <VfSelect name="s2" v-model="bad" :options="[1, 2, 3]" />

  <VfSelect
    name="s3"
    :options="[
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ]"
    option-value="id"
    :model-value="1"
  />

  <VfSelect name="s4" v-model="multiOk" :options="[1, 2, 3]" :multiple="true" />
</template>
