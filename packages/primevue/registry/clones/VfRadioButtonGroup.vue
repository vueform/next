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
 * VfCloneName — a custom element created from Vueform's `radio-button-group` blueprint.
 *
 * @see https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  choicesAria,
  useBlueprint,
  type OptionGroupChildrenProp,
  type OptionsProp,
  type OptionValueProp,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type OptionValueOf,
  type PartOf,
  type RawOptionOf,
  type ResolvedGroup,
  type ResolvedOption,
  type WidenProps,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type RadioButtonGroupApi,
  type RadioButtonGroupClasses,
  type RadioButtonGroupEmits,
  type RadioButtonGroupExpose,
  type RadioButtonGroupParts,
  type RadioButtonGroupProps,
  type RadioButtonGroupSlots,
} from '@vueform/primevue/blueprints/radio-button-group'

import '@vueform/primevue/choices.css'
import type { VfRadioButtonSlots } from '@vueform/primevue/components/VfRadioButton'
import type { VNode } from 'vue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends RadioButtonGroupProps<
  '__TYPE__',
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TModel,
  TOptionValueReturn,
  VfCloneNameSlots<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TModel,
    TOptionValueReturn
  >,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameContext<
    VfCloneNameProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {}

/**
 * Emit / event definitions.
 *
 * @example
 *   custom: [arg1: any, arg2: any, context$: VfCloneNameContext]
 *
 * @see https://primevue.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends RadioButtonGroupEmits<
  VfCloneNameContext<
    VfCloneNameProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://primevue.vueform.com/guide/slots
 */
export interface VfCloneNameSlots<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
  TValue = OptionValueOf<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TOptionValueReturn
  >,
  TRaw = RawOptionOf<TOptions, TGroupChildren>,
> extends RadioButtonGroupSlots<
  VfCloneNameContext<
    VfCloneNameProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {
  /**
   * Slot that replaces the default radio buttons rendering. Receives resolved
   * items, groups, and shared state.
   */
  default: (scope: {
    /**
     * The shared `name` attribute of the radio inputs.
     */
    radioName: string

    /**
     * Whether the group is disabled.
     */
    disabled: boolean

    /**
     * The resolved label text.
     */
    label: string | undefined

    /**
     * The resolved option items.
     */
    items: ResolvedOption<TValue, TRaw>[]

    /**
     * The resolved option groups.
     */
    groups: ResolvedGroup<TValue, TRaw>[]

    /**
     * Whether the options are grouped.
     */
    grouped: boolean
  }) => VNode[]

  /**
   * Slot that replaces each option group when items are grouped.
   */
  group: (scope: {
    /**
     * The shared `name` attribute of the radio inputs.
     */
    radioName: string

    /**
     * Whether the group is disabled.
     */
    disabled: boolean

    /**
     * The resolved label text.
     */
    label: string | undefined

    /**
     * The resolved option group.
     */
    group: ResolvedGroup<TValue, TRaw>

    /**
     * The group fieldset's resolved bindings (part overrides for this group's
     * fieldset element); apply with `v-bind`.
     */
    bindings: VfRadioButtonGroupResolvedBindings['group']
  }) => VNode[]

  /**
   * Slot that replaces each entire `VfRadioButton` child. Receives the resolved
   * item and shared state.
   */
  item: (scope: {
    /**
     * The shared `name` attribute of the radio inputs.
     */
    radioName: string

    /**
     * Whether the group is disabled.
     */
    disabled: boolean

    /**
     * The resolved label text.
     */
    label: string | undefined

    /**
     * The resolved option item.
     */
    item: ResolvedOption<TValue, TRaw>

    /**
     * The item's resolved bindings (part overrides for this item's
     * VfRadioButton child); apply with `v-bind`.
     */
    bindings: VfRadioButtonGroupResolvedBindings['item']
  }) => VNode[]

  /**
   * Slot that replaces each individual radio button input rendering inside the
   * default `VfRadioButton` child.
   *
   * Child radios always use the default `true` radio value; the holder's item
   * value is resolved by name, not passed as `value`.
   *
   * @inherits VfRadioButton.default
   */
  radio: (scope: Parameters<VfRadioButtonSlots['default']>[0]) => VNode[]

  /**
   * Slot that replaces the text/label of each individual radio button.
   *
   * @inherits VfRadioButton.text
   */
  text: (scope: Parameters<VfRadioButtonSlots['text']>[0]) => VNode[]
}

/**
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/primevue').DomAttrsOf<'div'>
 *   component: import('@vueform/primevue').PartOf<'VfButton'>
 *
 * @see https://primevue.vueform.com/guide/parts
 */
