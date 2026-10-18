<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
/**
 * Local copy of VfTextarea of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  useBlueprint,
  defineEvents,
  type LanguagesProp,
  autocompleteTokenOf,
} from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfTextareaEmits,
  type VfTextareaProps,
  type VfTextareaSlots,
} from '@vueform/ui/components/VfTextarea'
import type { WritableComputedRef } from 'vue'

import '@vueform/ui/textarea.css'
import '@vueform/ui/input.css'

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

useClasses(() => ({
  root: 'vf-textarea',
  addonGroup: 'vf-addon-group',
  iconGroup: 'vf-icon-group',
  input: 'vf-input vf-textarea-input',
}))

const {
  id,
  loading,
  readonly,
  placeholder,
  viewLoaded,
  disabled,
  a11yBindings,
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
        :autocomplete="props.autocomplete ?? autocompleteTokenOf(name)"
        :inputmode="props.inputmode"
        :data-resizable="props.resize ? '' : undefined"
        :data-autogrow="props.autogrow ? '' : undefined"
        :disabled
        :readonly="readonly || undefined"
        :rows="props.rows"
        v-bind="{
          ...a11yBindings.input,
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
