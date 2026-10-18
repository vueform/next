import type {
  ClassValue,
  DomAttrsOf,
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
  EntryPropOr,
} from '@vueform/core'
import type { RadioButtonProps as PvRadioButtonProps } from 'primevue/radiobutton'
import type { VNode } from 'vue'

import type {
  RadioButtonA11y,
  RadioButtonApi,
  RadioButtonClasses,
  RadioButtonEmits,
  RadioButtonExpose,
  RadioButtonModifiers,
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
  default: (scope: {
    /**
     * The value represented by the radio button when selected.
     */
    value: TRadioValue

    /**
     * The current model value.
     */
    model: TRadioValue | null

    /**
     * The `name` attribute of the input.
     */
    inputName: string

    /**
     * The element's unique ID.
     */
    id: string

    /**
     * Whether the input is disabled.
     */
    disabled: boolean

    /**
     * Ref to the underlying input element.
     */
    input: any

    /**
     * The resolved label text.
     */
    text: string | undefined

    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfRadioButtonClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfRadioButtonParts>

    /**
     * The component's styling modifiers, keyed by part name; apply each bag
     * with `v-bind`.
     */
    modifiers: VfRadioButtonModifiers

    /**
     * Part-keyed accessibility bindings; apply each key's bag to the matching
     * DOM part with `v-bind` (e.g. `v-bind="a11yBindings.input"`).
     */
    a11yBindings: VfRadioButtonA11y

    /**
     * Handles the input's blur event.
     *
     * @param e The native blur event.
     */
    handleBlur: (e: FocusEvent) => void

    /**
     * Handles the input's focus event.
     *
     * @param e The native focus event.
     */
    handleFocus: (e: FocusEvent) => void

    /**
     * Handles the input's change event, updating the model.
     *
     * @param payload The new input value.
     * @param e The originating native event.
     */
    handleInput: (payload: any, e?: Event) => void

    /**
     * Handles a native input event, updating the model from the event target.
     *
     * @param e The native input event.
     */
    handleModelUpdate: (e: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the radio.
   *
   * @param scope The text slot's params.
   */
  text: (scope: {
    /**
     * The resolved label text.
     */
    text: string | undefined

    /**
     * The element's unique ID.
     */
    id: string

    /**
     * The element's display name for accessibility.
     */
    genericName: string

    /**
     * CSS classes for the text/label element.
     */
    classes: ClassValue

    /**
     * Resolved `part:text` attribute overrides for the text/label element;
     * apply with `v-bind`.
     */
    part: DomAttrsOf<'label'> | undefined
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
 * Accessibility bindings of the VfRadioButton component.
 */
export interface VfRadioButtonA11y extends RadioButtonA11y {}

/**
 * Styling modifiers of the VfRadioButton component.
 */
export interface VfRadioButtonModifiers extends RadioButtonModifiers {
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
    'data-align'?: VfRadioButtonProps['align']
    'data-aligned'?: ''
  }

  /**
   * The radio input's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
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
  VfRadioButtonModifiers,
  VfRadioButtonA11y,
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