export interface VfCloneNameParts extends RadioButtonGroupParts {
  /**
   * The wrapper element containing all radio button items.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The fieldset element wrapping each group when items are grouped.
   *
   * @param group The group data.
   * @tag fieldset
   */
  group: (group: Record<string, any>) => DomAttrsOf<'fieldset'>

  /**
   * The legend element displaying the group label.
   *
   * @param group The group data.
   * @tag legend
   */
  groupLabel: (group: Record<string, any>) => DomAttrsOf<'legend'>

  /**
   * Props factory for each VfRadioButton child component, receiving the item
   * data.
   *
   * @param item The radio button item data.
   * @tag VfRadioButton
   */
  item: (item: Record<string, any>) => PartOf<'VfRadioButton'>
}

/**
 * Class definitions.
 *
 * @example
 *   plain: import('@vueform/primevue').ClassValue
 *   dynamic: (arg1: any, arg2: any) => import('@vueform/primevue').ClassValue
 *
 * @see https://primevue.vueform.com/guide/classes
 */
export interface VfCloneNameClasses extends RadioButtonGroupClasses {
  /**
   * The wrapper element containing all radio button items.
   */
  wrapper: ClassValue

  /**
   * The fieldset element wrapping each group when items are grouped.
   *
   * @param group The group data.
   */
  group: (group: Record<string, any>) => ClassValue

  /**
   * The legend element displaying the group label.
   *
   * @param group The group data.
   */
  groupLabel: (group: Record<string, any>) => ClassValue

  /**
   * Each item's `VfRadioButton` child component.
   *
   * @param item The radio button item data.
   */
  item: (item: Record<string, any>) => ClassValue
}

/**
 * Custom exposed API members. Add props you return from useBlueprint's
 * 5th 'extend' callback.
 *
 * @example
 *   plain: string
 *   vueRef: import('vue').Ref<string>
 *   method: (arg1: any, arg2: any) => string
 *
 * @see https://primevue.vueform.com/guide/components#expose-interface
 */
export interface VfCloneNameExpose extends RadioButtonGroupExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<
    VfCloneNameProps,
    RadioButtonGroupProps<
      string,
      OptionsProp,
      OptionValueProp,
      OptionGroupChildrenProp
    >
  > = VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfRadioButtonGroupBindings,
  VfCloneNameExpose,
  RadioButtonGroupApi<TProps>
> {}

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
})
defineEmits<
  VfCloneNameEmits<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TModel,
    TOptionValueReturn
  >
>()

const props = withDefaults(
  defineProps<
    VfCloneNameProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >(),
  {
    ...defaults,
    type: '__TYPE__',
  }
)
const events =
  defineEvents<
    VfCloneNameEmits<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >()
const slots =
  defineSlots<
    VfCloneNameSlots<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >()

/**
 * Extend the element's API by passing a 5th 'extend' callback to
 * useBlueprint — whatever it returns merges into the api / expose
 * (declare the members on VfCloneNameExpose above).
 *
 * @example
 *   useBlueprint(blueprint, props, events, slots, () => ({
 *     plain: '',
 *     vueRef: ref(''),
 *     method: (arg1: any, arg2: any) => '',
 *   }))
 *
 * @see https://primevue.vueform.com/guide/components#extending-the-logic
 */
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

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://primevue.vueform.com/guide/classes
 */
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

<script lang="ts">
import type {
  DefineRegistryEntry,
  EntryOptionGroupChildrenOf,
  EntryOptionValueKeyOf,
  EntryOptionValueReturnOf,
  EntryOptionsOf,
  ResolvedBindings,
} from '@vueform/primevue'

type VfRadioButtonGroupResolvedBindings = ResolvedBindings<
  VfCloneNameParts,
  VfRadioButtonGroupBindings
>

type EntryProps<TEntry> = VfCloneNameProps<
  EntryOptionsOf<TEntry>,
  EntryOptionValueKeyOf<TEntry>,
  EntryOptionGroupChildrenOf<TEntry>,
  any,
  EntryOptionValueReturnOf<TEntry>
>

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfCloneNameEmits<
        EntryOptionsOf<TEntry>,
        EntryOptionValueKeyOf<TEntry>,
        EntryOptionGroupChildrenOf<TEntry>,
        any,
        EntryOptionValueReturnOf<TEntry>
      >,
      VfCloneNameSlots,
      VfCloneNameParts,
      VfCloneNameClasses,
      VfCloneNameContext<EntryProps<TEntry>>
    >
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCloneName: (typeof import('./VfCloneName.vue'))['default']
  }
}
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
