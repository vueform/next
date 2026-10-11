<script
  setup
  lang="ts"
  generic="
    TSuggestions extends SuggestionsProp = SuggestionsProp,
    TMultiple extends boolean = false,
    TModel = any
  "
>
/**
 * Local copy of VfAutoComplete of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  type SuggestionsProp,
  vdomPrime,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfAutoCompleteEmits,
  type VfAutoCompleteProps,
  type VfAutoCompleteSlots,
} from '@vueform/primevue/components/VfAutoComplete'
import PrimeAutoComplete from 'primevue/autocomplete'

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

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ help }) => ({
  root: {
    'vf-auto-complete': true,
    'vf-align-label': !help.value,
  },
}))

const {
  value,
  id,
  placeholder,
  viewLoaded,
  disabled,
  loading,
  resolving,
  aria,
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
        :class="classes.input"
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
        v-bind="{
          ...aria,
          ...forwardProps,
          ...parts.input,
        }"
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
