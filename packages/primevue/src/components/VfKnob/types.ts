import type {
  ClassValue,
  DefineElementContext,
  DefineRegistryEntry,
  InputAriaA11y,
} from '@vueform/core'
import type { KnobProps as PvKnobProps } from 'primevue'

import type {
  KnobA11y,
  KnobApi,
  KnobClasses,
  KnobEmits,
  KnobExpose,
  KnobModifiers,
  KnobParts,
  KnobProps,
  KnobSlots,
} from '#src/blueprints/knob'

/**
 * Props for the VfKnob component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfKnobProps extends KnobProps<
  'knob',
  VfKnobSlots,
  VfKnobParts,
  VfKnobClasses,
  VfKnobContext
> {}

/**
 * Events emitted by the VfKnob component.
 */
export interface VfKnobEmits extends KnobEmits<VfKnobContext> {}

/**
 * Slots available in the VfKnob component.
 */
export interface VfKnobSlots extends KnobSlots<VfKnobContext> {}

/**
 * Structural parts of the VfKnob component.
 */
export interface VfKnobParts extends KnobParts {
  /**
   * The knob element.
   *
   * @tag Knob
   */
  input: PvKnobProps
}

/**
 * CSS classes for the VfKnob component's structural parts.
 */
export interface VfKnobClasses extends KnobClasses {
  /**
   * The knob element.
   */
  input: ClassValue
}

/**
 * Accessibility bindings of the VfKnob component, produced by the `inputAria`
 * pattern the component registers via `useA11y`.
 */
export interface VfKnobA11y extends KnobA11y, InputAriaA11y {}

/**
 * Styling modifiers of the VfKnob component.
 */
export interface VfKnobModifiers extends KnobModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The input control's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}

/**
 * Augmentable public API surface for VfKnob.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `KnobExpose` for all knob-based components) so they
 * appear on `ContextOf<'VfKnob'>` / `context$` / `defineExpose`.
 */
export interface VfKnobExpose extends KnobExpose {}

/**
 * Public context for VfKnob.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfKnobContext extends DefineElementContext<
  VfKnobProps,
  VfKnobEmits,
  VfKnobSlots,
  VfKnobParts,
  VfKnobClasses,
  VfKnobModifiers,
  VfKnobA11y,
  VfKnobExpose,
  KnobApi
> {}

/**
 * Registry entry for VfKnob. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfKnob has no prop-driven generics.
 */
export interface VfKnobEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfKnobProps,
  VfKnobEmits,
  VfKnobSlots,
  VfKnobParts,
  VfKnobClasses,
  VfKnobContext
> {}
