import type { VNode } from 'vue'

import {
  type CheckboxA11y,
  type CheckboxApi,
  type CheckboxClasses,
  type CheckboxEmits,
  type CheckboxExpose,
  type CheckboxModifiers,
  type CheckboxParts,
  type CheckboxProps,
  type CheckboxSlots,
} from '#src/blueprints/checkbox'
import type {
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
  ClassValue,
  DomAttrsOf,
  EntryPropOr,
} from '#src/types'

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
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
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
  default: (scope: {
    /**
     * The current model value.
     */
    model: TTrueValue | TFalseValue

    /**
     * The value used when the checkbox is checked.
     */
    trueValue: TTrueValue

    /**
     * The value used when the checkbox is unchecked.
     */
    falseValue: TFalseValue

    /**
     * The input's `name` attribute.
     */
    inputName: string

    /**
     * The input's `id` attribute.
     */
    id: string

    /**
     * Whether the checkbox is disabled.
     */
    disabled: boolean

    /**
     * The input DOM element reference.
     */
    input: any

    /**
     * The checkbox label text.
     */
    text: string | undefined

    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfCheckboxClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfCheckboxParts>

    /**
     * The component's styling modifiers, keyed by part name; apply each bag
     * with `v-bind`.
     */
    modifiers: VfCheckboxModifiers

    /**
     * Part-keyed accessibility bindings; apply each key's bag to the matching
     * DOM part with `v-bind` (e.g. `v-bind="a11yBindings.input"`).
     */
    a11yBindings: VfCheckboxA11y

    /**
     * Handler for the input's blur event.
     *
     * @param e The native blur event.
     */
    handleBlur: (e: FocusEvent) => void

    /**
     * Handler for the input's focus event.
     *
     * @param e The native focus event.
     */
    handleFocus: (e: FocusEvent) => void

    /**
     * Handler that updates the model from an input event.
     *
     * @param e The native input event.
     */
    handleModelUpdate: (e: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the checkbox.
   */
  text: (scope: {
    /**
     * The checkbox label text.
     */
    text: string | undefined

    /**
     * The input's `id` attribute.
     */
    id: string

    /**
     * The element's generic name, used as screen-reader-only fallback text.
     */
    genericName: string

    /**
     * CSS classes for the text element.
     */
    classes: ClassValue

    /**
     * Resolved `part:text` attribute overrides for the text element; apply
     * with `v-bind`.
     */
    part: DomAttrsOf<'label'> | undefined
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
 * Accessibility bindings of the VfCheckbox component.
 */
export interface VfCheckboxA11y extends CheckboxA11y {}

/**
 * Styling modifiers of the VfCheckbox component.
 */
export interface VfCheckboxModifiers extends CheckboxModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The choice wrapper's label alignment variant and the marker set while the
   * element vertically aligns with adjacent form controls.
   */
  wrapper: {
    'data-align'?: VfCheckboxProps['align']
    'data-aligned'?: ''
  }

  /**
   * The checkbox input's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}

/**
 * Augmentable public API surface for VfCheckbox.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `CheckboxExpose` for all checkbox-based components) so
 * they appear on `ContextOf<'VfCheckbox'>` / `context$` / `defineExpose`.
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
  VfCheckboxModifiers,
  VfCheckboxA11y,
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
