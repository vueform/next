import type { VNode } from 'vue'

import {
  type ElementsApi,
  type ElementsBindings,
  type ElementsProps,
  type ElementsEmits,
  type ElementsParts,
  type ElementsSlots,
  type ElementsExpose,
  type ElementsClasses,
} from '#src/blueprints/elements'
import type {
  DefineElementContext,
  ClassValue,
  DomAttrsOf,
  DefineRegistryEntry,
} from '#src/types'

/**
 * Props for the VfElements component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfElementsProps extends ElementsProps<
  VfElementsSlots,
  VfElementsParts,
  VfElementsClasses,
  VfElementsContext
> {}

/**
 * Events emitted by the VfElements component.
 */
export interface VfElementsEmits extends ElementsEmits<VfElementsContext> {}

/**
 * Slots available in the VfElements component.
 */
export interface VfElementsSlots extends ElementsSlots<VfElementsContext> {
  /**
   * Slot for the default content of the elements container.
   */
  default: () => VNode[]
}

/**
 * Structural parts of the VfElements component.
 */
export interface VfElementsParts extends ElementsParts {
  /**
   * The root elements container.
   *
   * @tag div
   */
  root: DomAttrsOf<'div'>
}

/**
 * CSS classes for the VfElements component's structural parts.
 */
export interface VfElementsClasses extends ElementsClasses {
  /**
   * The root elements container.
   */
  root: ClassValue
}

/**
 * Part-keyed binding definitions of the VfElements component.
 */
export interface VfElementsBindings extends ElementsBindings {}

/**
 * Augmentable public API surface for VfElements.
 */
export interface VfElementsExpose extends ElementsExpose {}

/**
 * Public context for VfElements.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfElementsContext extends DefineElementContext<
  VfElementsProps,
  VfElementsEmits,
  VfElementsSlots,
  VfElementsParts,
  VfElementsClasses,
  VfElementsBindings,
  VfElementsExpose,
  ElementsApi
> {}

/**
 * Registry entry for VfElements. `TEntry` is accepted for registry uniformity
 * but does not narrow anything — VfElements has no prop-driven generics.
 */
export interface VfElementsEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfElementsProps,
  VfElementsEmits,
  VfElementsSlots,
  VfElementsParts,
  VfElementsClasses,
  VfElementsContext
> {}
