<script
  setup
  lang="ts"
  generic="
    TOptions extends TreeOptionsProp = TreeOptionsProp,
    TSelectionMode extends TreeSelectionModeProp = undefined,
    TModel = any
  "
>
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeTreeSelect from 'primevue/treeselect'

import { inputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/tree-select'
import type { TreeSelectionModeProp } from '#src/features/tree-options'
import { vdomPrime } from '#src/helpers'
import type { TreeOptionsProp } from '#src/types'

import type {
  VfTreeSelectEmits,
  VfTreeSelectProps,
  VfTreeSelectSlots,
} from './types'

const TreeSelect = vdomPrime(PrimeTreeSelect)

defineOptions({
  name: 'VfTreeSelect',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfTreeSelectEmits<TOptions, TSelectionMode, TModel>>()

const props = withDefaults(
  defineProps<VfTreeSelectProps<TOptions, TSelectionMode, TModel>>(),
  defaults
)
const events =
  defineEvents<VfTreeSelectEmits<TOptions, TSelectionMode, TModel>>()
const slots = defineSlots<VfTreeSelectSlots<TOptions, TSelectionMode, TModel>>()

const {
  api,
  context,
  expose,
  outlets,
  bindings,
  useClasses,
  useModifiers,
  useA11y,
} = useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-tree-select',
}))

useModifiers(({ empty, placeholder, help, hasError }) => ({
  root: {
    'data-align-label': !help.value ? '' : undefined,
  },
  input: {
    'data-invalid': hasError.value ? '' : undefined,
    'data-placeholder': empty.value && !!placeholder.value ? '' : undefined,
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
  inputRef,
  name,
  invalid,
  items,
  forwardProps,
  forwardSlots,
  handleFocus,
  handleBlur,
  handleInput,
} = api

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <TreeSelect
        :name
        :id
        v-model="value"
        :options="items"
        :placeholder
        :disabled
        :loading="loading || resolving"
        :invalid
        fluid
        v-bind="{ ...forwardProps, ...bindings.input }"
        :ref="(el) => (inputRef = el)"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleInput"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </TreeSelect>
    </VfLayout>
  </slot>
</template>
