<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
/**
 * Local copy of VfText of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  tInputAria,
  useBlueprint,
  defineEvents,
  type LanguagesProp,
} from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfTextEmits,
  type VfTextProps,
  type VfTextSlots,
} from '@vueform/ui/components/VfText'

import '@vueform/ui/input.css'
import '@vueform/ui/text.css'

defineOptions({
  name: 'VfText',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.translate ? {} : null),
})
defineEmits<VfTextEmits<TTranslate, TLanguages>>()

const props = withDefaults(
  defineProps<VfTextProps<TTranslate, TLanguages>>(),
  defaults
)
const events = defineEvents<VfTextEmits<TTranslate, TLanguages>>()
const slots = defineSlots<VfTextSlots<TTranslate, TLanguages>>()

const {
  api,
  context,
  expose,
  outlets,
  propRefs,
  bindings,
  useClasses,
  useModifiers,
  useA11y,
} = useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-text',
  input: 'vf-input vf-text-input',
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
  autocomplete,
  loading,
  readonly,
  placeholder,
  viewLoaded,
  disabled,
  inputRef,
  name,
  handleKeydown,
  handleKeyup,
  handleKeypress,
  handleFocus,
  handleBlur,
  handleInput,
} = api

const { inputType, inputmode } = propRefs

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :loading>
      <input
        :type="inputType"
        :name
        :id
        v-model="value"
        :placeholder
        :autocomplete
        :inputmode
        :disabled
        :readonly="readonly || undefined"
        v-bind="bindings.input"
        :ref="(el) => (inputRef = el)"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
        @keypress="handleKeypress"
        @blur="handleBlur"
        @focus="handleFocus"
        @input="handleInput"
      />
    </VfLayout>
  </slot>
</template>
