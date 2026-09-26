import type { DefineElementContext, DefineRegistryEntry } from '#core/types'
import type { VNode } from 'vue'
import {
  type ContentApi,
  type ContentClasses,
  type ContentEmits,
  type ContentExpose,
  type ContentParts,
  type ContentProps,
  type ContentSlots,
} from '#core/blueprints/content'

/**
 * Props for the VfContent component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 */
export interface VfContentProps extends ContentProps<
  'content',
  VfContentSlots,
  VfContentParts,
  VfContentClasses,
  VfContentContext
> {}

/**
 * Events emitted by the VfContent component.
 */
export interface VfContentEmits extends ContentEmits<VfContentContext> {}

/**
 * Slots available in the VfContent component.
 */
export interface VfContentSlots extends ContentSlots<VfContentContext> {
  /**
   * Default slot that replaces the content. Receives the full component
   * context.
   *
   * @exposes VfContent
   */
  default: (props: { context: VfContentContext }) => VNode[]
}

/**
 * Structural parts of the VfContent component.
 */
export interface VfContentParts extends ContentParts {}

/**
 * CSS classes for the VfContent component.
 */
export interface VfContentClasses extends ContentClasses {}

/**
 * Augmentable public API surface for VfContent.
 */
export interface VfContentExpose extends ContentExpose {}

/**
 * Public context for VfContent.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfContentContext extends DefineElementContext<
  VfContentProps,
  VfContentEmits,
  VfContentSlots,
  VfContentParts,
  VfContentClasses,
  VfContentExpose,
  ContentApi
> {}

/**
 * Registry entry for VfContent. `TEntry` is accepted for registry uniformity
 * but does not narrow anything — VfContent has no prop-driven generics.
 */
export interface VfContentEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfContentProps,
  VfContentEmits,
  VfContentSlots,
  VfContentParts,
  VfContentClasses,
  VfContentContext
> {}
