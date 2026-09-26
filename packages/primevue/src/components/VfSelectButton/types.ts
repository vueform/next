import type {
  SelectButtonApi,
  SelectButtonClasses,
  SelectButtonEmits,
  SelectButtonExpose,
  SelectButtonParts,
  SelectButtonProps,
  SelectButtonSlots,
  forwards,
} from '#primevue/blueprints/select-button'
import type {
  EntryOptionsOf,
  EntryOptionValueKeyOf,
  EntryOptionValueReturnOf,
  OptionsProp,
  OptionValueProp,
} from '#primevue/features'
import type {
  ForwardedSlots,
  OverrideSlots,
  WithPtShorthands,
} from '#primevue/types'
import type {
  ClassValue,
  EntryMultipleOf,
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
} from '@vueform/core'
import type { SelectButtonProps as PvSelectButtonProps } from 'primevue'
import type { SelectButtonSlots as ASelectButtonSlots } from 'primevue/selectbutton'
import type { VNode } from 'vue'

/**
 * VfSelectButton props narrowed from a registry `TEntry` payload, applying the
 * entry's `options` / `optionValue` / `multiple` props as generics. Groups are
 * not supported.
 */
export type EntryProps<TEntry> = VfSelectButtonProps<
  EntryOptionsOf<TEntry>,
  EntryOptionValueKeyOf<TEntry>,
  EntryMultipleOf<TEntry>,
  any,
  EntryOptionValueReturnOf<TEntry>
>

/**
 * Generic props interface for the VfSelectButton component, parameterized by
 * the option-driving type arguments (e.g. `VfSelectButtonProps<typeof options,
 * 'id'>`). Reach for `VfSelectButtonProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
export interface VfSelectButtonProps<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
> extends SelectButtonProps<
  'select-button',
  TOptions,
  TOptionValueKey,
  TMultiple,
  TModel,
  TOptionValueReturn,
  VfSelectButtonSlots<
    TOptions,
    TOptionValueKey,
    TMultiple,
    TModel,
    TOptionValueReturn
  >,
  VfSelectButtonParts,
  VfSelectButtonClasses,
  VfSelectButtonContext<
    VfSelectButtonProps<
      TOptions,
      TOptionValueKey,
      TMultiple,
      TModel,
      TOptionValueReturn
    >
  >
> {}

/**
 * Events emitted by the VfSelectButton component, parameterized by the
 * option-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfSelectButtonSlots`. Plain usage
 * (`VfSelectButtonEmits`) keeps the context wide.
 */
export interface VfSelectButtonEmits<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
> extends SelectButtonEmits<
  VfSelectButtonContext<
    VfSelectButtonProps<
      TOptions,
      TOptionValueKey,
      TMultiple,
      TModel,
      TOptionValueReturn
    >
  >
> {}

/**
 * Slots available in the VfSelectButton component.
 *
 * Forwarded PrimeVue slot shapes use wide item/model types.
 */
export interface VfSelectButtonSlots<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
>
  extends
    SelectButtonSlots<
      VfSelectButtonContext<
        VfSelectButtonProps<
          TOptions,
          TOptionValueKey,
          TMultiple,
          TModel,
          TOptionValueReturn
        >
      >
    >,
    /* @vue-ignore */ OverrideSlots<
      ForwardedSlots<ASelectButtonSlots, (typeof forwards.slots)[number]>,
      {
        /**
         * Custom content for each option.
         */
        option: (props: {
          /**
           * The raw option item.
           */
          option: any

          /**
           * Index of the option.
           */
          index: number
        }) => VNode[]
      }
    > {}

/**
 * Structural parts of the VfSelectButton component.
 */
export interface VfSelectButtonParts extends SelectButtonParts {
  /**
   * The select button input element.
   *
   * @tag SelectButton
   */
  input: WithPtShorthands<PvSelectButtonProps>
}

/**
 * CSS classes for the VfSelectButton component's structural parts.
 */
export interface VfSelectButtonClasses extends SelectButtonClasses {
  /**
   * The select button input element.
   */
  input: ClassValue
}

/**
 * Augmentable public API surface for VfSelectButton.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `SelectButtonExpose` for all select-button-based
 * components) so they appear on `ContextOf<'VfSelectButton'>` / `context$` /
 * `defineExpose`.
 */
export interface VfSelectButtonExpose extends SelectButtonExpose {}

/**
 * Public context for VfSelectButton, optionally parameterized by concrete props
 * (e.g. `VfSelectButtonContext<VfSelectButtonProps<typeof options, 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfSelectButtonContext<
  TProps extends WidenProps<
    VfSelectButtonProps,
    SelectButtonProps<string, OptionsProp, OptionValueProp>
  > = VfSelectButtonProps,
> extends DefineElementContext<
  TProps,
  VfSelectButtonEmits,
  VfSelectButtonSlots,
  VfSelectButtonParts,
  VfSelectButtonClasses,
  VfSelectButtonExpose,
  SelectButtonApi<TProps>
> {}

/**
 * Registry entry for VfSelectButton. `TEntry` narrows the props / emits /
 * context by the entry's option-driving props, the same way SFC generics do.
 */
export interface VfSelectButtonEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfSelectButtonEmits<
    EntryOptionsOf<TEntry>,
    EntryOptionValueKeyOf<TEntry>,
    EntryMultipleOf<TEntry>,
    any,
    EntryOptionValueReturnOf<TEntry>
  >,
  VfSelectButtonSlots,
  VfSelectButtonParts,
  VfSelectButtonClasses,
  VfSelectButtonContext<EntryProps<TEntry>>
> {}
