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
import { defaults, blueprint } from '~/blueprints/radios'
import { useBlueprint } from '~/composables'
import type { ItemsProp, ItemValueProp, GroupChildrenProp } from '~/features'
import { defineEvents } from '~/helpers'
import type { VfRadiosEmits, VfRadiosProps, VfRadiosSlots } from './types'

defineOptions({ name: 'VfRadios', element: true, inheritAttrs: false })
defineEmits<
  VfRadiosEmits<TItems, TItemValueKey, TGroupChildren, TModel, TItemValueReturn>
>()

const props = withDefaults(
  defineProps<
    VfRadiosProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >(),
  defaults
)
const events = defineEvents<VfRadiosEmits>()
const slots =
  defineSlots<
    VfRadiosSlots<
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
  radioAria,
  disabled,
  label,
  handleFocus,
  handleBlur,
} = api

useClasses(({ props }) => ({
  root: 'vf-radios vf-choices',
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
        <slot :items :groups :grouped :disabled :label :radio-name="path">
          <component
            v-if="outlets?.default"
            :is="outlets.default"
            :items
            :groups
            :grouped
            :radio-name="path"
            :disabled
            :label
          />
          <template v-else-if="grouped">
            <template v-for="(group, gi) in groups" :key="gi">
              <slot name="group" :group :disabled :label :radio-name="path">
                <component
                  v-if="outlets?.group"
                  :is="outlets.group"
                  :group
                  :disabled
                  :label
                  :radio-name="path"
                />
                <fieldset v-else v-bind="parts.fieldset?.(group)">
                  <legend v-bind="parts.legend?.(group)">
                    {{ group.label }}
                  </legend>
                  <template v-for="item in group.items" :key="item.key">
                    <slot name="item" :item :disabled :label :radio-name="path">
                      <component
                        v-if="outlets?.item"
                        :is="outlets.item"
                        :item
                        :disabled
                        :label
                        :radio-name="path"
                      />
                      <VfRadio
                        v-else
                        :name="item.key"
                        :text="item.label"
                        :radio-name="path"
                        :disabled="disabled || item.disabled"
                        :aria="radioAria"
                        :layout="false"
                        v-bind="parts.item?.(item)"
                        :radio-value="true"
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
                      </VfRadio>
                    </slot>
                  </template>
                </fieldset>
              </slot>
            </template>
          </template>
          <template v-else>
            <template v-for="item in items" :key="item.key">
              <slot name="item" :item :disabled :label :radio-name="path">
                <component
                  v-if="outlets?.item"
                  :is="outlets.item"
                  :item
                  :disabled
                  :label
                  :radio-name="path"
                />
                <VfRadio
                  v-else
                  :name="item.key"
                  :text="item.label"
                  :radio-name="path"
                  :disabled="disabled || item.disabled"
                  :aria="radioAria"
                  :layout="false"
                  v-bind="parts.item?.(item)"
                  :radio-value="true"
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
                </VfRadio>
              </slot>
            </template>
          </template>
        </slot>
      </div>
    </VfLayout>
  </slot>
</template>
