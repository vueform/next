import type {
  ClassValue,
  DefineElementContext,
  DefineRegistryEntry,
  DPropValue,
} from '@vueform/core'
import type {
  ButtonProps as PvButtonProps,
  ButtonSlots as AButtonSlots,
} from 'primevue'

import type {
  ButtonApi,
  ButtonBindings,
  ButtonClasses,
  ButtonEmits,
  ButtonExpose,
  ButtonParts,
  ButtonProps,
  ButtonSlots,
  forwards,
} from '#src/blueprints/button'
import type { ForwardedSlots } from '#src/types'

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
export interface VfButtonSlots
  extends
    ButtonSlots<VfButtonContext>,
    /* @vue-ignore */ ForwardedSlots<
      AButtonSlots,
      (typeof forwards.slots)[number]
    > {}

/**
 * Structural parts of the VfButton component.
 */
export interface VfButtonParts extends ButtonParts {
  /**
   * The PrimeVue Button component.
   *
   * @tag Button
   */
  button: PvButtonProps
}

/**
 * CSS classes for the VfButton component's structural parts.
 */
export interface VfButtonClasses extends ButtonClasses {
  /**
   * The PrimeVue Button component.
   */
  button: ClassValue
}

/**
 * Part-keyed binding definitions of the VfButton component, registered via
 * `useBindings` in the SFC. Zero-argument resolver entries — resolved at each
 * part's consuming site, keys stay static.
 */
export interface VfButtonBindings extends ButtonBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The button control's variant, state, and layout attributes. `data-disabled`
   * is set only in anchor mode (`href`), where no native `disabled` attribute
   * exists.
   */
  button: {
    'data-severity'?: DPropValue<VfButtonProps['severity']>
    'data-align'?: VfButtonProps['align']
    'data-fluid'?: ''
    'data-loading'?: ''
    'data-icon-only'?: ''
    'data-disabled'?: ''
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
