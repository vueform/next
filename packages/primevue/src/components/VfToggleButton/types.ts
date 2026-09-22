import type {
  ToggleButtonApi,
  ToggleButtonClasses,
  ToggleButtonEmits,
  ToggleButtonExpose,
  ToggleButtonParts,
  ToggleButtonProps,
  ToggleButtonSlots,
  forwards,
} from '@/blueprints/toggle-button'
import type { ForwardedSlots } from '@/types'
import type {
  ClassValue,
  DefineElementContext,
  DefineRegistryEntry,
} from '@vueform/core'
import type { ToggleButtonProps as PvToggleButtonProps } from 'primevue'
import type { ToggleButtonSlots as AToggleButtonSlots } from 'primevue/togglebutton'

/**
 * Props for the VfToggleButton component.
 *
 * Non-generic — `onLabel` / `offLabel` are display strings and do not drive the
 * model. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
export interface VfToggleButtonProps extends ToggleButtonProps<
  'toggle-button',
  VfToggleButtonSlots,
  VfToggleButtonParts,
  VfToggleButtonClasses,
  VfToggleButtonContext
> {}

/**
 * Events emitted by the VfToggleButton component.
 */
export interface VfToggleButtonEmits extends ToggleButtonEmits<VfToggleButtonContext> {}

/**
 * Slots available in the VfToggleButton component.
 */
export interface VfToggleButtonSlots
  extends
    ToggleButtonSlots<VfToggleButtonContext>,
    /* @vue-ignore */ ForwardedSlots<
      AToggleButtonSlots,
      (typeof forwards.slots)[number]
    > {}

/**
 * Structural parts of the VfToggleButton component.
 */
export interface VfToggleButtonParts extends ToggleButtonParts {
  /**
   * The toggle button element.
   *
   * @tag ToggleButton
   */
  input: PvToggleButtonProps
}

/**
 * CSS classes for the VfToggleButton component's structural parts.
 */
export interface VfToggleButtonClasses extends ToggleButtonClasses {
  /**
   * The toggle button element.
   */
  input: ClassValue
}

/**
 * Augmentable public API surface for VfToggleButton.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `ToggleButtonExpose` for all toggle-button-based
 * components) so they appear on `ContextOf<'VfToggleButton'>` / `context$` /
 * `defineExpose`.
 */
export interface VfToggleButtonExpose extends ToggleButtonExpose {}

/**
 * Public context for VfToggleButton.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfToggleButtonContext extends DefineElementContext<
  VfToggleButtonProps,
  VfToggleButtonEmits,
  VfToggleButtonSlots,
  VfToggleButtonParts,
  VfToggleButtonClasses,
  VfToggleButtonExpose,
  ToggleButtonApi
> {}

/**
 * Registry entry for VfToggleButton. `TEntry` is accepted for registry
 * uniformity but does not narrow anything — VfToggleButton has no prop-driven
 * generics.
 */
export interface VfToggleButtonEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfToggleButtonProps,
  VfToggleButtonEmits,
  VfToggleButtonSlots,
  VfToggleButtonParts,
  VfToggleButtonClasses,
  VfToggleButtonContext
> {}
