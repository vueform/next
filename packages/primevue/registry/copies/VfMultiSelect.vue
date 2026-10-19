<script
  setup
  lang="ts"
  generic="
    TOptions extends OptionsProp = OptionsProp,
    TOptionValueKey extends OptionValueProp = undefined,
    TGroupChildren extends OptionGroupChildrenProp = undefined,
    TOptionValueReturn = unknown,
    TModel = any
  "
>
/**
 * Local copy of VfMultiSelect of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  inputAria,
  type OptionGroupChildrenProp,
  type OptionsProp,
  type OptionValueProp,
  vdomPrime,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfMultiSelectEmits,
  type VfMultiSelectProps,
  type VfMultiSelectSlots,
} from '@vueform/primevue/components/VfMultiSelect'
import PrimeMultiSelect from 'primevue/multiselect'

const MultiSelect = vdomPrime(PrimeMultiSelect)

defineOptions({
  name: 'VfMultiSelect',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: () => [],
})
defineEmits<
  VfMultiSelectEmits<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TModel,
    TOptionValueReturn
  >
>()

const props = withDefaults(
  defineProps<
    VfMultiSelectProps<
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
    VfMultiSelectEmits<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >()
const slots =
  defineSlots<
    VfMultiSelectSlots<
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
  root: 'vf-multi-select',
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
  rawItems,
  itemLabel,
  itemValue,
  itemDisabled,
  forwardProps,
  forwardSlots,
  handleFocus,
  handleBlur,
  handleInput,
} = api

const { optionGroupLabel, optionGroupChildren } = propRefs

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <MultiSelect
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
      </MultiSelect>
    </VfLayout>
  </slot>
</template>
