<script
  setup
  lang="ts"
  generic="
    TOptions extends OptionsProp = OptionsProp,
    TOptionValueKey extends OptionValueProp = undefined,
    TGroupChildren extends CascadeOptionGroupChildrenProp = undefined,
    TOptionValueReturn = unknown,
    TModel = any
  "
>
/**
 * Local copy of VfCascadeSelect of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  inputAria,
  type CascadeOptionGroupChildrenProp,
  type OptionsProp,
  type OptionValueProp,
  vdomPrime,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfCascadeSelectEmits,
  type VfCascadeSelectProps,
  type VfCascadeSelectSlots,
} from '@vueform/primevue/components/VfCascadeSelect'
import PrimeCascadeSelect from 'primevue/cascadeselect'

const CascadeSelect = vdomPrime(PrimeCascadeSelect)

defineOptions({
  name: 'VfCascadeSelect',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<
  VfCascadeSelectEmits<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TModel,
    TOptionValueReturn
  >
>()

const props = withDefaults(
  defineProps<
    VfCascadeSelectProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >(),
  defaults
)
const events =
  defineEvents<
    VfCascadeSelectEmits<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >()
const slots =
  defineSlots<
    VfCascadeSelectSlots<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >()

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
  root: 'vf-cascade-select',
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
  id,
  placeholder,
  viewLoaded,
  disabled,
  loading,
  resolving,
  inputRef,
  name,
  invalid,
  rawItems,
  itemLabel,
  itemValue,
  itemDisabled,
  value,
  forwardProps,
  forwardSlots,
  handleInput,
  handleFocus,
  handleBlur,
} = api

const { optionGroupLabel, optionGroupChildren } = propRefs

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :loading="false">
      <CascadeSelect
        :name
        :id
        v-model="value"
        :options="rawItems"
        :option-label="itemLabel"
        :option-value="itemValue"
        :option-disabled="itemDisabled"
        :option-group-label
        :option-group-children
        :placeholder
        :disabled
        :loading="loading || resolving"
        :invalid
        fluid
        v-bind="{ ...forwardProps, ...bindings.input }"
        :ref="(el) => (inputRef = el)"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="(e) => handleInput(e.value, e.originalEvent)"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </CascadeSelect>
    </VfLayout>
  </slot>
</template>
