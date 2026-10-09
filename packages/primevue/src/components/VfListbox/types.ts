import type {
  ClassValue,
  EntryMultipleOf,
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
} from '@vueform/core'
import type { ListboxProps as PvListboxProps } from 'primevue'
import type { ListboxSlots as AListboxSlots } from 'primevue/listbox'
import type { VirtualScrollerItemOptions } from 'primevue/virtualscroller'
import type { VNode } from 'vue'

import type {
  ListboxApi,
  ListboxClasses,
  ListboxEmits,
  ListboxExpose,
  ListboxParts,
  ListboxProps,
  ListboxSlots,
  forwards,
} from '#src/blueprints/listbox'
import type {
  EntryOptionsOf,
  EntryOptionValueKeyOf,
  EntryOptionValueReturnOf,
  EntryOptionGroupChildrenOf,
  OptionGroupChildrenProp,
  OptionsProp,
  OptionValueProp,
} from '#src/features'
import type { ForwardedSlots, OverrideSlots } from '#src/types'

/**
 * VfListbox props narrowed from a registry `TEntry` payload, applying the
 * entry's `options` / `optionValue` / `optionGroupChildren` / `multiple` props
 * as generics.
 */
export type EntryProps<TEntry> = VfListboxProps<
  EntryOptionsOf<TEntry>,
  EntryOptionValueKeyOf<TEntry>,
  EntryOptionGroupChildrenOf<TEntry>,
  EntryMultipleOf<TEntry>,
  any,
  EntryOptionValueReturnOf<TEntry>
>

/**
 * Generic props interface for the VfListbox component, parameterized by the
 * option-driving type arguments (e.g. `VfListboxProps<typeof options, 'id'>`).
 * Reach for `VfListboxProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfListboxProps<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
> extends ListboxProps<
  'listbox',
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TMultiple,
  TModel,
  TOptionValueReturn,
  VfListboxSlots<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TMultiple,
    TModel,
    TOptionValueReturn
  >,
  VfListboxParts,
  VfListboxClasses,
  VfListboxContext<
    VfListboxProps<
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
 * Events emitted by the VfListbox component, parameterized by the
 * option-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfListboxSlots`. Plain usage
 * (`VfListboxEmits`) keeps the context wide.
 */
export interface VfListboxEmits<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
> extends ListboxEmits<
  VfListboxContext<
    VfListboxProps<
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
 * Slots available in the VfListbox component.
 *
 * Forwarded PrimeVue slot shapes use wide item/model types.
 */
export interface VfListboxSlots<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
>
  extends
    ListboxSlots<
      VfListboxContext<
        VfListboxProps<
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
           */
          contentRef: (el: any) => void

          /**
           * Options of the items.
           */
          getItemOptions: (index: number) => VirtualScrollerItemOptions
        }) => VNode[]
      }
    > {}

/**
 * Structural parts of the VfListbox component.
 */
export interface VfListboxParts extends ListboxParts {
  /**
   * The listbox input element.
   *
   * @tag Listbox
   */
  input: PvListboxProps
}

/**
 * CSS classes for the VfListbox component's structural parts.
 */
export interface VfListboxClasses extends ListboxClasses {
  /**
   * The listbox input element.
   */
  input: ClassValue
}

/**
 * Augmentable public API surface for VfListbox.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `ListboxExpose` for all listbox-based components) so they
 * appear on `ContextOf<'VfListbox'>` / `context$` / `defineExpose`.
 */
export interface VfListboxExpose extends ListboxExpose {}

/**
 * Public context for VfListbox, optionally parameterized by concrete props
 * (e.g. `VfListboxContext<VfListboxProps<typeof options, 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfListboxContext<
  TProps extends WidenProps<
    VfListboxProps,
    ListboxProps<string, OptionsProp, OptionValueProp, OptionGroupChildrenProp>
  > = VfListboxProps,
> extends DefineElementContext<
  TProps,
  VfListboxEmits,
  VfListboxSlots,
  VfListboxParts,
  VfListboxClasses,
  VfListboxExpose,
  ListboxApi<TProps>
> {}

/**
 * Registry entry for VfListbox. `TEntry` narrows the props / emits / context by
 * the entry's option-driving props, the same way SFC generics do.
 */
export interface VfListboxEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfListboxEmits<
    EntryOptionsOf<TEntry>,
    EntryOptionValueKeyOf<TEntry>,
    EntryOptionGroupChildrenOf<TEntry>,
    EntryMultipleOf<TEntry>,
    any,
    EntryOptionValueReturnOf<TEntry>
  >,
  VfListboxSlots,
  VfListboxParts,
  VfListboxClasses,
  VfListboxContext<EntryProps<TEntry>>
> {}
