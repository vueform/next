import type { VNode } from 'vue'

import {
  type ColApi,
  type ColClasses,
  type ColEmits,
  type ColExpose,
  type ColParts,
  type ColProps,
  type ColSlots,
} from '#core/blueprints/col'
import type {
  DefineElementContext,
  AlignProp,
  ClassValue,
  DomAttrsOf,
  ValignProp,
  DefineRegistryEntry,
} from '#core/types'

/**
 * Props for the VfCol component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
export interface VfColProps extends ColProps<
  VfColSlots,
  VfColParts,
  VfColClasses,
  VfColContext
> {}

/**
 * Events emitted by the VfCol component.
 */
export interface VfColEmits extends ColEmits<VfColContext> {}

/**
 * Slots available in the VfCol component.
 */
export interface VfColSlots extends ColSlots<VfColContext> {
  /**
   * Slot for the column's default content.
   */
  default: () => VNode[]
}

/**
 * Structural parts of the VfCol component.
 */
export interface VfColParts extends ColParts {
  /**
   * The root column element.
   *
   * @tag div
   */
  root: DomAttrsOf<'div'>
}

/**
 * CSS classes for the VfCol component's structural parts.
 */
export interface VfColClasses extends ColClasses {
  /**
   * Resolves CSS classes for the root column element from alignment and header
   * options.
   *
   * @param options Alignment and header values used when computing the root
   *   classes.
   */
  root: (options: {
    align: AlignProp
    valign: ValignProp
    colHeader: boolean
    rowHeader: boolean
  }) => ClassValue
}

/**
 * Augmentable public API surface for VfCol.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `ColExpose` for all col-based components) so they appear
 * on `ContextOf<'VfCol'>` / `context$` / `defineExpose`.
 */
export interface VfColExpose extends ColExpose {}

/**
 * Public context for VfCol.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfColContext extends DefineElementContext<
  VfColProps,
  VfColEmits,
  VfColSlots,
  VfColParts,
  VfColClasses,
  VfColExpose,
  ColApi
> {}

/**
 * Registry entry for VfCol. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfCol has no prop-driven generics.
 */
export interface VfColEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfColProps,
  VfColEmits,
  VfColSlots,
  VfColParts,
  VfColClasses,
  VfColContext
> {}
