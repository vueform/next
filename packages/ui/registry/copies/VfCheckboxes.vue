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

import {
  choicesAria,
  useBlueprint,
  type ItemsProp,
  type ItemValueProp,
  type GroupChildrenProp,
  defineEvents,
} from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfCheckboxesEmits,
  type VfCheckboxesProps,
  type VfCheckboxesSlots,
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

const { api, context, expose, outlets, useClasses, useBindings } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const {
  items,
  groups,
  grouped,
  viewLoaded,
  path,
  disabled,
  label,
  handleFocus,
  handleBlur,
} = api

const classes = useClasses({
  root: 'vf-checkboxes vf-choices',
  wrapper: () => [
    props.layout === false ? props.class : null,
    'vf-choices-group',
  ],
})

const bindings = useBindings(
  {
    root: () => ({
      'data-align-label': !api.help.value ? '' : undefined,
    }),
    wrapper: () => ({
      'data-stacked': api.props.stacked ? '' : undefined,
      'data-aligned': api.props.aligned ? '' : undefined,
      'data-invalid': api.invalid.value ? '' : undefined,
    }),
  },
  choicesAria(api, { role: 'group' })
)

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :label="false">
      <div
        @focusin="handleFocus"
        @focusout="handleBlur"
        :class="classes.wrapper"
        v-bind="bindings.wrapper()"
      >
        <slot :items :groups :grouped :disabled :label :checkbox-name="path">
          <component
            v-if="outlets?.default"
            :is="outlets.default"
            :items
            :groups
            :grouped
            :disabled
            :label
            :checkbox-name="path"
          />
          <template v-else-if="grouped">
            <template v-for="(group, gi) in groups" :key="gi">
              <slot
                name="group"
                :group
                :disabled
                :label
                :checkbox-name="path"
                :bindings="bindings.group(group)"
              >
                <component
                  v-if="outlets?.group"
                  :is="outlets.group"
                  :group
                  :disabled
                  :label
                  :checkbox-name="path"
                  :bindings="bindings.group(group)"
                />
                <fieldset v-else v-bind="bindings.group(group)">
                  <legend v-bind="bindings.groupLabel(group)">
                    {{ group.label }}
                  </legend>
                  <template v-for="item in group.items" :key="item.key">
                    <slot
                      name="item"
                      :item
                      :disabled
                      :label
                      :checkbox-name="path"
                      :bindings="bindings.item(item)"
                    >
                      <component
                        v-if="outlets?.item"
                        :is="outlets.item"
                        :item
                        :disabled
                        :label
                        :checkbox-name="path"
                        :bindings="bindings.item(item)"
                      />
                      <VfCheckbox
                        v-else
                        :name="item.key"
                        :text="item.label"
                        :checkbox-name="path"
                        :disabled="disabled || item.disabled"
                        :layout="false"
                        v-bind="bindings.item(item)"
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
              <slot
                name="item"
                :item
                :disabled
                :label
                :checkbox-name="path"
                :bindings="bindings.item(item)"
              >
                <component
                  v-if="outlets?.item"
                  :is="outlets.item"
                  :item
                  :disabled
                  :label
                  :checkbox-name="path"
                  :bindings="bindings.item(item)"
                />
                <VfCheckbox
                  v-else
                  :name="item.key"
                  :text="item.label"
                  :checkbox-name="path"
                  :disabled="disabled || item.disabled"
                  :layout="false"
                  v-bind="bindings.item(item)"
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
