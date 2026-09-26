import type {
  DefineElementContext,
  ClassValue,
  DomAttrsOf,
  DefineRegistryEntry,
} from '#core/types'
import type { VNode } from 'vue'
import {
  type RowApi,
  type RowClasses,
  type RowEmits,
  type RowExpose,
  type RowParts,
  type RowProps,
  type RowSlots,
} from '#core/blueprints/row'

/**
 * Props for the VfRow component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
export interface VfRowProps extends RowProps<
  VfRowSlots,
  VfRowParts,
  VfRowClasses,
  VfRowContext
> {}

/**
 * Events emitted by the VfRow component.
 */
export interface VfRowEmits extends RowEmits<VfRowContext> {}

/**
 * Slots available in the VfRow component.
 */
export interface VfRowSlots extends RowSlots<VfRowContext> {
  /**
   * Slot for the row's default content.
   */
  default: () => VNode[]
}

/**
 * Structural parts of the VfRow component.
 */
export interface VfRowParts extends RowParts {
  /**
   * The root row element.
   *
   * @tag div
   */
  root: DomAttrsOf<'div'>
}

/**
 * CSS classes for the VfRow component's structural parts.
 */
export interface VfRowClasses extends RowClasses {
  /**
   * The root row element.
   */
  root: ClassValue
}

/**
 * Augmentable public API surface for VfRow.
 */
export interface VfRowExpose extends RowExpose {}

/**
 * Public context for VfRow.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfRowContext extends DefineElementContext<
  VfRowProps,
  VfRowEmits,
  VfRowSlots,
  VfRowParts,
  VfRowClasses,
  VfRowExpose,
  RowApi
> {}

/**
 * Registry entry for VfRow. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfRow has no prop-driven generics.
 */
export interface VfRowEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfRowProps,
  VfRowEmits,
  VfRowSlots,
  VfRowParts,
  VfRowClasses,
  VfRowContext
> {}
