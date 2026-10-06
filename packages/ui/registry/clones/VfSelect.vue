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
 * VfCloneName — a custom element created from Vueform's `select` blueprint.
 *
 * @see https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  useBlueprint,
  type ItemsProp,
  type GroupChildrenProp,
  type ItemValueProp,
  defineEvents,
  type AddonGroupClasses,
  type AddonsParts,
  type AddonsSlots,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type IconsClasses,
  type IconsParts,
  type IconsSlots,
  type ItemValueOf,
  type RawItemOf,
  type ResolvedItem,
  type WidenProps,
} from '@vueform/ui'
import {
  defaults,
  blueprint,
  type SelectApi,
  type SelectClasses,
  type SelectEmits,
  type SelectExpose,
  type SelectParts,
  type SelectProps,
  type SelectSlots,
} from '@vueform/ui/blueprints/select'

import '@vueform/ui/select.css'
import '@vueform/ui/input.css'
import type { VNode } from 'vue'

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
  TMultiple extends boolean = false,
  TModel = any,
  TItemValueReturn = unknown,
> extends SelectProps<
  '__TYPE__',
  TItems,
  TItemValueKey,
  TGroupChildren,
  TMultiple,
  TModel,
  TItemValueReturn,
  VfCloneNameSlots<
    TItems,
    TItemValueKey,
    TGroupChildren,
    TMultiple,
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
      TMultiple,
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
  TMultiple extends boolean = false,
  TModel = any,
  TItemValueReturn = unknown,
> extends SelectEmits<
  VfCloneNameContext<
    VfCloneNameProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TMultiple,
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
  TMultiple extends boolean = false,
  TModel = any,
  TItemValueReturn = unknown,
  TValue = ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
  TRaw = RawItemOf<TItems, TGroupChildren>,
>
  extends
    SelectSlots<
      VfCloneNameContext<
        VfCloneNameProps<
          TItems,
          TItemValueKey,
          TGroupChildren,
          TMultiple,
          TModel,
          TItemValueReturn
        >
      >
    >,
    AddonsSlots,
    IconsSlots {
  /**
   * Slot that replaces the label of each native option.
   *
   * @param props.item The resolved option item.
   */
  option: (props: { item: ResolvedItem<TValue, TRaw> }) => VNode[]
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
export interface VfCloneNameParts extends SelectParts, AddonsParts, IconsParts {
  /**
   * The addon group wrapper element.
   *
   * @tag div
   */
  addonGroup: DomAttrsOf<'div'>

  /**
   * The select input element.
   *
   * @tag select
   */
  input: DomAttrsOf<'select'>
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
export interface VfCloneNameClasses
  extends SelectClasses, AddonGroupClasses, IconsClasses {
  /**
   * The select input element.
   */
  input: ClassValue
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
 * @see https://ui.vueform.com/guide/components#expose-interface
 */
export interface VfCloneNameExpose extends SelectExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<
    VfCloneNameProps,
    SelectProps<string, ItemsProp, ItemValueProp, GroupChildrenProp>
  > = VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameExpose,
  SelectApi<TProps>
> {}

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.multiple ? [] : null),
})
defineEmits<
  VfCloneNameEmits<
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
    VfCloneNameProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TMultiple,
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
      TMultiple,
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
      TMultiple,
      TModel,
      TItemValueReturn
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
 * @see https://ui.vueform.com/guide/components#extending-the-logic
 */
const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://ui.vueform.com/guide/classes
 */
useClasses(({ help, empty, hasError, props }) => ({
  root: {
    'vf-select': true,
    'vf-align-label': !help.value,
  },
  addonGroup: 'vf-addon-group',
  iconGroup: 'vf-icon-group',
  input: {
    'vf-input': true,
    'vf-select-input': true,
    'vf-placeholder': empty.value && !!props.placeholder,
    'vf-danger': hasError.value,
  },
}))

const {
  id,
  loading,
  placeholder,
  viewLoaded,
  disabled,
  aria,
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

<script lang="ts">
import type {
  DefineRegistryEntry,
  EntryGroupChildrenOf,
  EntryItemValueKeyOf,
  EntryItemValueReturnOf,
  EntryItemsOf,
  EntryMultipleOf,
} from '@vueform/ui'

type EntryProps<TEntry> = VfCloneNameProps<
  EntryItemsOf<TEntry>,
  EntryItemValueKeyOf<TEntry>,
  EntryGroupChildrenOf<TEntry>,
  EntryMultipleOf<TEntry>,
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
        EntryMultipleOf<TEntry>,
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
    <VfLayout v-else :loading>
      <select
        v-model="value"
        :name
        :id
        :class="classes.input"
        :disabled
        :multiple
        :ref="(el) => (input = el)"
        v-bind="{
          ...aria,
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
