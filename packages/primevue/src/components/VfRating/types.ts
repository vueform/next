import type {
  ClassValue,
  DefineElementContext,
  DefineRegistryEntry,
  InputAriaA11y,
} from '@vueform/core'
import type {
  RatingProps as PvRatingProps,
  RatingSlots as ARatingSlots,
} from 'primevue'

import type {
  RatingA11y,
  RatingApi,
  RatingClasses,
  RatingEmits,
  RatingExpose,
  RatingModifiers,
  RatingParts,
  RatingProps,
  RatingSlots,
  forwards,
} from '#src/blueprints/rating'
import type { ForwardedSlots } from '#src/types'

/**
 * Props for the VfRating component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfRatingProps extends RatingProps<
  'rating',
  VfRatingSlots,
  VfRatingParts,
  VfRatingClasses,
  VfRatingContext
> {}

/**
 * Events emitted by the VfRating component.
 */
export interface VfRatingEmits extends RatingEmits<VfRatingContext> {}

/**
 * Slots available in the VfRating component.
 */
export interface VfRatingSlots
  extends
    RatingSlots<VfRatingContext>,
    /* @vue-ignore */ ForwardedSlots<
      ARatingSlots,
      (typeof forwards.slots)[number]
    > {}

/**
 * Structural parts of the VfRating component.
 */
export interface VfRatingParts extends RatingParts {
  /**
   * The rating element.
   *
   * @tag Rating
   */
  input: PvRatingProps
}

/**
 * CSS classes for the VfRating component's structural parts.
 */
export interface VfRatingClasses extends RatingClasses {
  /**
   * The rating element.
   */
  input: ClassValue
}

/**
 * Accessibility bindings of the VfRating component, produced by the `inputAria`
 * pattern the component registers via `useA11y`.
 */
export interface VfRatingA11y extends RatingA11y, InputAriaA11y {}

/**
 * Styling modifiers of the VfRating component.
 */
export interface VfRatingModifiers extends RatingModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The rating control's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}

/**
 * Augmentable public API surface for VfRating.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `RatingExpose` for all rating-based components) so they
 * appear on `ContextOf<'VfRating'>` / `context$` / `defineExpose`.
 */
export interface VfRatingExpose extends RatingExpose {}

/**
 * Public context for VfRating.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfRatingContext extends DefineElementContext<
  VfRatingProps,
  VfRatingEmits,
  VfRatingSlots,
  VfRatingParts,
  VfRatingClasses,
  VfRatingModifiers,
  VfRatingA11y,
  VfRatingExpose,
  RatingApi
> {}

/**
 * Registry entry for VfRating. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfRating has no prop-driven generics.
 */
export interface VfRatingEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfRatingProps,
  VfRatingEmits,
  VfRatingSlots,
  VfRatingParts,
  VfRatingClasses,
  VfRatingContext
> {}
