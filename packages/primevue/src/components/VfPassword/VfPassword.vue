<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
import { defineEvents, useBlueprint, type LanguagesProp } from '@vueform/core'
import PrimePassword from 'primevue/password'
import type { WritableComputedRef } from 'vue'

import { tInputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/password'
import { vdomPrime } from '#src/helpers'

import type { VfPasswordEmits, VfPasswordProps, VfPasswordSlots } from './types'

const Password = vdomPrime(PrimePassword)

defineOptions({
  name: 'VfPassword',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.translate ? {} : null),
})
defineEmits<VfPasswordEmits<TTranslate, TLanguages>>()

const props = withDefaults(
  defineProps<VfPasswordProps<TTranslate, TLanguages>>(),
  defaults
)
const events = defineEvents<VfPasswordEmits<TTranslate, TLanguages>>()
const slots = defineSlots<VfPasswordSlots<TTranslate, TLanguages>>()

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
  root: 'vf-password',
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
  inputRef,
  name,
  tooltipModifiers,
  tooltipValue,
  invalid,
  forwardProps,
  forwardSlots,
  handleKeydown,
  handleKeyup,
  handleKeypress,
  handleInput,
  handleFocus,
  handleBlur,
} = api

/**
 * PrimeVue Password types `modelValue` as `string | null`. The element's
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
      <Password
        :name
        :input-id="id"
        v-model="inputValue"
        :placeholder
        :disabled
        :readonly
        :invalid
        fluid
        v-tooltip:[tooltipModifiers]="tooltipValue"
        v-bind="{ ...forwardProps, ...bindings.input }"
        :ref="(el) => (inputRef = el)"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
        @keypress="handleKeypress"
        @blur="handleBlur"
        @focus="handleFocus"
        @input="handleInput"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </Password>
    </VfLayout>
  </slot>
</template>
