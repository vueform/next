import type {
  ClassValue,
  DefineElementContext,
  DefineRegistryEntry,
  InputAriaA11y,
} from '@vueform/core'
import type { ColorPickerProps as PvColorPickerProps } from 'primevue'

import type {
  ColorPickerA11y,
  ColorPickerApi,
  ColorPickerClasses,
  ColorPickerEmits,
  ColorPickerExpose,
  ColorPickerModifiers,
  ColorPickerParts,
  ColorPickerProps,
  ColorPickerSlots,
} from '#src/blueprints/color-picker'

/**
 * Props for the VfColorPicker component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfColorPickerProps extends ColorPickerProps<
  'color-picker',
  VfColorPickerSlots,
  VfColorPickerParts,
  VfColorPickerClasses,
  VfColorPickerContext
> {}

/**
 * Events emitted by the VfColorPicker component.
 */
export interface VfColorPickerEmits extends ColorPickerEmits<VfColorPickerContext> {}

/**
 * Slots available in the VfColorPicker component.
 */
export interface VfColorPickerSlots extends ColorPickerSlots<VfColorPickerContext> {}

/**
 * Structural parts of the VfColorPicker component.
 */
export interface VfColorPickerParts extends ColorPickerParts {
  /**
   * The color picker element.
   *
   * @tag ColorPicker
   */
  input: PvColorPickerProps
}

/**
 * CSS classes for the VfColorPicker component's structural parts.
 */
export interface VfColorPickerClasses extends ColorPickerClasses {
  /**
   * The color picker element.
   */
  input: ClassValue
}

/**
 * Accessibility bindings of the VfColorPicker component, produced by the `inputAria`
 * pattern the component registers via `useA11y`.
 */
export interface VfColorPickerA11y extends ColorPickerA11y, InputAriaA11y {}

/**
 * Styling modifiers of the VfColorPicker component.
 */
export interface VfColorPickerModifiers extends ColorPickerModifiers {
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
 * Augmentable public API surface for VfColorPicker.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `ColorPickerExpose` for all color-picker-based
 * components) so they appear on `ContextOf<'VfColorPicker'>` / `context$` /
 * `defineExpose`.
 */
export interface VfColorPickerExpose extends ColorPickerExpose {}

/**
 * Public context for VfColorPicker.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfColorPickerContext extends DefineElementContext<
  VfColorPickerProps,
  VfColorPickerEmits,
  VfColorPickerSlots,
  VfColorPickerParts,
  VfColorPickerClasses,
  VfColorPickerModifiers,
  VfColorPickerA11y,
  VfColorPickerExpose,
  ColorPickerApi
> {}

/**
 * Registry entry for VfColorPicker. `TEntry` is accepted for registry
 * uniformity but does not narrow anything — VfColorPicker has no prop-driven
 * generics.
 */
export interface VfColorPickerEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfColorPickerProps,
  VfColorPickerEmits,
  VfColorPickerSlots,
  VfColorPickerParts,
  VfColorPickerClasses,
  VfColorPickerContext
> {}
