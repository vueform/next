<script
  setup
  lang="ts"
  generic="
    TOptions extends OptionsProp = OptionsProp,
    TOptionValueKey extends OptionValueProp = undefined,
    TGroupChildren extends OptionGroupChildrenProp = undefined,
    TOptionValueReturn = unknown,
    TMultiple extends boolean = false,
    TModel = any
  "
>
/**
 * VfCloneName — a custom element created from Vueform's `select` blueprint.
 *
 * @see https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  type OptionGroupChildrenProp,
  type OptionsProp,
  type OptionValueProp,
  vdomPrime,
  type AddonGroupParts,
  type AddonsParts,
  type AddonsSlots,
  type ClassValue,
  type DefineElementContext,
  type FloatLabelClasses,
  type FloatLabelParts,
  type FloatLabelSlots,
  type ForwardedSlots,
  type IconsParts,
  type IconsSlots,
  type IftaClasses,
  type IftaParts,
  type IftaSlots,
  type OverrideSlots,
  type WidenProps,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type SelectApi,
  type SelectClasses,
  type SelectEmits,
  type SelectExpose,
  type SelectParts,
  type SelectProps,
  type SelectSlots,
  type forwards,
} from '@vueform/primevue/blueprints/select'
import type { SelectProps as PvSelectProps } from 'primevue'
import PrimeSelect, { type SelectSlots as ASelectSlots } from 'primevue/select'
import type { VirtualScrollerItemOptions } from 'primevue/virtualscroller'
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
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
> extends SelectProps<
  '__TYPE__',
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TMultiple,
  TModel,
  TOptionValueReturn,
  VfCloneNameSlots<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TMultiple,
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
      TMultiple,
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
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
> extends SelectEmits<
  VfCloneNameContext<
    VfCloneNameProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TMultiple,
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
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
>
  extends
    SelectSlots<
      VfCloneNameContext<
        VfCloneNameProps<
          TOptions,
          TOptionValueKey,
          TGroupChildren,
          TMultiple,
          TModel,
          TOptionValueReturn
        >
      >
    >,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    /* @vue-ignore */ OverrideSlots<
      ForwardedSlots<ASelectSlots, (typeof forwards.slots)[number]>,
      {
        /**
         * Custom value template.
         */
        value: (scope: {
          /**
           * Value of the component.
           */
          value: any

          /**
           * Placeholder prop value.
           */
          placeholder: string
        }) => VNode[]

        /**
         * Custom header template of panel.
         */
        header: (scope: {
          /**
           * Value of the component.
           */
          value: any

          /**
           * Displayed options.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom footer template of panel.
         */
        footer: (scope: {
          /**
           * Value of the component.
           */
          value: any

          /**
           * Displayed options.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom option template.
         */
        option: (scope: {
          /**
           * The raw option item.
           */
          option: any

          /**
           * Selection state.
           */
          selected: boolean

          /**
           * Index of the option.
           */
          index: number
        }) => VNode[]

        /**
         * Custom option group template.
         */
        optiongroup: (scope: {
          /**
           * The raw option group (or raw item when ungrouped).
           */
          option: any

          /**
           * Index of the option group.
           */
          index: number
        }) => VNode[]

        /**
         * Custom content template.
         */
        content: (scope: {
          /**
           * An array of objects to display for virtualscroller.
           */
          items: any[]

          /**
           * Style class of the component.
           */
          styleClass: string

          /**
           * Reference of the content.
           *
           * @param el The element of the content reference.
           */
          contentRef: (el: any) => void

          /**
           * Options of the items.
           *
           * @param index The rendered index of the item.
           */
          getItemOptions: (index: number) => VirtualScrollerItemOptions
        }) => VNode[]
      }
    > {}

/**
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/primevue').DomAttrsOf<'div'>
 *   component: import('@vueform/primevue').PartOf<'VfButton'>
 *
 * @see https://primevue.vueform.com/guide/parts
 */
export interface VfCloneNameParts
  extends
    SelectParts,
    AddonsParts,
    AddonGroupParts,
    IconsParts,
    FloatLabelParts,
    IftaParts {
  /**
   * The select input element.
   *
   * @tag Select
   */
  input: PvSelectProps
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
export interface VfCloneNameClasses
  extends SelectClasses, FloatLabelClasses, IftaClasses {
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
 * @see https://primevue.vueform.com/guide/components#expose-interface
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
    SelectProps<string, OptionsProp, OptionValueProp, OptionGroupChildrenProp>
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

const PvSelect = vdomPrime(PrimeSelect)

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.multiple ? [] : null),
})
defineEmits<
  VfCloneNameEmits<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TMultiple,
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
      TMultiple,
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
      TMultiple,
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
      TMultiple,
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
const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://primevue.vueform.com/guide/classes
 */
useClasses(({ help }) => ({
  root: {
    'vf-select': true,
    'vf-align-label': !help.value,
  },
}))

const {
  id,
  placeholder,
  viewLoaded,
  disabled,
  loading,
  resolving,
  aria,
  input,
  name,
  invalid,
  rawItems,
  itemLabel,
  itemValue,
  itemDisabled,
  value,
  forwardProps,
  forwardSlots,
  handleInput,
  handleFocus,
  handleBlur,
} = api

const { optionGroupLabel, optionGroupChildren } = propRefs

defineExpose(expose)
</script>

<script lang="ts">
import type {
  DefineRegistryEntry,
  EntryMultipleOf,
  EntryOptionGroupChildrenOf,
  EntryOptionValueKeyOf,
  EntryOptionValueReturnOf,
  EntryOptionsOf,
} from '@vueform/primevue'

type EntryProps<TEntry> = VfCloneNameProps<
  EntryOptionsOf<TEntry>,
  EntryOptionValueKeyOf<TEntry>,
  EntryOptionGroupChildrenOf<TEntry>,
  EntryMultipleOf<TEntry>,
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
        EntryMultipleOf<TEntry>,
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
    <VfLayout v-else>
      <PvSelect
        :name
        :id
        :class="classes.input"
        v-model="value"
        :options="rawItems"
        :option-label="itemLabel"
        :option-value="itemValue"
        :option-disabled="itemDisabled"
        :option-group-label
        :option-group-children
        :placeholder
        :disabled
        :loading="loading || resolving"
        :invalid
        fluid
        v-bind="{
          ...aria,
          ...forwardProps,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="(e) => handleInput(e.value, e.originalEvent)"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </PvSelect>
    </VfLayout>
  </slot>
</template>
