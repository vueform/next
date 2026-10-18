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
 * Local copy of VfCheckboxGroup of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  type OptionGroupChildrenProp,
  type OptionsProp,
  type OptionValueProp,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfCheckboxGroupEmits,
  type VfCheckboxGroupProps,
  type VfCheckboxGroupSlots,
} from '@vueform/primevue/components/VfCheckboxGroup'

import '@vueform/primevue/choices.css'

defineOptions({ name: 'VfCheckboxGroup', element: true, inheritAttrs: false })
defineEmits<
  VfCheckboxGroupEmits<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TModel,
    TOptionValueReturn
  >
>()

const props = withDefaults(
  defineProps<
    VfCheckboxGroupProps<
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
    VfCheckboxGroupEmits<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >()
const slots =
  defineSlots<
    VfCheckboxGroupSlots<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
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
  a11yBindings,
  disabled,
  label,
  handleFocus,
  handleBlur,
} = api

useClasses(({ props }) => ({
  root: 'vf-checkbox-group vf-choices',
  group: [props.layout === false ? props.class : null, 'vf-choices-group'],
}))

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :label="false">
      <div
        :class="classes.group"
        :data-stacked="props.stacked ? '' : undefined"
        :data-aligned="props.aligned ? '' : undefined"
        @focusin="handleFocus"
        @focusout="handleBlur"
        v-bind="{
          ...a11yBindings.group,
          ...parts.group,
        }"
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
                        :layout="false"
                        v-bind="parts.item?.(item)"
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
                  :layout="false"
                  v-bind="parts.item?.(item)"
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
