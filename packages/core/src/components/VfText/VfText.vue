<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
import { tInputAria } from '#src/a11y'
import { defaults, blueprint } from '#src/blueprints/text'
import { useBlueprint } from '#src/composables'
import { defineEvents } from '#src/helpers'
import type { LanguagesProp } from '#src/types'

import type { VfTextEmits, VfTextProps, VfTextSlots } from './types'

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
  classes,
  useClasses,
  useBindings,
} = useBlueprint(blueprint, props, events, slots)

useClasses({
  root: 'vf-text',
  input: 'vf-input vf-text-input',
})

useBindings(
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
        :class="classes.input"
        v-bind="bindings.input()"
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
