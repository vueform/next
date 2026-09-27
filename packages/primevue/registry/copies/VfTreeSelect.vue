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
  type TreeOptionsProp,
  vdomPrime,
} from '@vueform/primevue'
import PrimeTreeSelect from 'primevue/treeselect'
import {
  type VfTreeSelectEmits,
  type VfTreeSelectProps,
  type VfTreeSelectSlots,
  blueprint,
  defaults,
} from '@vueform/primevue/components/VfTreeSelect'

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

useClasses(({ help }) => ({
  root: {
    'vf-tree-select': true,
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
          ...aria,
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
