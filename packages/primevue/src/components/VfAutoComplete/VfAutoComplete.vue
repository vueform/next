<script
  setup
  lang="ts"
  generic="
    TSuggestions extends SuggestionsProp = SuggestionsProp,
    TMultiple extends boolean = false,
    TModel = any
  "
>
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeAutoComplete from 'primevue/autocomplete'

import { inputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/auto-complete'
import type { SuggestionsProp } from '#src/features'
import { vdomPrime } from '#src/helpers'

import type {
  VfAutoCompleteEmits,
  VfAutoCompleteProps,
  VfAutoCompleteSlots,
} from './types'

const AutoComplete = vdomPrime(PrimeAutoComplete)

defineOptions({
  name: 'VfAutoComplete',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.multiple ? [] : null),
})
defineEmits<VfAutoCompleteEmits<TSuggestions, TMultiple, TModel>>()

const props = withDefaults(
  defineProps<VfAutoCompleteProps<TSuggestions, TMultiple, TModel>>(),
  defaults
)
const events =
  defineEvents<VfAutoCompleteEmits<TSuggestions, TMultiple, TModel>>()
const slots =
  defineSlots<VfAutoCompleteSlots<TSuggestions, TMultiple, TModel>>()

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
  root: 'vf-auto-complete',
}))

useModifiers(({ help, hasError }) => ({
  root: {
    'data-align-label': !help.value ? '' : undefined,
  },
  input: {
    'data-invalid': hasError.value ? '' : undefined,
  },
}))

useA11y(inputAria())

const {
  value,
  id,
  placeholder,
  viewLoaded,
  disabled,
  loading,
  resolving,
  input,
  name,
  invalid,
  suggestions,
  itemLabel,
  itemDisabled,
  forwardProps,
  forwardSlots,
  handleChange,
  handleFocus,
  handleBlur,
  handleComplete,
} = api

const { minLength } = propRefs

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :loading="false">
      <AutoComplete
        :name
        :id
        v-model="value"
        :suggestions
        :option-label="itemLabel"
        :option-disabled="itemDisabled"
        :placeholder
        :disabled
        :loading="loading || resolving"
        :invalid
        :min-length
        fluid
        v-bind="{ ...forwardProps, ...bindings.input }"
        :ref="(el) => (input = el)"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        @complete="handleComplete"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </AutoComplete>
    </VfLayout>
  </slot>
</template>
