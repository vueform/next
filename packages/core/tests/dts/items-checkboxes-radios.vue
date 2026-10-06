<script setup lang="ts">
/**
 * Vue-level items → model inference for VfCheckboxes / VfRadios. Validated by
 * `pnpm test:dts` (vue-sfc.test.ts typechecks the SFCs and reports each ✅/❌
 * case as a named test).
 */
import '@vueform/core/components'
import VfCheckboxes from '@vueform/core/components/VfCheckboxes'
import VfRadios from '@vueform/core/components/VfRadios'
import { ref } from 'vue'

const radiosOk = ref<1 | 2 | 3 | null>(1)
const radiosBad = ref('foo')
const checkboxesOk = ref<(1 | 2 | 3)[]>([1])
const checkboxesBad = ref(1)

/**
 * Consumes checkbox-slot props so vue-tsc checks they stay boolean literals.
 *
 * @param model The checkbox checked state.
 * @param trueValue Always `true` for holder children.
 * @param falseValue Always `false` for holder children.
 */
const assertCheckboxSlot = (
  model: boolean,
  trueValue: true,
  falseValue: false
) => [model, trueValue, falseValue]

/**
 * Rejects a checkbox-slot model that is not boolean.
 *
 * @param model An invalid model value.
 */
const rejectCheckboxModel = (model: 1) => model

/**
 * Consumes radio-slot props so vue-tsc checks holder defaults.
 *
 * @param model The radio model (`true` when selected, otherwise `null`).
 * @param value Always `true` for holder children.
 */
const assertRadioSlot = (model: true | null, value: true) => [model, value]

/**
 * Rejects a radio-slot model that is not `true | null`.
 *
 * @param model An invalid model value.
 */
const rejectRadioModel = (model: 1) => model
</script>

<template>
  <!-- radios: single Value | null -->
  <VfRadios name="r1" v-model="radiosOk" :items="[1, 2, 3] as const" />
  <!-- @vue-expect-error string model with number radios items -->
  <VfRadios name="r2" v-model="radiosBad" :items="[1, 2, 3] as const" />

  <!-- checkboxes: always Value[] -->
  <VfCheckboxes name="c1" v-model="checkboxesOk" :items="[1, 2, 3] as const" />
  <!-- @vue-expect-error single value with checkboxes -->
  <VfCheckboxes name="c2" v-model="checkboxesBad" :items="[1, 2, 3] as const" />

  <!-- itemValue key -->
  <VfRadios
    name="r3"
    :items="
      [
        { id: 1, label: 'A' },
        { id: 2, label: 'B' },
      ] as const
    "
    item-value="id"
    :model-value="1"
  />
  <VfCheckboxes
    name="c3"
    :items="
      [
        { id: 1, label: 'A' },
        { id: 2, label: 'B' },
      ] as const
    "
    item-value="id"
    :model-value="[1, 2]"
  />

  <!-- checkbox slot stays boolean; item shape is not passed as trueValue -->
  <VfCheckboxes name="c4" :items="[1, 2, 3] as const">
    <template #checkbox="p">
      {{ assertCheckboxSlot(p.model, p.trueValue, p.falseValue) }}
      <!-- @vue-expect-error model is boolean, not the item value -->
      {{ rejectCheckboxModel(p.model) }}
    </template>
  </VfCheckboxes>

  <!-- item slot replaces the whole VfCheckbox and receives ResolvedItem -->
  <VfCheckboxes name="c5" :items="[1, 2, 3] as const">
    <template #item="p">
      {{ p.item.value satisfies 1 | 2 | 3 }}
    </template>
  </VfCheckboxes>

  <!-- radio slot stays true | null; item shape is not passed as radioValue -->
  <VfRadios name="r4" :items="[1, 2, 3] as const">
    <template #radio="p">
      {{ assertRadioSlot(p.model, p.value) }}
      <!-- @vue-expect-error model is true | null, not the item value -->
      {{ rejectRadioModel(p.model) }}
    </template>
  </VfRadios>

  <!-- item slot replaces the whole VfRadio and receives ResolvedItem -->
  <VfRadios name="r5" :items="[1, 2, 3] as const">
    <template #item="p">
      {{ p.item.value satisfies 1 | 2 | 3 }}
    </template>
  </VfRadios>

  <!-- #template context is generic-aware (single Value | null) -->
  <VfRadios name="r6" :items="[1, 2, 3] as const">
    <template #template="{ context }">
      {{ context.model satisfies 1 | 2 | 3 | null }}
      {{ context.items[0].value satisfies 1 | 2 | 3 }}
    </template>
  </VfRadios>
  <VfRadios
    name="r7"
    :items="
      [
        { id: 1, label: 'A' },
        { id: 2, label: 'B' },
      ] as const
    "
    item-value="id"
  >
    <template #template="{ context }">
      {{ context.model satisfies 1 | 2 | null }}
      {{ context.items[0].value satisfies 1 | 2 }}
      <!-- @vue-expect-error model is not a string when itemValue is numeric -->
      {{ context.model satisfies string }}
    </template>
  </VfRadios>
</template>
