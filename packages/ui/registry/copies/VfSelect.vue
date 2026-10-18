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
/**
 * Local copy of VfSelect of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  useBlueprint,
  type ItemsProp,
  type GroupChildrenProp,
  type ItemValueProp,
  defineEvents,
} from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfSelectEmits,
  type VfSelectProps,
  type VfSelectSlots,
} from '@vueform/ui/components/VfSelect'

import '@vueform/ui/select.css'
import '@vueform/ui/input.css'

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

useClasses(() => ({
  root: 'vf-select',
  addonGroup: 'vf-addon-group',
  iconGroup: 'vf-icon-group',
  input: 'vf-input vf-select-input',
}))

const {
  id,
  loading,
  placeholder,
  empty,
  viewLoaded,
  disabled,
  a11yBindings,
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
        :data-placeholder="empty && !!placeholder ? '' : undefined"
        :disabled
        :multiple
        :ref="(el) => (input = el)"
        v-bind="{
          ...a11yBindings.input,
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
