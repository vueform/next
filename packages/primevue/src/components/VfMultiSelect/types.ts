import type {
  ClassValue,
  AddonsSlots,
  IconsSlots,
  AddonsParts,
  IconsParts,
  AddonGroupParts,
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
} from '@vueform/core'
import type { MultiSelectProps as PvMultiSelectProps } from 'primevue'
import type { MultiSelectSlots as AMultiSelectSlots } from 'primevue/multiselect'
import type { VNode } from 'vue'

import type {
  MultiSelectApi,
  MultiSelectClasses,
  MultiSelectEmits,
  MultiSelectExpose,
  MultiSelectParts,
  MultiSelectProps,
  MultiSelectSlots,
  forwards,
} from '#src/blueprints/multi-select'
import type {
  FloatLabelClasses,
  FloatLabelParts,
  FloatLabelSlots,
  IftaClasses,
  IftaParts,
  IftaSlots,
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
 * VfMultiSelect props narrowed from a registry `TEntry` payload, applying the
 * entry's `options` / `optionValue` / `optionGroupChildren` props as generics.
 * Selection is always multiple.
 */
export type EntryProps<TEntry> = VfMultiSelectProps<
  EntryOptionsOf<TEntry>,
  EntryOptionValueKeyOf<TEntry>,
  EntryOptionGroupChildrenOf<TEntry>,
  any,
  EntryOptionValueReturnOf<TEntry>
>

/**
 * Generic props interface for the VfMultiSelect component, parameterized by the
 * option-driving type arguments (e.g. `VfMultiSelectProps<typeof options,
 * 'id'>`). Reach for `VfMultiSelectProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfMultiSelectProps<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends MultiSelectProps<
  'multi-select',
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TModel,
  TOptionValueReturn,
  VfMultiSelectSlots<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TModel,
    TOptionValueReturn
  >,
  VfMultiSelectParts,
  VfMultiSelectClasses,
  VfMultiSelectContext<
    VfMultiSelectProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {}

/**
 * Events emitted by the VfMultiSelect component, parameterized by the
 * option-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfMultiSelectSlots`. Plain usage
 * (`VfMultiSelectEmits`) keeps the context wide.
 */
export interface VfMultiSelectEmits<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends MultiSelectEmits<
  VfMultiSelectContext<
    VfMultiSelectProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {}

/**
 * Slots available in the VfMultiSelect component.
 *
 * `#template` is generic-aware; forwarded PrimeVue slot shapes use wide
 * item/model types.
 */
export interface VfMultiSelectSlots<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
>
  extends
    MultiSelectSlots<
      VfMultiSelectContext<
        VfMultiSelectProps<
          TOptions,
          TOptionValueKey,
          TGroupChildren,
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
      ForwardedSlots<AMultiSelectSlots, (typeof forwards.slots)[number]>,
      {
        /**
         * Custom selected value display.
         */
        value: (props: {
          /**
           * Selected values of the component.
           */
          value: any

          /**
           * Placeholder prop value.
           */
          placeholder: string
        }) => VNode[]

        /**
         * Custom chip template for a selected value.
         */
        chip: (props: {
          /**
           * A value in the selection.
           */
          value: any

          /**
           * Removes the chip from the selection.
           *
           * @param event Browser event.
           * @param item Selected value to remove.
           */
          removeCallback: (event: Event, item: any) => void
        }) => VNode[]

        /**
         * Custom chip remove icon template.
         */
        chipicon: (props: {
          /**
           * Style class of the icon.
           */
          class: string

          /**
           * Selected value associated with the chip.
           */
          item: any

          /**
           * Removes the chip from the selection.
           *
           * @param event Browser event.
           * @param item Selected value to remove.
           */
          removeCallback: (event: Event, item: any) => void
        }) => VNode[]

        /**
         * Custom header template of the overlay panel.
         */
        header: (props: {
          /**
           * Selected values of the component.
           */
          value: any

          /**
           * Displayed options.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom footer template of the overlay panel.
         */
        footer: (props: {
          /**
           * Selected values of the component.
           */
          value: any

          /**
           * Displayed options.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom content for each option.
         */
        option: (props: {
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
         * Custom content for each option group.
         */
        optiongroup: (props: {
          /**
           * The option group, or raw item when groups are not used.
           */
          option: any

          /**
           * Index of the option group.
           */
          index: number
        }) => VNode[]

        /**
         * Custom content template for virtual scrolling.
         */
        content: (props: {
          /**
           * Items to display for the virtual scroller.
           */
          items: any[]

          /**
           * Style class of the content.
           */
          styleClass: string

          /**
           * Sets the content element ref.
           *
           * @param el Content element.
           */
          contentRef: (el: any) => void

          /**
           * Returns virtual scroller item options for a rendered index.
           *
           * @param index Rendered index.
           */
          getItemOptions: (index: number) => any
        }) => VNode[]
      }
    > {}

/**
 * Structural parts of the VfMultiSelect component.
 */
export interface VfMultiSelectParts
  extends
    MultiSelectParts,
    AddonsParts,
    AddonGroupParts,
    IconsParts,
    FloatLabelParts,
    IftaParts {
  /**
   * The multi-select input element.
   *
   * @tag MultiSelect
   */
  input: PvMultiSelectProps
}

/**
 * CSS classes for the VfMultiSelect component's structural parts.
 */
export interface VfMultiSelectClasses
  extends MultiSelectClasses, FloatLabelClasses, IftaClasses {
  /**
   * The multi-select input element.
   */
  input: ClassValue
}

/**
 * Augmentable public API surface for VfMultiSelect.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `MultiSelectExpose` for all multi-select-based
 * components) so they appear on `ContextOf<'VfMultiSelect'>` / `context$` /
 * `defineExpose`.
 */
export interface VfMultiSelectExpose extends MultiSelectExpose {}

/**
 * Public context for VfMultiSelect, optionally parameterized by concrete props
 * (e.g. `VfMultiSelectContext<VfMultiSelectProps<typeof options, 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfMultiSelectContext<
  TProps extends WidenProps<
    VfMultiSelectProps,
    MultiSelectProps<
      string,
      OptionsProp,
      OptionValueProp,
      OptionGroupChildrenProp
    >
  > = VfMultiSelectProps,
> extends DefineElementContext<
  TProps,
  VfMultiSelectEmits,
  VfMultiSelectSlots,
  VfMultiSelectParts,
  VfMultiSelectClasses,
  VfMultiSelectExpose,
  MultiSelectApi<TProps>
> {}

/**
 * Registry entry for VfMultiSelect. `TEntry` narrows the props / emits /
 * context by the entry's option-driving props, the same way SFC generics do.
 */
export interface VfMultiSelectEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfMultiSelectEmits<
    EntryOptionsOf<TEntry>,
    EntryOptionValueKeyOf<TEntry>,
    EntryOptionGroupChildrenOf<TEntry>,
    any,
    EntryOptionValueReturnOf<TEntry>
  >,
  VfMultiSelectSlots,
  VfMultiSelectParts,
  VfMultiSelectClasses,
  VfMultiSelectContext<EntryProps<TEntry>>
> {}
