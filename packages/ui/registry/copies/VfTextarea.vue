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
  tInputAria,
  useBlueprint,
  defineEvents,
  type LanguagesProp,
} from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfTextareaEmits,
  type VfTextareaProps,
  type VfTextareaSlots,
} from '@vueform/ui/components/VfTextarea'

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

const { api, context, expose, outlets, useClasses, useBindings } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const classes = useClasses({
  root: 'vf-textarea',
  input: 'vf-input vf-textarea-input',
})

const bindings = useBindings(
  {
    input: () => ({
      'data-invalid': api.hasError.value ? '' : undefined,
      'data-resizable': api.props.resize ? '' : undefined,
      'data-autogrow': api.props.autogrow ? '' : undefined,
    }),
  },
  tInputAria(api)
)

const {
  id,
  value,
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

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :loading>
      <textarea
        :name
        :id
        v-model="value"
        :placeholder
        :autocomplete
        :inputmode
        :disabled
        :readonly="readonly || undefined"
        :rows="props.rows"
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
