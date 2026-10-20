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
  InputAriaBag,
  LayoutRegionBindings,
} from '@vueform/core'
import type { CascadeSelectProps as PvCascadeSelectProps } from 'primevue'
import type { CascadeSelectSlots as ACascadeSelectSlots } from 'primevue/cascadeselect'
import type { VNode } from 'vue'

import type {
  CascadeSelectApi,
  CascadeSelectBindings,
  CascadeSelectClasses,
  CascadeSelectEmits,
  CascadeSelectExpose,
  CascadeSelectParts,
  CascadeSelectProps,
  CascadeSelectSlots,
  forwards,
} from '#src/blueprints/cascade-select'
import type {
  FloatLabelClasses,
  FloatLabelParts,
  FloatLabelSlots,
  IftaClasses,
  IftaParts,
  IftaSlots,
  OptionsProp,
  OptionValueProp,
} from '#src/features'
import type {
  CascadeOptionGroupChildrenProp,
  EntryOptionsOf,
  EntryOptionValueKeyOf,
  EntryOptionValueReturnOf,
  EntryOptionGroupChildrenOf,
} from '#src/features/options'
import type { ForwardedSlots, OverrideSlots } from '#src/types'

/**
 * VfCascadeSelect props narrowed from a registry `TEntry` payload, applying the
 * entry's `options` / `optionValue` / `optionGroupChildren` props as generics.
 * Group children use the cascade bound, which also admits nested path arrays.
 */
export type EntryProps<TEntry> = VfCascadeSelectProps<
  EntryOptionsOf<TEntry>,
  EntryOptionValueKeyOf<TEntry>,
  EntryOptionGroupChildrenOf<TEntry, CascadeOptionGroupChildrenProp>,
  any,
  EntryOptionValueReturnOf<TEntry>
>

/**
 * Generic props interface for the VfCascadeSelect component, parameterized by
 * the option-driving type arguments (e.g. `VfCascadeSelectProps<typeof options,
 * 'id'>`). Reach for `VfCascadeSelectProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfCascadeSelectProps<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends CascadeOptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends CascadeSelectProps<
  'cascade-select',
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TModel,
  TOptionValueReturn,
  VfCascadeSelectSlots<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TModel,
    TOptionValueReturn
  >,
  VfCascadeSelectParts,
  VfCascadeSelectClasses,
  VfCascadeSelectContext<
    VfCascadeSelectProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {}

/**
 * Events emitted by the VfCascadeSelect component, parameterized by the
 * option-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfCascadeSelectSlots`. Plain usage
 * (`VfCascadeSelectEmits`) keeps the context wide.
 */
export interface VfCascadeSelectEmits<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends CascadeOptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends CascadeSelectEmits<
  VfCascadeSelectContext<
    VfCascadeSelectProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {}

/**
 * Slots available in the VfCascadeSelect component.
 *
 * Forwarded PrimeVue slot shapes use wide item/model types.
 */
export interface VfCascadeSelectSlots<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends CascadeOptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
>
  extends
    CascadeSelectSlots<
      VfCascadeSelectContext<
        VfCascadeSelectProps<
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
      ForwardedSlots<ACascadeSelectSlots, (typeof forwards.slots)[number]>,
      {
        /**
         * Custom content for each option.
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
        }) => VNode[]

        /**
         * Custom value template.
         */
        value: (scope: {
          /**
           * Value of the component.
           */
          value: any

          /**
           * Placeholder text to show.
           */
          placeholder: string
        }) => VNode[]

        /**
         * Custom header template.
         */
        header: (scope: {
          /**
           * Current value.
           */
          value: any

          /**
           * Options of the component.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom footer template.
         */
        footer: (scope: {
          /**
           * Current value.
           */
          value: any

          /**
           * Options of the component.
           */
          options: any[]
        }) => VNode[]
      }
    > {}

/**
 * Structural parts of the VfCascadeSelect component.
 */
export interface VfCascadeSelectParts
  extends
    CascadeSelectParts,
    AddonsParts,
    AddonGroupParts,
    IconsParts,
    FloatLabelParts,
    IftaParts {
  /**
   * The cascade-select input element.
   *
   * @tag CascadeSelect
   */
  input: PvCascadeSelectProps
}

/**
 * CSS classes for the VfCascadeSelect component's structural parts.
 */
export interface VfCascadeSelectClasses
  extends CascadeSelectClasses, FloatLabelClasses, IftaClasses {
  /**
   * The cascade-select input element.
   */
  input: ClassValue
}

/**
 * Part-keyed attribute bindings of the VfCascadeSelect component: its own
 * state markers merged with the `inputAria` pattern entries it registers via
 * `useBindings`.
 */
export interface VfCascadeSelectBindings
  extends CascadeSelectBindings, LayoutRegionBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The input control's validation and ARIA state.
   */
  input: {
    'data-invalid'?: ''
  } & InputAriaBag
}

/**
 * Augmentable public API surface for VfCascadeSelect.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `CascadeSelectExpose` for all cascade-select-based
 * components) so they appear on `ContextOf<'VfCascadeSelect'>` / `context$` /
 * `defineExpose`.
 */
export interface VfCascadeSelectExpose extends CascadeSelectExpose {}

/**
 * Public context for VfCascadeSelect, optionally parameterized by concrete
 * props (e.g. `VfCascadeSelectContext<VfCascadeSelectProps<typeof options,
 * 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfCascadeSelectContext<
  TProps extends WidenProps<
    VfCascadeSelectProps,
    CascadeSelectProps<
      string,
      OptionsProp,
      OptionValueProp,
      CascadeOptionGroupChildrenProp
    >
  > = VfCascadeSelectProps,
> extends DefineElementContext<
  TProps,
  VfCascadeSelectEmits,
  VfCascadeSelectSlots,
  VfCascadeSelectParts,
  VfCascadeSelectClasses,
  VfCascadeSelectBindings,
  VfCascadeSelectExpose,
  CascadeSelectApi<TProps>
> {}

/**
 * Registry entry for VfCascadeSelect. `TEntry` narrows the props / emits /
 * context by the entry's option-driving props, the same way SFC generics do.
 */
export interface VfCascadeSelectEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfCascadeSelectEmits<
    EntryOptionsOf<TEntry>,
    EntryOptionValueKeyOf<TEntry>,
    EntryOptionGroupChildrenOf<TEntry, CascadeOptionGroupChildrenProp>,
    any,
    EntryOptionValueReturnOf<TEntry>
  >,
  VfCascadeSelectSlots,
  VfCascadeSelectParts,
  VfCascadeSelectClasses,
  VfCascadeSelectContext<EntryProps<TEntry>>
> {}
