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
 * Local copy of VfListbox of Vueform. How to customize it:
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
  type VfListboxEmits,
  type VfListboxProps,
  type VfListboxSlots,
} from '@vueform/primevue/components/VfListbox'
import PrimeListbox from 'primevue/listbox'

const Listbox = vdomPrime(PrimeListbox)

defineOptions({
  name: 'VfListbox',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.multiple ? [] : null),
})
defineEmits<
  VfListboxEmits<
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
    VfListboxProps<
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
    VfListboxEmits<
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
    VfListboxSlots<
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

useClasses(({ help }) => ({
  root: {
    'vf-listbox': true,
    'vf-align-label': !help.value,
  },
}))

const {
  value,
  viewLoaded,
  disabled,
  aria,
  input,
  invalid,
  rawItems,
  itemLabel,
  itemValue,
  itemDisabled,
  forwardProps,
  forwardSlots,
  handleInput,
  handleFocus,
  handleBlur,
} = api

const { optionGroupLabel, optionGroupChildren, multiple } = propRefs

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <Listbox
        :class="classes.input"
        v-model="value"
        :options="rawItems"
        :option-label="itemLabel"
        :option-value="itemValue"
        :option-disabled="itemDisabled"
        :option-group-label
        :option-group-children
        :disabled
        :invalid
        :multiple
        fluid
        v-bind="{
          ...aria,
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
      </Listbox>
    </VfLayout>
  </slot>
</template>
