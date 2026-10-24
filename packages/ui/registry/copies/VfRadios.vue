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
 * Local copy of VfRadios of Vueform. How to customize it:
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
  type VfRadiosEmits,
  type VfRadiosProps,
  type VfRadiosSlots,
} from '@vueform/ui/components/VfRadios'

import '@vueform/ui/choices.css'

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
  root: 'vf-radios vf-choices',
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
    // Zero-arg resolver: aggregate reads resolve at the wrapper's own render effect.
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
                      <VfRadio
                        v-else
                        :name="item.key"
                        :text="item.label"
                        :radio-name="path"
                        :disabled="disabled || item.disabled"
                        :layout="false"
                        v-bind="bindings.item(item)"
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
                <VfRadio
                  v-else
                  :name="item.key"
                  :text="item.label"
                  :radio-name="path"
                  :disabled="disabled || item.disabled"
                  :layout="false"
                  v-bind="bindings.item(item)"
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
