import type {
  ClassValue,
  DefineElementContext,
  DefineRegistryEntry,
  EntryPropOf,
  WidenProps,
  InputAriaBag,
  LayoutRegionBindings,
} from '@vueform/core'
import type { SliderProps as PvSliderProps } from 'primevue'

import type {
  SliderApi,
  SliderBindings,
  SliderClasses,
  SliderEmits,
  SliderExpose,
  SliderParts,
  SliderProps,
  SliderSlots,
} from '#src/blueprints/slider'

/**
 * Resolves a `TRange` generic from a registry `TEntry` payload's `range` prop,
 * defaulting to `false` when absent or invalid.
 */
export type EntryRangeOf<TEntry> =
  EntryPropOf<TEntry, 'range'> extends infer R
    ? R extends boolean
      ? R
      : false
    : false

/**
 * VfSlider props narrowed from a registry `TEntry` payload, applying the
 * entry's `range` prop as a generic.
 */
export type EntryProps<TEntry> = VfSliderProps<EntryRangeOf<TEntry>>

/**
 * Generic props interface for the VfSlider component, parameterized by the
 * model-driving type argument (e.g. `VfSliderProps<true>`). Reach for
 * `VfSliderProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfSliderProps<
  TRange extends boolean = boolean,
> extends SliderProps<
  'slider',
  TRange,
  VfSliderSlots<TRange>,
  VfSliderParts,
  VfSliderClasses,
  VfSliderContext<VfSliderProps<TRange>>
> {}

/**
 * Events emitted by the VfSlider component, parameterized by the model-driving
 * type argument so event handlers (e.g. `@change`) receive the narrowed context
 * — same pattern as `VfSliderSlots`. Plain usage (`VfSliderEmits`) keeps the
 * context wide.
 */
export interface VfSliderEmits<
  TRange extends boolean = boolean,
> extends SliderEmits<VfSliderContext<VfSliderProps<TRange>>> {}

/**
 * Slots available in the VfSlider component.
 */
export interface VfSliderSlots<
  TRange extends boolean = boolean,
> extends SliderSlots<VfSliderContext<VfSliderProps<TRange>>> {}

/**
 * Structural parts of the VfSlider component.
 */
export interface VfSliderParts extends SliderParts {
  /**
   * The slider element.
   *
   * @tag Slider
   */
  input: PvSliderProps
}

/**
 * CSS classes for the VfSlider component's structural parts.
 */
export interface VfSliderClasses extends SliderClasses {
  /**
   * The slider element.
   */
  input: ClassValue
}

/**
 * Part-keyed attribute bindings of the VfSlider component: its own state
 * markers merged with the `inputAria` pattern entries it registers via
 * `useBindings`.
 */
export interface VfSliderBindings extends SliderBindings, LayoutRegionBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The slider control's validation and ARIA state.
   */
  input: {
    'data-invalid'?: ''
  } & InputAriaBag
}

/**
 * Augmentable public API surface for VfSlider.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `SliderExpose` for all slider-based components) so they
 * appear on `ContextOf<'VfSlider'>` / `context$` / `defineExpose`.
 */
export interface VfSliderExpose extends SliderExpose {}

/**
 * Public context for VfSlider, optionally parameterized by concrete props (e.g.
 * `VfSliderContext<VfSliderProps<true>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfSliderContext<
  TProps extends WidenProps<VfSliderProps, SliderProps> = VfSliderProps,
> extends DefineElementContext<
  TProps,
  VfSliderEmits,
  VfSliderSlots,
  VfSliderParts,
  VfSliderClasses,
  VfSliderBindings,
  VfSliderExpose,
  SliderApi<TProps>
> {}

/**
 * Registry entry for VfSlider. `TEntry` narrows the props / emits / context by
 * the entry's model-driving props, the same way SFC generics do.
 */
export interface VfSliderEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfSliderEmits<EntryRangeOf<TEntry>>,
  VfSliderSlots,
  VfSliderParts,
  VfSliderClasses,
  VfSliderContext<EntryProps<TEntry>>
> {}
