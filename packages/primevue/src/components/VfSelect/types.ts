import type {
  SelectApi,
  SelectClasses,
  SelectEmits,
  SelectExpose,
  SelectParts,
  SelectProps,
  SelectSlots,
  forwards,
} from '#primevue/blueprints/select'
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
} from '#primevue/features'
import type { ForwardedSlots, OverrideSlots } from '#primevue/types'
import type {
  ClassValue,
  AddonsSlots,
  IconsSlots,
  AddonsParts,
  IconsParts,
  AddonGroupParts,
  EntryMultipleOf,
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
} from '@vueform/core'
import type { SelectProps as PvSelectProps } from 'primevue'
import type { SelectSlots as ASelectSlots } from 'primevue/select'
import type { VirtualScrollerItemOptions } from 'primevue/virtualscroller'
import type { VNode } from 'vue'

/**
 * VfSelect props narrowed from a registry `TEntry` payload, applying the
 * entry's `options` / `optionValue` / `optionGroupChildren` / `multiple` props
 * as generics.
 */
export type EntryProps<TEntry> = VfSelectProps<
  EntryOptionsOf<TEntry>,
  EntryOptionValueKeyOf<TEntry>,
  EntryOptionGroupChildrenOf<TEntry>,
  EntryMultipleOf<TEntry>,
  any,
  EntryOptionValueReturnOf<TEntry>
>

/**
 * Generic props interface for the VfSelect component, parameterized by the
 * option-driving type arguments (e.g. `VfSelectProps<typeof options, 'id'>`).
 * Reach for `VfSelectProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
export interface VfSelectProps<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
> extends SelectProps<
  'select',
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TMultiple,
  TModel,
  TOptionValueReturn,
  VfSelectSlots<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TMultiple,
    TModel,
    TOptionValueReturn
  >,
  VfSelectParts,
  VfSelectClasses,
  VfSelectContext<
    VfSelectProps<
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
 * Events emitted by the VfSelect component, parameterized by the option-driving
 * type arguments so event handlers (e.g. `@change`) receive the narrowed
 * context — same pattern as `VfSelectSlots`. Plain usage (`VfSelectEmits`)
 * keeps the context wide.
 */
export interface VfSelectEmits<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
> extends SelectEmits<
  VfSelectContext<
    VfSelectProps<
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
 * Slots available in the VfSelect component.
 *
 * `#template` is generic-aware; forwarded PrimeVue slot shapes use wide
 * item/model types.
 */
export interface VfSelectSlots<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
>
  extends
    SelectSlots<
      VfSelectContext<
        VfSelectProps<
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
        value: (props: {
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
        header: (props: {
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
        footer: (props: {
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
         * Custom option group template.
         */
        optiongroup: (props: {
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
        content: (props: {
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
 * Structural parts of the VfSelect component.
 */
export interface VfSelectParts
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
 * CSS classes for the VfSelect component's structural parts.
 */
export interface VfSelectClasses
  extends SelectClasses, FloatLabelClasses, IftaClasses {
  /**
   * The select input element.
   */
  input: ClassValue
}

/**
 * Augmentable public API surface for VfSelect.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `SelectExpose` for all select-based components) so they
 * appear on `ContextOf<'VfSelect'>` / `context$` / `defineExpose`.
 */
export interface VfSelectExpose extends SelectExpose {}

/**
 * Public context for VfSelect, optionally parameterized by concrete props (e.g.
 * `VfSelectContext<VfSelectProps<typeof options, 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfSelectContext<
  TProps extends WidenProps<
    VfSelectProps,
    SelectProps<string, OptionsProp, OptionValueProp, OptionGroupChildrenProp>
  > = VfSelectProps,
> extends DefineElementContext<
  TProps,
  VfSelectEmits,
  VfSelectSlots,
  VfSelectParts,
  VfSelectClasses,
  VfSelectExpose,
  SelectApi<TProps>
> {}

/**
 * Registry entry for VfSelect. `TEntry` narrows the props / emits / context by
 * the entry's option-driving props, the same way SFC generics do.
 */
export interface VfSelectEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfSelectEmits<
    EntryOptionsOf<TEntry>,
    EntryOptionValueKeyOf<TEntry>,
    EntryOptionGroupChildrenOf<TEntry>,
    EntryMultipleOf<TEntry>,
    any,
    EntryOptionValueReturnOf<TEntry>
  >,
  VfSelectSlots,
  VfSelectParts,
  VfSelectClasses,
  VfSelectContext<EntryProps<TEntry>>
> {}
