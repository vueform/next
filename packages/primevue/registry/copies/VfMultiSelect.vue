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

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-multi-select',
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
        :class="classes.input"
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
        v-bind="{
          ...a11yBindings.input,
          ...forwardProps,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
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
