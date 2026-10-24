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
  inputAria,
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

const { api, context, expose, outlets, useClasses, useBindings } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const classes = useClasses({
  root: 'vf-tree-select',
})

const bindings = useBindings(
  {
    root: () => ({
      'data-align-label': !api.help.value ? '' : undefined,
    }),
    input: () => ({
      'data-invalid': api.hasError.value ? '' : undefined,
      'data-placeholder':
        api.empty.value && !!api.placeholder.value ? '' : undefined,
    }),
  },
  inputAria(api)
)

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
        :class="classes.input"
        v-bind="{ ...forwardProps, ...bindings.input() }"
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
