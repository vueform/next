<script setup lang="ts">
/**
 * Vue-level options → model inference for listbox / multi-select /
 * select-button / checkbox-group / radio-button-group.
 */
import { ref } from 'vue'
import VfCheckboxGroup from '@/components/VfCheckboxGroup/unstyled'
import VfListbox from '@/components/VfListbox/unstyled'
import VfMultiSelect from '@/components/VfMultiSelect/unstyled'
import VfRadioButtonGroup from '@/components/VfRadioButtonGroup/unstyled'
import VfSelectButton from '@/components/VfSelectButton/unstyled'

const singleOk = ref<1 | 2 | 3 | null>(1)
const singleBad = ref('foo')
const multiOk = ref<(1 | 2 | 3)[]>([1])
const multiBad = ref(1)
</script>

<template>
  <VfListbox name="l1" v-model="singleOk" :options="[1, 2, 3]" />
  <!-- @vue-expect-error string model with number options -->
  <VfListbox name="l2" v-model="singleBad" :options="[1, 2, 3]" />
  <VfListbox
    name="l3"
    v-model="multiOk"
    :options="[1, 2, 3]"
    :multiple="true"
  />

  <VfSelectButton name="sb1" v-model="singleOk" :options="[1, 2, 3]" />
  <!-- @vue-expect-error string model with number options -->
  <VfSelectButton name="sb2" v-model="singleBad" :options="[1, 2, 3]" />
  <VfSelectButton
    name="sb3"
    v-model="multiOk"
    :options="[1, 2, 3]"
    :multiple="true"
  />

  <VfMultiSelect name="ms1" v-model="multiOk" :options="[1, 2, 3]" />
  <!-- @vue-expect-error single value when always multiple -->
  <VfMultiSelect name="ms2" v-model="multiBad" :options="[1, 2, 3]" />

  <VfCheckboxGroup name="cg1" v-model="multiOk" :options="[1, 2, 3]" />
  <!-- @vue-expect-error single value when always multiple -->
  <VfCheckboxGroup name="cg2" v-model="multiBad" :options="[1, 2, 3]" />

  <VfRadioButtonGroup name="rg1" v-model="singleOk" :options="[1, 2, 3]" />
  <!-- @vue-expect-error string model with number options -->
  <VfRadioButtonGroup name="rg2" v-model="singleBad" :options="[1, 2, 3]" />
</template>
