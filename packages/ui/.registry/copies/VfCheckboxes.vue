<script
  setup
  lang="ts"
  generic="
    TItems extends ItemsProp = ItemsProp,
    TItemValueKey extends ItemValueProp = undefined,
    TGroupChildren extends GroupChildrenProp = undefined,
    TItemValueReturn = unknown,
    TModel = any
  "
>
/**
 * Local copy of VfCheckboxes of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import { defaults, blueprint } from '@vueform/ui/blueprints/checkboxes'
import {
  useBlueprint,
  type ItemsProp,
  type ItemValueProp,
  type GroupChildrenProp,
  defineEvents,
} from '@vueform/ui'
import type {
  VfCheckboxesEmits,
  VfCheckboxesProps,
  VfCheckboxesSlots,
} from '@vueform/ui/components/VfCheckboxes'
import '@vueform/ui/choices.css'

defineOptions({
  name: 'VfCheckboxes',
  element: true,
  inheritAttrs: false,
  nullValue: () => [],
})
defineEmits<
  VfCheckboxesEmits<
    TItems,
    TItemValueKey,
    TGroupChildren,
    TModel,
    TItemValueReturn
  >
>()

const props = withDefaults(
  defineProps<
    VfCheckboxesProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >(),
  defaults
)
const events =
  defineEvents<
    VfCheckboxesEmits<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >()
const slots =
  defineSlots<
    VfCheckboxesSlots<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >()

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

const {
  items,
  groups,
  grouped,
  viewLoaded,
  path,
  checkboxAria,
  disabled,
  label,
  handleFocus,
  handleBlur,
} = api

useClasses(({ props }) => ({
  root: 'vf-checkboxes vf-choices',
  group: [
    props.layout === false ? props.class : null,
    {
      'vf-choices-group': true,
      'vf-stacked': props.stacked,
      'vf-aligned': !!props.aligned,
    },
  ],
}))

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <div
        :class="classes.group"
        @focusin="handleFocus"
        @focusout="handleBlur"
        v-bind="parts.group"
      >
        <slot :items :groups :grouped :disabled :label :checkbox-name="path">
          <component
            v-if="outlets?.default"
            :is="outlets.default"
            :items
            :groups
            :grouped
            :checkbox-name="path"
            :disabled
            :label
          />
          <template v-else-if="grouped">
            <template v-for="(group, gi) in groups" :key="gi">
              <slot name="group" :group :disabled :label :checkbox-name="path">
                <component
                  v-if="outlets?.group"
                  :is="outlets.group"
                  :group
                  :disabled
                  :label
                  :checkbox-name="path"
                />
                <fieldset v-else v-bind="parts.fieldset?.(group)">
                  <legend v-bind="parts.legend?.(group)">
                    {{ group.label }}
                  </legend>
                  <template v-for="item in group.items" :key="item.key">
                    <slot
                      name="item"
                      :item
                      :disabled
                      :label
                      :checkbox-name="path"
                    >
                      <component
                        v-if="outlets?.item"
                        :is="outlets.item"
                        :item
                        :disabled
                        :label
                        :checkbox-name="path"
                      />
                      <VfCheckbox
                        v-else
                        :name="item.key"
                        :text="item.label"
                        :checkbox-name="path"
                        :disabled="disabled || item.disabled"
                        :aria="checkboxAria"
                        :layout="false"
                        v-bind="parts.item?.(item)"
                        :true-value="true"
                        :false-value="false"
                      >
                        <template v-if="outlets?.checkbox" #default="slotProps">
                          <slot name="checkbox" v-bind="slotProps">
                            <component
                              :is="outlets.checkbox"
                              v-bind="slotProps"
                            />
                          </slot>
                        </template>
                        <template v-if="outlets?.text" #text="slotProps">
                          <slot name="text" v-bind="slotProps">
                            <component :is="outlets.text" v-bind="slotProps" />
                          </slot>
                        </template>
                      </VfCheckbox>
                    </slot>
                  </template>
                </fieldset>
              </slot>
            </template>
          </template>
          <template v-else>
            <template v-for="item in items" :key="item.key">
              <slot name="item" :item :disabled :label :checkbox-name="path">
                <component
                  v-if="outlets?.item"
                  :is="outlets.item"
                  :item
                  :disabled
                  :label
                  :checkbox-name="path"
                />
                <VfCheckbox
                  v-else
                  :name="item.key"
                  :text="item.label"
                  :checkbox-name="path"
                  :disabled="disabled || item.disabled"
                  :aria="checkboxAria"
                  :layout="false"
                  v-bind="parts.item?.(item)"
                  :true-value="true"
                  :false-value="false"
                >
                  <template v-if="outlets?.checkbox" #default="slotProps">
                    <slot name="checkbox" v-bind="slotProps">
                      <component :is="outlets.checkbox" v-bind="slotProps" />
                    </slot>
                  </template>
                  <template v-if="outlets?.text" #text="slotProps">
                    <slot name="text" v-bind="slotProps">
                      <component :is="outlets.text" v-bind="slotProps" />
                    </slot>
                  </template>
                </VfCheckbox>
              </slot>
            </template>
          </template>
        </slot>
      </div>
    </VfLayout>
  </slot>
</template>
