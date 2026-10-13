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
 * VfCloneName — a custom element created from Vueform's `listbox` blueprint.
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
  type ClassValue,
  type DefineElementContext,
  type ForwardedSlots,
  type OverrideSlots,
  type WidenProps,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type ListboxApi,
  type ListboxClasses,
  type ListboxEmits,
  type ListboxExpose,
  type ListboxParts,
  type ListboxProps,
  type ListboxSlots,
  type forwards,
} from '@vueform/primevue/blueprints/listbox'
import type { ListboxProps as PvListboxProps } from 'primevue'
import PrimeListbox, {
  type ListboxSlots as AListboxSlots,
} from 'primevue/listbox'
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
> extends ListboxProps<
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
> extends ListboxEmits<
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
    ListboxSlots<
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
    /* @vue-ignore */ OverrideSlots<
      ForwardedSlots<AListboxSlots, (typeof forwards.slots)[number]>,
      {
        /**
         * Custom header template.
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
         * Custom footer template.
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
export interface VfCloneNameParts extends ListboxParts {
  /**
   * The listbox input element.
   *
   * @tag Listbox
   */
  input: PvListboxProps
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
export interface VfCloneNameClasses extends ListboxClasses {
  /**
   * The listbox input element.
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
export interface VfCloneNameExpose extends ListboxExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<
    VfCloneNameProps,
    ListboxProps<string, OptionsProp, OptionValueProp, OptionGroupChildrenProp>
  > = VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameExpose,
  ListboxApi<TProps>
> {}

const Listbox = vdomPrime(PrimeListbox)

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
    'vf-listbox': true,
    'vf-align-label': !help.value,
  },
}))

const {
  value,
  viewLoaded,
  disabled,
  aria,
  input,
  invalid,
  rawItems,
  itemLabel,
  itemValue,
  itemDisabled,
  forwardProps,
  forwardSlots,
  handleInput,
  handleFocus,
  handleBlur,
} = api

const { optionGroupLabel, optionGroupChildren, multiple } = propRefs

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
      <Listbox
        :class="classes.input"
        v-model="value"
        :options="rawItems"
        :option-label="itemLabel"
        :option-value="itemValue"
        :option-disabled="itemDisabled"
        :option-group-label
        :option-group-children
        :disabled
        :invalid
        :multiple
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
      </Listbox>
    </VfLayout>
  </slot>
</template>
