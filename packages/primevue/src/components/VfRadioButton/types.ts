import type {
  ClassValue,
  DomAttrsOf,
  AriaProp,
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
  EntryPropOr,
} from '@vueform/core'
import type { RadioButtonProps as PvRadioButtonProps } from 'primevue/radiobutton'
import type { VNode } from 'vue'

import type {
  RadioButtonApi,
  RadioButtonClasses,
  RadioButtonEmits,
  RadioButtonExpose,
  RadioButtonParts,
  RadioButtonProps,
  RadioButtonSlots,
} from '#src/blueprints/radio-button'

/**
 * VfRadioButton props narrowed from a registry `TEntry` payload, applying the
 * entry's `value` prop as a generic.
 */
export type EntryProps<TEntry> = VfRadioButtonProps<
  EntryPropOr<TEntry, 'value', true>
>

/**
 * Generic props interface for the VfRadioButton component, parameterized by the
 * model-driving type argument (e.g. `VfRadioButtonProps<'a'>`). Reach for
 * `VfRadioButtonProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfRadioButtonProps<TRadioValue = any> extends RadioButtonProps<
  'radio-button',
  TRadioValue,
  VfRadioButtonSlots<TRadioValue>,
  VfRadioButtonParts,
  VfRadioButtonClasses,
  VfRadioButtonContext<VfRadioButtonProps<TRadioValue>>
> {}

/**
 * Events emitted by the VfRadioButton component, parameterized by the
 * model-driving type argument so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfRadioButtonSlots`. Plain usage
 * (`VfRadioButtonEmits`) keeps the context wide.
 */
export interface VfRadioButtonEmits<TRadioValue = any> extends RadioButtonEmits<
  VfRadioButtonContext<VfRadioButtonProps<TRadioValue>>
> {}

/**
 * Slots available in the VfRadioButton component.
 */
export interface VfRadioButtonSlots<TRadioValue = any> extends RadioButtonSlots<
  VfRadioButtonContext<VfRadioButtonProps<TRadioValue>>
> {
  /**
   * Slot that replaces the default radio input rendering. Receives
   * input-specific props.
   */
  default: (props: {
    value: TRadioValue
    model: TRadioValue | null
    aria: AriaProp
    inputName: string
    id: string
    disabled: boolean
    input: any
    text: string | undefined
    handleBlur: (e: FocusEvent) => void
    handleFocus: (e: FocusEvent) => void
    handleInput: (payload: any, e?: Event) => void
    handleModelUpdate: (e: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the radio.
   *
   * @param props.text The resolved label text.
   * @param props.id The element's unique ID.
   * @param props.genericName The element's display name for accessibility.
   */
  text: (props: {
    text: string | undefined
    id: string
    genericName: string
  }) => VNode[]
}

/**
 * Structural parts of the VfRadioButton component.
 */
export interface VfRadioButtonParts extends RadioButtonParts {
  /**
   * The wrapper element surrounding the input and text.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The PrimeVue RadioButton input element.
   *
   * @tag RadioButton
   */
  input: PvRadioButtonProps

  /**
   * The label/text element.
   *
   * @tag label
   */
  text: DomAttrsOf<'label'>
}

/**
 * CSS classes for the VfRadioButton component's structural parts.
 */
export interface VfRadioButtonClasses extends RadioButtonClasses {
  /**
   * The wrapper element surrounding the input and text.
   */
  wrapper: ClassValue

  /**
   * The PrimeVue RadioButton input element.
   */
  input: ClassValue

  /**
   * The label/text element.
   */
  text: ClassValue
}

/**
 * Augmentable public API surface for VfRadioButton.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `RadioButtonExpose` for all radio-button-based
 * components) so they appear on `ContextOf<'VfRadioButton'>` / `context$` /
 * `defineExpose`.
 */
export interface VfRadioButtonExpose extends RadioButtonExpose {}

/**
 * Public context for VfRadioButton, optionally parameterized by concrete props
 * (e.g. `VfRadioButtonContext<VfRadioButtonProps<'a'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfRadioButtonContext<
  TProps extends WidenProps<VfRadioButtonProps, RadioButtonProps> =
    VfRadioButtonProps,
> extends DefineElementContext<
  TProps,
  VfRadioButtonEmits,
  VfRadioButtonSlots,
  VfRadioButtonParts,
  VfRadioButtonClasses,
  VfRadioButtonExpose,
  RadioButtonApi<TProps>
> {}

/**
 * Registry entry for VfRadioButton. `TEntry` narrows the props / emits /
 * context by the entry's model-driving props, the same way SFC generics do.
 */
export interface VfRadioButtonEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfRadioButtonEmits<EntryPropOr<TEntry, 'value', true>>,
  VfRadioButtonSlots,
  VfRadioButtonParts,
  VfRadioButtonClasses,
  VfRadioButtonContext<EntryProps<TEntry>>
> {}
