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
 * Local copy of VfRadioButtonGroup of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  choicesAria,
  useBlueprint,
  type OptionGroupChildrenProp,
  type OptionsProp,
  type OptionValueProp,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfRadioButtonGroupEmits,
  type VfRadioButtonGroupProps,
  type VfRadioButtonGroupSlots,
} from '@vueform/primevue/components/VfRadioButtonGroup'

import '@vueform/primevue/choices.css'

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

const {
  api,
  context,
  expose,
  outlets,
  bindings,
  useClasses,
  useModifiers,
  useA11y,
} = useBlueprint(blueprint, props, events, slots)

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

useClasses(({ props }) => ({
  root: 'vf-radio-button-group vf-choices',
  wrapper: [props.layout === false ? props.class : null, 'vf-choices-group'],
  group: () => null,
  groupLabel: () => null,
  item: () => null,
}))

useModifiers(({ props, invalid, help }) => ({
  root: {
    'data-align-label': !help.value ? '' : undefined,
  },
  // Functional on purpose: the bag reads aggregate validation state, which
  // must resolve in the wrapper's own render effect — never inside the merged
  // modifiers computed. Children's vapor dynamic prop sources subscribe to
  // that computed, so an eager `invalid` read closes a reactive cycle
  // (invalid -> children's validation -> child props -> this component's
  // bindings) that Vue 3.6's dirty-check walk cannot terminate on.
  wrapper: () => ({
    'data-stacked': props.stacked ? '' : undefined,
    'data-aligned': props.aligned ? '' : undefined,
    'data-invalid': invalid.value ? '' : undefined,
  }),
}))

useA11y(choicesAria({ role: 'radiogroup' }))

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :label="false">
      <div
        @focusin="handleFocus"
        @focusout="handleBlur"
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
