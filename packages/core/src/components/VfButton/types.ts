import {
  type ButtonApi,
  type ButtonClasses,
  type ButtonEmits,
  type ButtonExpose,
  type ButtonParts,
  type ButtonProps,
  type ButtonSlots,
} from '~/blueprints/button'
import type {
  DefineElementContext,
  DomAttrsOf,
  ClassValue,
  DefineRegistryEntry,
} from '~/types'
import type { VNode } from 'vue'

/**
 * Props for the VfButton component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
export interface VfButtonProps extends ButtonProps<
  'button',
  VfButtonSlots,
  VfButtonParts,
  VfButtonClasses,
  VfButtonContext
> {}

/**
 * Events emitted by the VfButton component.
 */
export interface VfButtonEmits extends ButtonEmits<VfButtonContext> {}

/**
 * Slots available in the VfButton component.
 */
export interface VfButtonSlots extends ButtonSlots<VfButtonContext> {
  /**
   * Slot for content rendered before the label.
   */
  before: () => VNode[]

  /**
   * Default slot that replaces the button label content.
   *
   * @param props.text The resolved button label text.
   */
  default: (props: { text: string | undefined }) => VNode[]

  /**
   * Slot for content rendered after the label.
   */
  after: () => VNode[]
}

/**
 * Structural parts of the VfButton component.
 */
export interface VfButtonParts extends ButtonParts {
  /**
   * The root button or anchor element.
   *
   * @tag button | a
   */
  button: DomAttrsOf<'button' | 'a'>

  /**
   * The icon of the button.
   *
   * @tag i
   */
  icon: DomAttrsOf<'i'>

  /**
   * The text of the button.
   *
   * @tag span
   */
  text: DomAttrsOf<'span'>
}

/**
 * CSS classes for the VfButton component's structural parts.
 */
export interface VfButtonClasses extends ButtonClasses {
  /**
   * The root button or anchor element.
   */
  button: ClassValue

  /**
   * The button label text element.
   */
  text: ClassValue

  /**
   * The button icon element.
   */
  icon: ClassValue
}

/**
 * Augmentable public API surface for VfButton.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `ButtonExpose` for all button-based components) so they
 * appear on `ContextOf<'VfButton'>` / `context$` / `defineExpose`.
 */
export interface VfButtonExpose extends ButtonExpose {}

/**
 * Public context for VfButton.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfButtonContext extends DefineElementContext<
  VfButtonProps,
  VfButtonEmits,
  VfButtonSlots,
  VfButtonParts,
  VfButtonClasses,
  VfButtonExpose,
  ButtonApi
> {}

/**
 * Registry entry for VfButton. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfButton has no prop-driven generics.
 */
export interface VfButtonEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfButtonProps,
  VfButtonEmits,
  VfButtonSlots,
  VfButtonParts,
  VfButtonClasses,
  VfButtonContext
> {}
