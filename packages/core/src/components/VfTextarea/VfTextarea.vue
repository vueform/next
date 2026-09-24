<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
import { defaults, blueprint } from '@core/blueprints/textarea'
import { useBlueprint } from '@core/composables'
import { defineEvents } from '@core/helpers'
import type { LanguagesProp } from '@core/types'
import type { VfTextareaEmits, VfTextareaProps, VfTextareaSlots } from './types'
import type { WritableComputedRef } from 'vue'

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
const events = defineEvents<VfTextareaEmits>()
const slots = defineSlots<VfTextareaSlots<TTranslate, TLanguages>>()

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ hasError }) => ({
  root: {
    'vf-textarea': true,
    'vf-align-label': !api.help.value,
  },
  addonGroup: 'vf-addon-group',
  iconGroup: 'vf-icon-group',
  input: {
    'vf-input': true,
    'vf-textarea-input': true,
    'vf-resizable': props.resize,
    'vf-autogrow': props.autogrow,
    'vf-danger': hasError.value,
  },
}))

const {
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

// The deferred generic value type cannot be related to the native textarea
// value union while the SFC generics are unbound — at runtime it is always
// the active-language scalar.
const value = api.value as WritableComputedRef<string | number | null>

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :loading>
      <textarea
        :name
        :id
        :class="classes.input"
        v-model="value"
        :placeholder
        :disabled
        :readonly="readonly || undefined"
        :rows="props.rows"
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
