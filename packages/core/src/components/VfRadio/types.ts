import type { VNode } from 'vue'

import type { InputAriaA11y } from '#src/a11y'
import {
  type RadioA11y,
  type RadioApi,
  type RadioClasses,
  type RadioEmits,
  type RadioExpose,
  type RadioModifiers,
  type RadioParts,
  type RadioProps,
  type RadioSlots,
} from '#src/blueprints/radio'
import type { ResolvedBindings } from '#src/composables'
import type {
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
  ClassValue,
  DomAttrsOf,
  EntryPropOr,
} from '#src/types'

/**
 * Resolved per-part binding bags for VfRadio slot scopes.
 */
type VfRadioBindings = ResolvedBindings<
  VfRadioParts,
  VfRadioModifiers,
  VfRadioA11y
>

/**
 * VfRadio props narrowed from a registry `TEntry` payload, applying the entry's
 * `radioValue` prop as a generic.
 */
export type EntryProps<TEntry> = VfRadioProps<
  EntryPropOr<TEntry, 'radioValue', true>
>

/**
 * Generic props interface for the VfRadio component, parameterized by the
 * model-driving type argument (e.g. `VfRadioProps<'a'>`). Reach for
 * `VfRadioProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfRadioProps<TRadioValue = any> extends RadioProps<
  'radio',
  TRadioValue,
  VfRadioSlots<TRadioValue>,
  VfRadioParts,
  VfRadioClasses,
  VfRadioContext<VfRadioProps<TRadioValue>>
> {}

/**
 * Events emitted by the VfRadio component, parameterized by the model-driving
 * type argument so event handlers (e.g. `@change`) receive the narrowed context
 * — same pattern as `VfRadioSlots`. Plain usage (`VfRadioEmits`) keeps the
 * context wide.
 */
export interface VfRadioEmits<TRadioValue = any> extends RadioEmits<
  VfRadioContext<VfRadioProps<TRadioValue>>
> {}

/**
 * Slots available in the VfRadio component.
 */
export interface VfRadioSlots<TRadioValue = any> extends RadioSlots<
  VfRadioContext<VfRadioProps<TRadioValue>>
> {
  /**
   * Slot that replaces the default radio input rendering. Receives
   * input-specific props.
   */
  default: (scope: {
    /**
     * The value used when the radio is selected.
     */
    value: TRadioValue

    /**
     * The current model value.
     */
    model: TRadioValue | null

    /**
     * The input's `name` attribute.
     */
    inputName: string

    /**
     * The input's `id` attribute.
     */
    id: string

    /**
     * Whether the radio is disabled.
     */
    disabled: boolean

    /**
     * The input DOM element reference.
     */
    input: any

    /**
     * The radio label text.
     */
    text: string | undefined

    /**
     * The default slot's own part is the wrapper (the fallback's top-level
     * element): its resolved classes, part overrides, and alignment
     * modifiers; apply with `v-bind`.
     */
    bindings: VfRadioBindings['wrapper']

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
   * Slot that replaces the text/label portion of the radio.
   */
  text: (scope: {
    /**
     * The radio label text.
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
     * The text element's resolved bindings (classes, part overrides); apply
     * with `v-bind`.
     */
    bindings: VfRadioBindings['text']
  }) => VNode[]
}

/**
 * Structural parts of the VfRadio component.
 */
export interface VfRadioParts extends RadioParts {
  /**
   * The wrapper element surrounding the input and text.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The radio input element.
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

  /**
   * The screen-reader-only text element.
   *
   * @tag label
   */
  srOnlyText: DomAttrsOf<'label'>
}

/**
 * CSS classes for the VfRadio component's structural parts.
 */
export interface VfRadioClasses extends RadioClasses {
  /**
   * The wrapper element surrounding the input and text.
   */
  wrapper: ClassValue

  /**
   * The radio input element.
   */
  input: ClassValue

  /**
   * The label/text element.
   */
  text: ClassValue
}

/**
 * Accessibility bindings of the VfRadio component, produced by the `inputAria`
 * pattern the component registers via `useA11y`.
 */
export interface VfRadioA11y extends RadioA11y, InputAriaA11y {}

/**
 * Styling modifiers of the VfRadio component.
 */
export interface VfRadioModifiers extends RadioModifiers {
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
    'data-align'?: VfRadioProps['align']
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
 * Augmentable public API surface for VfRadio.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `RadioExpose` for all radio-based components) so they
 * appear on `ContextOf<'VfRadio'>` / `context$` / `defineExpose`.
 */
export interface VfRadioExpose extends RadioExpose {}

/**
 * Public context for VfRadio, optionally parameterized by concrete props (e.g.
 * `VfRadioContext<VfRadioProps<'a'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfRadioContext<
  TProps extends WidenProps<VfRadioProps, RadioProps> = VfRadioProps,
> extends DefineElementContext<
  TProps,
  VfRadioEmits,
  VfRadioSlots,
  VfRadioParts,
  VfRadioClasses,
  VfRadioModifiers,
  VfRadioA11y,
  VfRadioExpose,
  RadioApi<TProps>
> {}

/**
 * Registry entry for VfRadio. `TEntry` narrows the props / emits / context by
 * the entry's model-driving props, the same way SFC generics do.
 */
export interface VfRadioEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfRadioEmits<EntryPropOr<TEntry, 'radioValue', true>>,
  VfRadioSlots,
  VfRadioParts,
  VfRadioClasses,
  VfRadioContext<EntryProps<TEntry>>
> {}
