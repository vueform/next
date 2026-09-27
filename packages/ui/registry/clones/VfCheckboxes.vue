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
 * VfCloneName — a custom element created from Vueform's `checkboxes` blueprint.
 *
 * @see https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  type ItemsProp,
  type ItemValueProp,
  type GroupChildrenProp,
  useBlueprint,
  defineEvents,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type ItemValueOf,
  type PartOf,
  type RawItemOf,
  type ResolvedGroup,
  type ResolvedItem,
  type WidenProps,
} from '@vueform/ui'
import {
  defaults,
  blueprint,
  type CheckboxesApi,
  type CheckboxesClasses,
  type CheckboxesEmits,
  type CheckboxesExpose,
  type CheckboxesParts,
  type CheckboxesProps,
  type CheckboxesSlots,
} from '@vueform/ui/blueprints/checkboxes'
import '@vueform/ui/choices.css'
import type { VNode } from 'vue'
import type { VfCheckboxSlots } from '@vueform/ui/components/VfCheckbox'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
> extends CheckboxesProps<
  '__TYPE__',
  TItems,
  TItemValueKey,
  TGroupChildren,
  TModel,
  TItemValueReturn,
  VfCloneNameSlots<
    TItems,
    TItemValueKey,
    TGroupChildren,
    TModel,
    TItemValueReturn
  >,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameContext<
    VfCloneNameProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >
> {}

/**
 * Emit / event definitions.
 *
 * @example
 *   custom: [arg1: any, arg2: any, context$: VfCloneNameContext]
 *
 * @see https://ui.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
> extends CheckboxesEmits<
  VfCloneNameContext<
    VfCloneNameProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >
> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://ui.vueform.com/guide/slots
 */
export interface VfCloneNameSlots<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
> extends CheckboxesSlots<
  VfCloneNameContext<
    VfCloneNameProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >
> {
  /**
   * Slot that replaces the default checkboxes rendering.
   *
   * @param props.checkboxName The shared checkbox name attribute.
   * @param props.disabled Whether the checkboxes are disabled.
   * @param props.label The element's resolved label.
   * @param props.items Resolved flat checkbox items.
   * @param props.groups Resolved checkbox groups.
   * @param props.grouped Whether items are rendered as groups.
   */
  default: (props: {
    checkboxName: string
    disabled: boolean
    label: string | undefined
    items: ResolvedItem<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >[]
    groups: ResolvedGroup<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >[]
    grouped: boolean
  }) => VNode[]

  /**
   * Slot that replaces each option group when items are grouped.
   *
   * @param props.checkboxName The shared checkbox name attribute.
   * @param props.disabled Whether the checkboxes are disabled.
   * @param props.label The element's resolved label.
   * @param props.group The resolved option group.
   */
  group: (props: {
    checkboxName: string
    disabled: boolean
    label: string | undefined
    group: ResolvedGroup<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >
  }) => VNode[]

  /**
   * Slot that replaces each entire `VfCheckbox` child.
   *
   * @param props.checkboxName The shared checkbox name attribute.
   * @param props.disabled Whether the checkboxes are disabled.
   * @param props.label The element's resolved label.
   * @param props.item The resolved checkbox item.
   */
  item: (props: {
    checkboxName: string
    disabled: boolean
    label: string | undefined
    item: ResolvedItem<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >
  }) => VNode[]

  /**
   * Slot that replaces each individual checkbox input rendering.
   *
   * Child checkboxes always use the default `true` / `false` values; the
   * holder's item value is resolved by name, not passed as `trueValue`.
   *
   * @inherits VfCheckbox.default
   */
  checkbox: (
    props: Parameters<VfCheckboxSlots<true, false>['default']>[0]
  ) => VNode[]

  /**
   * Slot that replaces the text/label of each individual checkbox.
   *
   * @inherits VfCheckbox.text
   */
  text: (props: Parameters<VfCheckboxSlots['text']>[0]) => VNode[]
}

