<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
import { defineEvents, useBlueprint, type LanguagesProp } from '@vueform/core'
import PrimeInputMask from 'primevue/inputmask'
import type { WritableComputedRef } from 'vue'

import { blueprint, defaults } from '#primevue/blueprints/input-mask'
import { vdomPrime } from '#primevue/helpers'

import type {
  VfInputMaskEmits,
  VfInputMaskProps,
  VfInputMaskSlots,
} from './types'

const InputMask = vdomPrime(PrimeInputMask)

defineOptions({
  name: 'VfInputMask',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.translate ? {} : null),
})
defineEmits<VfInputMaskEmits<TTranslate, TLanguages>>()

const props = withDefaults(
  defineProps<VfInputMaskProps<TTranslate, TLanguages>>(),
  defaults
)
const events = defineEvents<VfInputMaskEmits<TTranslate, TLanguages>>()
const slots = defineSlots<VfInputMaskSlots<TTranslate, TLanguages>>()

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ help }) => ({
  root: {
    'vf-input-mask': true,
    'vf-align-label': !help.value,
  },
}))

const {
  value,
  id,
  readonly,
  placeholder,
  viewLoaded,
  disabled,
  aria,
  input,
  name,
  tooltipModifiers,
  tooltipValue,
  invalid,
  mask,
  forwardProps,
  forwardSlots,
  handleKeydown,
  handleKeypress,
  handleInput,
  handleFocus,
  handleBlur,
} = api

/**
 * PrimeVue InputMask types `modelValue` as `string | null`. The element's
 * `value` is the active-language scalar (`string | number | null`), which is
 * the same runtime binding as before — this assertion is type-only.
 */
const inputValue = value as WritableComputedRef<string | null>

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <InputMask
        :name
        :id
        :mask
        :class="classes.input || undefined"
        v-model="inputValue"
        :placeholder
        :disabled
        :readonly
        :invalid
        fluid
        v-tooltip:[tooltipModifiers]="tooltipValue"
        v-bind="{
          ...aria,
          ...forwardProps,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
        @keydown="handleKeydown"
        @keypress="handleKeypress"
        @blur="handleBlur"
        @focus="handleFocus"
        @change="handleInput"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </InputMask>
    </VfLayout>
  </slot>
</template>
