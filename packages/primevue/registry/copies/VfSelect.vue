<script
  setup
  lang="ts"
  generic="
    TOptions extends OptionsProp = OptionsProp,
    TOptionValueKey extends OptionValueProp = undefined,
    TGroupChildren extends OptionGroupChildrenProp = undefined,
    TOptionValueReturn = unknown,
    TMultiple extends boolean = false,
    TModel = any
  "
>
/**
 * Local copy of VfSelect of Vueform. How to customize it:
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
  type VfSelectEmits,
  type VfSelectProps,
  type VfSelectSlots,
} from '@vueform/primevue/components/VfSelect'
import PrimeSelect from 'primevue/select'

const PvSelect = vdomPrime(PrimeSelect)

defineOptions({
  name: 'VfSelect',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.multiple ? [] : null),
})
defineEmits<
  VfSelectEmits<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TMultiple,
    TModel,
    TOptionValueReturn
  >
>()

const props = withDefaults(
  defineProps<
    VfSelectProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TMultiple,
      TModel,
      TOptionValueReturn
    >
  >(),
  defaults
)
const events =
  defineEvents<
    VfSelectEmits<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TMultiple,
      TModel,
      TOptionValueReturn
    >
  >()
const slots =
  defineSlots<
    VfSelectSlots<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TMultiple,
      TModel,
      TOptionValueReturn
    >
  >()

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-select',
}))

const {
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
    <VfLayout v-else>
      <PvSelect
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
      </PvSelect>
    </VfLayout>
  </slot>
</template>
