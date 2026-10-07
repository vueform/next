<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
import { defineEvents, useBlueprint, type LanguagesProp } from '@vueform/core'
import PrimeTextarea from 'primevue/textarea'
import type { WritableComputedRef } from 'vue'

import { blueprint, defaults } from '#src/blueprints/textarea'
import { vdomPrime } from '#src/helpers'

import type { VfTextareaEmits, VfTextareaProps, VfTextareaSlots } from './types'

// Non-colliding tag: Vapor treats `<Textarea>` as native `<textarea>`.
const VdomPrimeTextarea = vdomPrime(PrimeTextarea)

defineOptions({
  name: 'VfTextarea',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.translate ? {} : null),
})
defineEmits<VfTextareaEmits<TTranslate, TLanguages>>()

const props = withDefaults(
  defineProps<VfTextareaProps<TTranslate, TLanguages>>(),
  defaults
)
const events = defineEvents<VfTextareaEmits<TTranslate, TLanguages>>()
const slots = defineSlots<VfTextareaSlots<TTranslate, TLanguages>>()

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ help }) => ({
  root: {
    'vf-textarea': true,
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
 * PrimeVue Textarea types `modelValue` as `string | null`. The element's
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
      <VdomPrimeTextarea
        :name
        :id
        :class="classes.input"
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
        @keyup="handleKeyup"
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
      </VdomPrimeTextarea>
    </VfLayout>
  </slot>
</template>
