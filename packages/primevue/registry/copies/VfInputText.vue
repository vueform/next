<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
/**
 * Local copy of VfInputText of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  type LanguagesProp,
  vdomPrime,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfInputTextEmits,
  type VfInputTextProps,
  type VfInputTextSlots,
} from '@vueform/primevue/components/VfInputText'
import PrimeInputText from 'primevue/inputtext'
import type { WritableComputedRef } from 'vue'

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

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-input-text',
}))

const {
  value,
  id,
  readonly,
  placeholder,
  viewLoaded,
  disabled,
  a11yBindings,
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
        :class="classes.input"
        v-model="inputValue"
        :placeholder
        :autocomplete
        :disabled
        :readonly
        :invalid
        fluid
        v-tooltip:[tooltipModifiers]="tooltipValue"
        v-bind="{
          ...a11yBindings.input,
          ...forwardProps,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
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
