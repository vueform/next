<script
  setup
  lang="ts"
  generic="
    TItems extends ItemsProp = ItemsProp,
    TItemValueKey extends ItemValueProp = undefined,
    TGroupChildren extends GroupChildrenProp = undefined,
    TItemValueReturn = unknown,
    TMultiple extends boolean = false,
    TModel = any
  "
>
import { defaults, blueprint } from '@core/blueprints/select'
import { useBlueprint } from '@core/composables'
import type {
  ItemsProp,
  GroupChildrenProp,
  ItemValueProp,
} from '@core/features'
import { defineEvents } from '@core/helpers'
import type { VfSelectEmits, VfSelectProps, VfSelectSlots } from './types'

defineOptions({
  name: 'VfSelect',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.multiple ? [] : null),
})
defineEmits<
  VfSelectEmits<
    TItems,
    TItemValueKey,
    TGroupChildren,
    TMultiple,
    TModel,
    TItemValueReturn
  >
>()

const props = withDefaults(
  defineProps<
    VfSelectProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TMultiple,
      TModel,
      TItemValueReturn
    >
  >(),
  defaults
)
const events =
  defineEvents<
    VfSelectEmits<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TMultiple,
      TModel,
      TItemValueReturn
    >
  >()
const slots =
  defineSlots<
    VfSelectSlots<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TMultiple,
      TModel,
      TItemValueReturn
    >
  >()

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ help, empty, hasError, props }) => ({
  root: {
    'vf-select': true,
    'vf-align-label': !help.value,
  },
  addonGroup: 'vf-addon-group',
  iconGroup: 'vf-icon-group',
  input: {
    'vf-input': true,
    'vf-select-input': true,
    'vf-placeholder': empty.value && !!props.placeholder,
    'vf-danger': hasError.value,
  },
}))

const {
  id,
  loading,
  placeholder,
  viewLoaded,
  disabled,
  aria,
  input,
  name,
  items,
  groups,
  grouped,
  nullValue,
  value,
  handleFocus,
  handleBlur,
  handleInput,
} = api

const { multiple } = propRefs

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :loading>
      <select
        v-model="value"
        :name
        :id
        :class="classes.input"
        :disabled
        :multiple
        :ref="(el) => (input = el)"
        v-bind="{
          ...aria,
          ...parts.input,
        }"
        @blur="handleBlur"
        @focus="handleFocus"
        @change="handleInput"
      >
        <option v-if="placeholder && !multiple" :value="nullValue" disabled>
          {{ placeholder }}
        </option>
        <template v-if="grouped">
          <optgroup
            v-for="(group, gi) in groups"
            :key="gi"
            :label="group.label"
          >
            <option
              v-for="item in group.items"
              :key="item.key"
              :value="item.value"
              :disabled="item.disabled"
            >
              <slot name="option" :item>
                <component v-if="outlets.option" :is="outlets.option" :item />
                <template v-else>{{ item.label }}</template>
              </slot>
            </option>
          </optgroup>
        </template>
        <template v-else>
          <option
            v-for="item in items"
            :key="item.key"
            :value="item.value"
            :disabled="item.disabled"
          >
            <slot name="option" :item>
              <component v-if="outlets.option" :is="outlets.option" :item />
              <template v-else>{{ item.label }}</template>
            </slot>
          </option>
        </template>
      </select>
    </VfLayout>
  </slot>
</template>
