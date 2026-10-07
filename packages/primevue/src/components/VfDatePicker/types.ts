import type {
  ClassValue,
  AddonsSlots,
  IconsSlots,
  AddonsParts,
  IconsParts,
  AddonGroupParts,
  EntryPropOf,
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
} from '@vueform/core'
import type { DatePickerProps as PvDatePickerProps } from 'primevue'
import type { DatePickerSlots as ADatePickerSlots } from 'primevue/datepicker'

import type {
  DatePickerApi,
  DatePickerClasses,
  DatePickerEmits,
  DatePickerExpose,
  DatePickerParts,
  DatePickerProps,
  DatePickerSelectionModeProp,
  DatePickerSlots,
  forwards,
} from '#src/blueprints/date-picker'
import type {
  FloatLabelClasses,
  FloatLabelParts,
  FloatLabelSlots,
  IftaClasses,
  IftaParts,
  IftaSlots,
} from '#src/features'
import type { ForwardedSlots } from '#src/types'

/**
 * Resolves the `TSelectionMode` generic from a registry `TEntry` payload's
 * `selectionMode` prop, defaulting to `undefined` when absent or invalid.
 */
export type EntrySelectionModeOf<TEntry> =
  EntryPropOf<TEntry, 'selectionMode'> extends infer M
    ? M extends DatePickerSelectionModeProp
      ? M
      : undefined
    : undefined

/**
 * VfDatePicker props narrowed from a registry `TEntry` payload, applying the
 * entry's `selectionMode` prop as a generic.
 */
export type EntryProps<TEntry> = VfDatePickerProps<EntrySelectionModeOf<TEntry>>

/**
 * Generic props interface for the VfDatePicker component, parameterized by the
 * model-driving type argument (e.g. `VfDatePickerProps<'multiple'>`). Reach for
 * `VfDatePickerProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfDatePickerProps<
  TSelectionMode extends DatePickerSelectionModeProp =
    DatePickerSelectionModeProp,
> extends DatePickerProps<
  'date-picker',
  TSelectionMode,
  VfDatePickerSlots<TSelectionMode>,
  VfDatePickerParts,
  VfDatePickerClasses,
  VfDatePickerContext<VfDatePickerProps<TSelectionMode>>
> {}

/**
 * Events emitted by the VfDatePicker component, parameterized by the
 * model-driving type argument so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfDatePickerSlots`. Plain usage
 * (`VfDatePickerEmits`) keeps the context wide.
 */
export interface VfDatePickerEmits<
  TSelectionMode extends DatePickerSelectionModeProp =
    DatePickerSelectionModeProp,
> extends DatePickerEmits<
  VfDatePickerContext<VfDatePickerProps<TSelectionMode>>
> {}

/**
 * Slots available in the VfDatePicker component.
 */
export interface VfDatePickerSlots<
  TSelectionMode extends DatePickerSelectionModeProp =
    DatePickerSelectionModeProp,
>
  extends
    DatePickerSlots<VfDatePickerContext<VfDatePickerProps<TSelectionMode>>>,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    /* @vue-ignore */ ForwardedSlots<
      ADatePickerSlots,
      (typeof forwards.slots)[number]
    > {}

/**
 * Structural parts of the VfDatePicker component.
 */
export interface VfDatePickerParts
  extends
    DatePickerParts,
    AddonsParts,
    AddonGroupParts,
    IconsParts,
    FloatLabelParts,
    IftaParts {
  /**
   * The date picker input element.
   *
   * @tag DatePicker
   */
  input: PvDatePickerProps
}

/**
 * CSS classes for the VfDatePicker component's structural parts.
 */
export interface VfDatePickerClasses
  extends DatePickerClasses, FloatLabelClasses, IftaClasses {
  /**
   * The date picker input element.
   */
  input: ClassValue
}

/**
 * Augmentable public API surface for VfDatePicker.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `DatePickerExpose` for all date-picker-based components)
 * so they appear on `ContextOf<'VfDatePicker'>` / `context$` / `defineExpose`.
 */
export interface VfDatePickerExpose extends DatePickerExpose {}

/**
 * Public context for VfDatePicker, optionally parameterized by concrete props
 * (e.g. `VfDatePickerContext<VfDatePickerProps<'multiple'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfDatePickerContext<
  TProps extends WidenProps<VfDatePickerProps, DatePickerProps> =
    VfDatePickerProps,
> extends DefineElementContext<
  TProps,
  VfDatePickerEmits,
  VfDatePickerSlots,
  VfDatePickerParts,
  VfDatePickerClasses,
  VfDatePickerExpose,
  DatePickerApi<TProps>
> {}

/**
 * Registry entry for VfDatePicker. `TEntry` narrows the props / emits / context
 * by the entry's model-driving props, the same way SFC generics do.
 */
export interface VfDatePickerEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfDatePickerEmits<EntrySelectionModeOf<TEntry>>,
  VfDatePickerSlots,
  VfDatePickerParts,
  VfDatePickerClasses,
  VfDatePickerContext<EntryProps<TEntry>>
> {}
