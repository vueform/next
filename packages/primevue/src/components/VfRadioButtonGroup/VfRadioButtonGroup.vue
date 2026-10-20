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
import { defineEvents, choicesAria, useBlueprint } from '@vueform/core'

import { blueprint, defaults } from '#src/blueprints/radio-button-group'
import type {
  OptionGroupChildrenProp,
  OptionsProp,
  OptionValueProp,
} from '#src/features/options'

import type {
  VfRadioButtonGroupEmits,
  VfRadioButtonGroupProps,
  VfRadioButtonGroupSlots,
} from './types'

defineOptions({
  name: 'VfRadioButtonGroup',
  element: true,
  inheritAttrs: false,
})
defineEmits<
  VfRadioButtonGroupEmits<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TModel,
    TOptionValueReturn
  >
>()

const props = withDefaults(
  defineProps<
    VfRadioButtonGroupProps<
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
    VfRadioButtonGroupEmits<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >()
const slots =
  defineSlots<
    VfRadioButtonGroupSlots<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
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
  root: 'vf-radio-button-group vf-choices',
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
  choicesAria(api, { role: 'radiogroup' })
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
        <slot :items :groups :grouped :disabled :label :radio-name="path">
          <component
            v-if="outlets?.default"
            :is="outlets.default"
            :items
            :groups
            :grouped
            :disabled
            :label
            :radio-name="path"
          />
          <template v-else-if="grouped">
            <template v-for="(group, gi) in groups" :key="gi">
              <slot
                name="group"
                :group
                :disabled
                :label
                :radio-name="path"
                :bindings="bindings.group(group)"
              >
                <component
                  v-if="outlets?.group"
                  :is="outlets.group"
                  :group
                  :disabled
                  :label
                  :radio-name="path"
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
                      :radio-name="path"
                      :bindings="bindings.item(item)"
                    >
                      <component
                        v-if="outlets?.item"
                        :is="outlets.item"
                        :item
                        :disabled
                        :label
                        :radio-name="path"
                        :bindings="bindings.item(item)"
                      />
                      <VfRadioButton
                        v-else
                        :name="item.key"
                        :text="item.label"
                        :radio-name="path"
                        :disabled="disabled || item.disabled"
                        :layout="false"
                        v-bind="bindings.item(item)"
                      >
                        <template v-if="outlets?.radio" #default="slotProps">
                          <slot name="radio" v-bind="slotProps">
                            <component :is="outlets.radio" v-bind="slotProps" />
                          </slot>
                        </template>
                        <template v-if="outlets?.text" #text="slotProps">
                          <slot name="text" v-bind="slotProps">
                            <component :is="outlets.text" v-bind="slotProps" />
                          </slot>
                        </template>
                      </VfRadioButton>
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
                :radio-name="path"
                :bindings="bindings.item(item)"
              >
                <component
                  v-if="outlets?.item"
                  :is="outlets.item"
                  :item
                  :disabled
                  :label
                  :radio-name="path"
                  :bindings="bindings.item(item)"
                />
                <VfRadioButton
                  v-else
                  :name="item.key"
                  :text="item.label"
                  :radio-name="path"
                  :disabled="disabled || item.disabled"
                  :layout="false"
                  v-bind="bindings.item(item)"
                >
                  <template v-if="outlets?.radio" #default="slotProps">
                    <slot name="radio" v-bind="slotProps">
                      <component :is="outlets.radio" v-bind="slotProps" />
                    </slot>
                  </template>
                  <template v-if="outlets?.text" #text="slotProps">
                    <slot name="text" v-bind="slotProps">
                      <component :is="outlets.text" v-bind="slotProps" />
                    </slot>
                  </template>
                </VfRadioButton>
              </slot>
            </template>
          </template>
        </slot>
      </div>
    </VfLayout>
  </slot>
</template>
