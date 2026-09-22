import {
  type HiddenApi,
  type HiddenClasses,
  type HiddenEmits,
  type HiddenExpose,
  type HiddenParts,
  type HiddenProps,
  type HiddenSlots,
} from '~/blueprints/hidden'
import type { DefineElementContext, DefineRegistryEntry } from '~/types'

/**
 * Props for the VfHidden component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
export interface VfHiddenProps extends HiddenProps<
  'hidden',
  VfHiddenSlots,
  VfHiddenParts,
  VfHiddenClasses,
  VfHiddenContext
> {}

/**
 * Events emitted by the VfHidden component.
 */
export interface VfHiddenEmits extends HiddenEmits<VfHiddenContext> {}

/**
 * Slots available in the VfHidden component.
 */
export interface VfHiddenSlots extends HiddenSlots<VfHiddenContext> {}

/**
 * Structural parts of the VfHidden component.
 */
export interface VfHiddenParts extends HiddenParts {}

/**
 * CSS classes for the VfHidden component.
 */
export interface VfHiddenClasses extends HiddenClasses {}

/**
 * Augmentable public API surface for VfHidden.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `HiddenExpose` for all hidden-based components) so they
 * appear on `ContextOf<'VfHidden'>` / `context$` / `defineExpose`.
 */
export interface VfHiddenExpose extends HiddenExpose {}

/**
 * Public context for VfHidden.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfHiddenContext extends DefineElementContext<
  VfHiddenProps,
  VfHiddenEmits,
  VfHiddenSlots,
  VfHiddenParts,
  VfHiddenClasses,
  VfHiddenExpose,
  HiddenApi
> {}

/**
 * Registry entry for VfHidden. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfHidden has no prop-driven generics.
 */
export interface VfHiddenEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfHiddenProps,
  VfHiddenEmits,
  VfHiddenSlots,
  VfHiddenParts,
  VfHiddenClasses,
  VfHiddenContext
> {}
