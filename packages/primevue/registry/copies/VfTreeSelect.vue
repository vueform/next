<script
  setup
  lang="ts"
  generic="
    TOptions extends TreeOptionsProp = TreeOptionsProp,
    TSelectionMode extends TreeSelectionModeProp = undefined,
    TModel = any
  "
>
/**
 * Local copy of VfTreeSelect of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  type TreeSelectionModeProp,
  vdomPrime,
  type TreeOptionsProp,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfTreeSelectEmits,
  type VfTreeSelectProps,
  type VfTreeSelectSlots,
} from '@vueform/primevue/components/VfTreeSelect'
import PrimeTreeSelect from 'primevue/treeselect'

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

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-tree-select',
}))

const {
  value,
  id,
  placeholder,
  viewLoaded,
  disabled,
  loading,
  resolving,
  a11yBindings,
  input,
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
        :class="classes.input"
        v-model="value"
        :options="items"
        :placeholder
        :disabled
        :loading="loading || resolving"
        :invalid
        fluid
        v-bind="{
          ...a11yBindings.input,
          ...forwardProps,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
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
