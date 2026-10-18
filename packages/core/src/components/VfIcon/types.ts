import {
  type IconA11y,
  type IconApi,
  type IconModifiers,
  type IconProps,
  type IconEmits,
  type IconParts,
  type IconSlots,
  type IconExpose,
  type IconClasses,
} from '#src/blueprints/icon'
import type {
  DefineElementContext,
  ClassValue,
  DomAttrsOf,
  DefineRegistryEntry,
} from '#src/types'

/**
 * Props for the VfIcon component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfIconProps extends IconProps<
  VfIconSlots,
  VfIconParts,
  VfIconClasses,
  VfIconContext
> {}

/**
 * Events emitted by the VfIcon component.
 */
export interface VfIconEmits extends IconEmits<VfIconContext> {}

/**
 * Slots available in the VfIcon component.
 */
export interface VfIconSlots extends IconSlots<VfIconContext> {}

/**
 * Structural parts of the VfIcon component.
 */
export interface VfIconParts extends IconParts {
  /**
   * The root icon element.
   *
   * @tag i
   */
  root: DomAttrsOf<'i'>
}

/**
 * CSS classes for the VfIcon component's structural parts.
 */
export interface VfIconClasses extends IconClasses {
  /**
   * The root icon element.
   */
  root: ClassValue
}

/**
 * Accessibility bindings of the VfIcon component.
 */
export interface VfIconA11y extends IconA11y {}

/**
 * Styling modifiers of the VfIcon component.
 */
export interface VfIconModifiers extends IconModifiers {}

/**
 * Augmentable public API surface for VfIcon.
 */
export interface VfIconExpose extends IconExpose {}

/**
 * Public context for VfIcon.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfIconContext extends DefineElementContext<
  VfIconProps,
  VfIconEmits,
  VfIconSlots,
  VfIconParts,
  VfIconClasses,
  VfIconModifiers,
  VfIconA11y,
  VfIconExpose,
  IconApi
> {}

/**
 * Registry entry for VfIcon. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfIcon has no prop-driven generics.
 */
export interface VfIconEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfIconProps,
  VfIconEmits,
  VfIconSlots,
  VfIconParts,
  VfIconClasses,
  VfIconContext
> {}
