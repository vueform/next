<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
import { defaults, blueprint } from '#core/blueprints/text'
import { useBlueprint } from '#core/composables'
import { defineEvents } from '#core/helpers'
import type { LanguagesProp } from '#core/types'

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

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ help, hasError }) => ({
  root: {
    'vf-text': true,
    'vf-align-label': !help.value,
  },
  input: {
    'vf-input': true,
    'vf-text-input': true,
    'vf-danger': hasError.value,
  },
}))

const {
  value,
  id,
  loading,
  readonly,
  placeholder,
  viewLoaded,
  disabled,
  aria,
  input,
  name,
  handleKeydown,
  handleKeyup,
  handleKeypress,
  handleFocus,
  handleBlur,
  handleInput,
} = api

const { inputType, autocomplete } = propRefs

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
        :class="classes.input"
        v-model="value"
        :placeholder
        :autocomplete
        :disabled
        :readonly="readonly || undefined"
        v-bind="{
          ...aria,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
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
