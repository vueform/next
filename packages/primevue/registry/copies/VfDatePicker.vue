<script
  setup
  lang="ts"
  generic="TSelectionMode extends DatePickerSelectionModeProp = undefined"
>
/**
 * Local copy of VfDatePicker of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  inputAria,
  vdomPrime,
} from '@vueform/primevue'
import type { DatePickerSelectionModeProp } from '@vueform/primevue/blueprints/date-picker'
import {
  blueprint,
  defaults,
  type VfDatePickerEmits,
  type VfDatePickerProps,
  type VfDatePickerSlots,
} from '@vueform/primevue/components/VfDatePicker'
import PrimeDatePicker from 'primevue/datepicker'
import type { ComputedRef, WritableComputedRef } from 'vue'

const DatePicker = vdomPrime(PrimeDatePicker)

defineOptions({
  name: 'VfDatePicker',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfDatePickerEmits<TSelectionMode>>()

const props = withDefaults(
  defineProps<VfDatePickerProps<TSelectionMode>>(),
  defaults
)
const events = defineEvents<VfDatePickerEmits<TSelectionMode>>()
const slots = defineSlots<VfDatePickerSlots<TSelectionMode>>()

const {
  api,
  context,
  expose,
  outlets,
  bindings,
  useClasses,
  useModifiers,
  useA11y,
} = useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-date-picker',
}))

useModifiers(({ help, hasError }) => ({
  root: {
    'data-align-label': !help.value ? '' : undefined,
  },
  input: {
    'data-invalid': hasError.value ? '' : undefined,
  },
}))

useA11y(inputAria())

const {
  value,
  id,
  readonly,
  placeholder,
  viewLoaded,
  disabled,
  inputRef,
  name,
  tooltipModifiers,
  tooltipValue,
  invalid,
  selectionMode,
  minDate,
  maxDate,
  forwardProps,
  forwardSlots,
  handleFocus,
  handleBlur,
  handleInput,
} = api

/**
 * PrimeVue DatePicker types `modelValue` as `Date | Date[] | (Date | null)[]`.
 * The element's `value` is `string | string[] | null`, which is the same
 * runtime binding as before — this assertion is type-only.
 */
const inputValue = value as WritableComputedRef<
  Date | Date[] | (Date | null)[] | null | undefined
>

/**
 * PrimeVue DatePicker types `selectionMode` as a hinted `'single' | 'multiple'
 *
 * | 'range'` string. The resolved ref is the same union — this assertion is
 *
 * type-only.
 */
const pickerSelectionMode = selectionMode as ComputedRef<
  'single' | 'multiple' | 'range' | undefined
>

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <DatePicker
        :name
        :input-id="id"
        v-model="inputValue"
        :selection-mode="pickerSelectionMode"
        :placeholder
        :disabled
        :readonly
        :invalid
        :min-date
        :max-date
        fluid
        v-tooltip:[tooltipModifiers]="tooltipValue"
        v-bind="{ ...forwardProps, ...bindings.input }"
        :ref="(el) => (inputRef = el)"
        @blur="(e: any) => handleBlur(e)"
        @focus="(e: any) => handleFocus(e)"
        @change="handleInput"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </DatePicker>
    </VfLayout>
  </slot>
</template>
