import type { VNode } from 'vue'

import {
  type ContentA11y,
  type ContentApi,
  type ContentClasses,
  type ContentEmits,
  type ContentExpose,
  type ContentModifiers,
  type ContentParts,
  type ContentProps,
  type ContentSlots,
} from '#src/blueprints/content'
import type {
  AlignProp,
  DefineElementContext,
  DefineRegistryEntry,
} from '#src/types'

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
  default: (scope: { context: VfContentContext }) => VNode[]
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
 * Accessibility bindings of the VfContent component.
 */
export interface VfContentA11y extends ContentA11y {}

/**
 * Styling modifiers of the VfContent component.
 */
export interface VfContentModifiers extends ContentModifiers {
  /**
   * The root element's label-alignment marker, horizontal text alignment, and
   * the marker set while the content vertically aligns with adjacent form
   * controls.
   */
  root: {
    'data-align-label'?: ''
    'data-align'?: AlignProp
    'data-aligned'?: ''
  }
}

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
  VfContentModifiers,
  VfContentA11y,
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
