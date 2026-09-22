import {
  type CheckboxApi,
  type CheckboxClasses,
  type CheckboxEmits,
  type CheckboxExpose,
  type CheckboxParts,
  type CheckboxProps,
  type CheckboxSlots,
} from '~/blueprints/checkbox'
import type {
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
  AriaProp,
  ClassValue,
  DomAttrsOf,
  EntryPropOr,
} from '~/types'
import type { VNode } from 'vue'

/**
 * VfCheckbox props narrowed from a registry `TEntry` payload, applying the
 * entry's `trueValue` / `falseValue` props as generics.
 */
export type EntryProps<TEntry> = VfCheckboxProps<
  EntryPropOr<TEntry, 'trueValue', true>,
  EntryPropOr<TEntry, 'falseValue', false>
>

/**
 * Generic props interface for the VfCheckbox component, parameterized by the
 * model-driving type arguments (e.g. `VfCheckboxProps<1, 0>`). Reach for
 * `VfCheckboxProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
export interface VfCheckboxProps<
  TTrueValue = any,
  TFalseValue = any,
> extends CheckboxProps<
  'checkbox',
  TTrueValue,
  TFalseValue,
  VfCheckboxSlots<TTrueValue, TFalseValue>,
  VfCheckboxParts,
  VfCheckboxClasses,
  VfCheckboxContext<VfCheckboxProps<TTrueValue, TFalseValue>>
> {}

/**
 * Events emitted by the VfCheckbox component, parameterized by the
 * model-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfCheckboxSlots`. Plain usage
 * (`VfCheckboxEmits`) keeps the context wide.
 */
export interface VfCheckboxEmits<
  TTrueValue = any,
  TFalseValue = any,
> extends CheckboxEmits<
  VfCheckboxContext<VfCheckboxProps<TTrueValue, TFalseValue>>
> {}

/**
 * Slots available in the VfCheckbox component.
 */
export interface VfCheckboxSlots<
  TTrueValue = any,
  TFalseValue = any,
> extends CheckboxSlots<
  VfCheckboxContext<VfCheckboxProps<TTrueValue, TFalseValue>>
> {
  /**
   * Slot that replaces the default checkbox rendering. Receives input-specific
   * props.
   */
  default: (props: {
    model: TTrueValue | TFalseValue
    trueValue: TTrueValue
    falseValue: TFalseValue
    inputName: string
    id: string
    disabled: boolean
    input: any
    text: string | undefined
    aria: AriaProp
    handleBlur: (e: FocusEvent) => void
    handleFocus: (e: FocusEvent) => void
    handleModelUpdate: (e: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the checkbox.
   */
  text: (props: {
    text: string | undefined
    id: string
    genericName: string
  }) => VNode[]
}

/**
 * Structural parts of the VfCheckbox component.
 */
export interface VfCheckboxParts extends CheckboxParts {
  /**
   * The wrapper element surrounding the input and text.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The checkbox input element.
   *
   * @tag input
   */
  input: DomAttrsOf<'input'>

  /**
   * The label/text element.
   *
   * @tag label
   */
  text: DomAttrsOf<'label'>
}

/**
 * CSS classes for the VfCheckbox component's structural parts.
 */
export interface VfCheckboxClasses extends CheckboxClasses {
  /**
   * The wrapper element surrounding the input and text.
   */
  wrapper: ClassValue

  /**
   * The checkbox input element.
   */
  input: ClassValue

  /**
   * The label/text element.
   */
  text: ClassValue
}

/**
 * Augmentable public API surface for VfCheckbox.
 */
export interface VfCheckboxExpose extends CheckboxExpose {}

/**
 * Public context for VfCheckbox, optionally parameterized by concrete props
 * (e.g. `VfCheckboxContext<VfCheckboxProps<1, 0>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfCheckboxContext<
  TProps extends WidenProps<VfCheckboxProps, CheckboxProps> = VfCheckboxProps,
> extends DefineElementContext<
  TProps,
  VfCheckboxEmits,
  VfCheckboxSlots,
  VfCheckboxParts,
  VfCheckboxClasses,
  VfCheckboxExpose,
  CheckboxApi<TProps>
> {}

/**
 * Registry entry for VfCheckbox. `TEntry` narrows the props / emits / context
 * by the entry's model-driving props, the same way SFC generics do.
 */
export interface VfCheckboxEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfCheckboxEmits<
    EntryPropOr<TEntry, 'trueValue', true>,
    EntryPropOr<TEntry, 'falseValue', false>
  >,
  VfCheckboxSlots,
  VfCheckboxParts,
  VfCheckboxClasses,
  VfCheckboxContext<EntryProps<TEntry>>
> {}
