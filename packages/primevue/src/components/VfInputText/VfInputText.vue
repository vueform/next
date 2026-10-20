<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
import { defineEvents, useBlueprint, type LanguagesProp } from '@vueform/core'
import PrimeInputText from 'primevue/inputtext'
import type { WritableComputedRef } from 'vue'

import { tInputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/input-text'
import { vdomPrime } from '#src/helpers'

import type {
  VfInputTextEmits,
  VfInputTextProps,
  VfInputTextSlots,
} from './types'

const InputText = vdomPrime(PrimeInputText)

defineOptions({
  name: 'VfInputText',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.translate ? {} : null),
})
defineEmits<VfInputTextEmits<TTranslate, TLanguages>>()

const props = withDefaults(
  defineProps<VfInputTextProps<TTranslate, TLanguages>>(),
  defaults
)
const events = defineEvents<VfInputTextEmits<TTranslate, TLanguages>>()
const slots = defineSlots<VfInputTextSlots<TTranslate, TLanguages>>()

const { api, context, expose, outlets, propRefs, useClasses, useBindings } =
  useBlueprint(blueprint, props, events, slots)

const classes = useClasses({
  root: 'vf-input-text',
})

const bindings = useBindings(
  {
    root: () => ({
      'data-align-label': !api.help.value ? '' : undefined,
    }),
    input: () => ({
      'data-invalid': api.hasError.value ? '' : undefined,
    }),
  },
  tInputAria(api)
)

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

const { inputType, autocomplete } = propRefs

/**
 * PrimeVue InputText types `modelValue` as `string | null`. The element's
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
      <InputText
        :type="inputType"
        :name
        :id
        v-model="inputValue"
        :placeholder
        :autocomplete
        :disabled
        :readonly
        :invalid
        fluid
        :class="classes.input"
        v-tooltip:[tooltipModifiers]="tooltipValue"
        v-bind="{ ...forwardProps, ...bindings.input() }"
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
      </InputText>
    </VfLayout>
  </slot>
</template>
