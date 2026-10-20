import type { VNode } from 'vue'

import type { LayoutRegionBindings } from '#src/a11y'
import {
  type ButtonApi,
  type ButtonClasses,
  type ButtonEmits,
  type ButtonExpose,
  type ButtonBindings,
  type ButtonParts,
  type ButtonProps,
  type ButtonSlots,
} from '#src/blueprints/button'
import type { PartBindings } from '#src/composables'
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
     * The label text element's resolved bindings (part overrides); apply
     * with `v-bind`.
     */
    bindings: PartBindings<'text', VfButtonParts, VfButtonBindings>
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
 * Part-keyed binding definitions of the VfButton component, registered via
 * `useBindings` in the SFC (VfButton is the only consumer, so the entries are
 * defined there rather than as a shared pattern) together with the
 * `layoutRegionBindings` entries. Zero-argument resolver entries — resolved
 * at each part's consuming site, keys stay static.
 */
export interface VfButtonBindings extends ButtonBindings, LayoutRegionBindings {
  /**
   * The button control's variant, state, and layout attributes plus its
   * native/ARIA state: native `disabled` on `<button>`, `aria-disabled` and
   * `data-disabled` in anchor mode (`href`/`to`), busy state, the icon-only
   * accessible name, and describedby.
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
    disabled?: true
    'aria-disabled'?: true
    'aria-busy'?: true
    'aria-label'?: string
    'aria-describedby'?: string
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
  VfButtonBindings,
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
