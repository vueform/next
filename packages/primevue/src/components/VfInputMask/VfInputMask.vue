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

import { tInputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/input-mask'
import { vdomPrime } from '#src/helpers'
import { classCompat } from '#src/utils'

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
  root: 'vf-input-mask',
}))

useModifiers(({ help, hasError }) => ({
  root: {
    'data-align-label': !help.value ? '' : undefined,
  },
  input: {
    'data-invalid': hasError.value ? '' : undefined,
  },
}))

useA11y(tInputAria())

const {
  value,
  id,
  readonly,
  placeholder,
  viewLoaded,
  disabled,
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
        v-model="value"
        :placeholder
        :disabled
        :readonly
        :invalid
        fluid
        v-tooltip:[tooltipModifiers]="tooltipValue"
        v-bind="{ ...forwardProps, ...classCompat(bindings.input) }"
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
