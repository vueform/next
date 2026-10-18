import type { VNode } from 'vue'

import {
  type AddonA11y,
  type AddonApi,
  type AddonModifiers,
  type AddonProps,
  type AddonEmits,
  type AddonParts,
  type AddonSlots,
  type AddonClasses,
  type AddonExpose,
} from '#src/blueprints/addon'
import type {
  DefineElementContext,
  ClassValue,
  DomAttrsOf,
  DefineRegistryEntry,
} from '#src/types'

/**
 * Props for the VfAddon component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfAddonProps extends AddonProps<
  VfAddonSlots,
  VfAddonParts,
  VfAddonClasses,
  VfAddonContext
> {}

/**
 * Events emitted by the VfAddon component.
 */
export interface VfAddonEmits extends AddonEmits<VfAddonContext> {}

/**
 * Slots available in the VfAddon component.
 */
export interface VfAddonSlots extends AddonSlots<VfAddonContext> {
  /**
   * Default slot for addon content.
   */
  default: () => VNode[]
}

/**
 * Structural parts of the VfAddon component.
 */
export interface VfAddonParts extends AddonParts {
  /**
   * The root wrapper element.
   *
   * @tag div
   */
  root: DomAttrsOf<'div'>
}

/**
 * CSS classes for the VfAddon component's structural parts.
 */
export interface VfAddonClasses extends AddonClasses {
  /**
   * The root wrapper element.
   */
  root: ClassValue
}

/**
 * Accessibility bindings of the VfAddon component.
 */
export interface VfAddonA11y extends AddonA11y {}

/**
 * Styling modifiers of the VfAddon component.
 */
export interface VfAddonModifiers extends AddonModifiers {}

/**
 * Augmentable public API surface for VfAddon.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `AddonExpose` for all addon-based components) so they
 * appear on `ContextOf<'VfAddon'>` / `context$` / `defineExpose`.
 */
export interface VfAddonExpose extends AddonExpose {}

/**
 * Public context for VfAddon.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfAddonContext extends DefineElementContext<
  VfAddonProps,
  VfAddonEmits,
  VfAddonSlots,
  VfAddonParts,
  VfAddonClasses,
  VfAddonModifiers,
  VfAddonA11y,
  VfAddonExpose,
  AddonApi
> {}

/**
 * Registry entry for VfAddon. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfAddon has no prop-driven generics.
 */
export interface VfAddonEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfAddonProps,
  VfAddonEmits,
  VfAddonSlots,
  VfAddonParts,
  VfAddonClasses,
  VfAddonContext
> {}
