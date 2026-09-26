import type {
  KnobApi,
  KnobClasses,
  KnobEmits,
  KnobExpose,
  KnobParts,
  KnobProps,
  KnobSlots,
} from '#primevue/blueprints/knob'
import type {
  ClassValue,
  DefineElementContext,
  DefineRegistryEntry,
} from '@vueform/core'
import type { KnobProps as PvKnobProps } from 'primevue'

/**
 * Props for the VfKnob component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
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
