import type { VNode } from 'vue'

import {
  type ButtonA11y,
  type ButtonApi,
  type ButtonClasses,
  type ButtonEmits,
  type ButtonExpose,
  type ButtonModifiers,
  type ButtonParts,
  type ButtonProps,
  type ButtonSlots,
} from '#src/blueprints/button'
import type {
  DefineElementContext,
  DPropValue,
  DomAttrsOf,
  ClassValue,
  DefineRegistryEntry,
} from '#src/types'

/**
 * Props for the VfButton component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
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
   * @param scope The default slot's params.
   */
  default: (scope: {
    /**
     * The resolved button label text.
     */
    text: string | undefined

    /**
     * The component's resolved CSS classes.
     */
    classes: VfButtonClasses

    /**
     * The component's structural part bindings.
     */
    parts: Partial<VfButtonParts>
  }) => VNode[]

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
 * Accessibility bindings of the VfButton component.
 */
export interface VfButtonA11y extends ButtonA11y {}

/**
 * Styling modifiers of the VfButton component.
 */
export interface VfButtonModifiers extends ButtonModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The button control's variant, state, and layout attributes. `data-disabled`
   * is set only in anchor mode (`href`/`to`), where no native `disabled`
   * attribute exists.
   */
  button: {
    'data-variant'?: VfButtonProps['variant']
    'data-severity'?: DPropValue<VfButtonProps['severity']>
    'data-size'?: VfButtonProps['size']
    'data-align'?: VfButtonProps['align']
    'data-fluid'?: ''
    'data-icon-only'?: ''
    'data-loading'?: ''
    'data-disabled'?: ''
  }

  /**
   * The icon's position relative to the label.
   */
  icon: {
    'data-pos'?: VfButtonProps['iconPos']
  }
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
  VfButtonModifiers,
  VfButtonA11y,
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