/**
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/ui').DomAttrsOf<'div'>
 *   component: import('@vueform/ui').PartOf<'VfButton'>
 *
 * @see https://ui.vueform.com/guide/parts
 */
export interface VfCloneNameParts extends CheckboxesParts {
  /**
   * The wrapper element containing all checkbox items.
   *
   * @tag div
   */
  group: DomAttrsOf<'div'>

  /**
   * The fieldset element wrapping each group when items are grouped.
   *
   * @param group The group data.
   * @tag fieldset
   */
  fieldset: (group: Record<string, any>) => DomAttrsOf<'fieldset'>

  /**
   * The legend element displaying the group label.
   *
   * @param group The group data.
   * @tag legend
   */
  legend: (group: Record<string, any>) => DomAttrsOf<'legend'>

  /**
   * Props factory for each VfCheckbox child component, receiving the item data.
   *
   * @param items The checkbox item data.
   * @tag VfCheckbox
   */
  item: (items: Record<string, any>) => PartOf<'VfCheckbox'>
}

/**
 * Class definitions.
 *
 * @example
 *   plain: import('@vueform/ui').ClassValue
 *   dynamic: (arg1: any, arg2: any) => import('@vueform/ui').ClassValue
 *
 * @see https://ui.vueform.com/guide/classes
 */
export interface VfCloneNameClasses extends CheckboxesClasses {
  /**
   * The wrapper element containing all checkbox items.
   */
  group: ClassValue
}

/**
 * Custom exposed API members. Add props you return from useBlueprint's 5th
 * 'extend' callback.
 *
 * @example
 *   plain: string
 *   vueRef: import('vue').Ref<string>
 *   method: (arg1: any, arg2: any) => string
 *
 * @see https://ui.vueform.com/guide/components#expose-interface
 */
export interface VfCloneNameExpose extends CheckboxesExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers receive
 * (`context$`). Its shape is derived from the blueprint and the interfaces
 * above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<
    VfCloneNameProps,
    CheckboxesProps<string, ItemsProp, ItemValueProp, GroupChildrenProp>
  > = VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameExpose,
  CheckboxesApi<TProps>
> {}

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  nullValue: () => [],
})
defineEmits<
  VfCloneNameEmits<
    TItems,
    TItemValueKey,
    TGroupChildren,
    TModel,
    TItemValueReturn
  >
>()

const props = withDefaults(
  defineProps<
    VfCloneNameProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
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
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >()
const slots =
  defineSlots<
    VfCloneNameSlots<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >()

/**
 * Extend the element's API by passing a 5th 'extend' callback to useBlueprint —
 * whatever it returns merges into the api / expose (declare the members on
 * VfCloneNameExpose above).
 *
 * @example
 *   useBlueprint(blueprint, props, events, slots, () => ({
 *     plain: '',
 *     vueRef: ref(''),
 *     method: (arg1: any, arg2: any) => '',
 *   }))
 *
 * @see https://ui.vueform.com/guide/components#extending-the-logic
 */
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

/**
 * The element's own classes, per part — reactive via the callback's api refs.
 * The class keys come from VfCloneNameClasses above.
 *
 * @see https://ui.vueform.com/guide/classes
 */
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

<script lang="ts">
import type {
  DefineRegistryEntry,
  EntryGroupChildrenOf,
  EntryItemValueKeyOf,
  EntryItemValueReturnOf,
  EntryItemsOf,
} from '@vueform/ui'

type EntryProps<TEntry> = VfCloneNameProps<
  EntryItemsOf<TEntry>,
  EntryItemValueKeyOf<TEntry>,
  EntryGroupChildrenOf<TEntry>,
  any,
  EntryItemValueReturnOf<TEntry>
>

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfCloneNameEmits<
        EntryItemsOf<TEntry>,
        EntryItemValueKeyOf<TEntry>,
        EntryGroupChildrenOf<TEntry>,
        any,
        EntryItemValueReturnOf<TEntry>
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
