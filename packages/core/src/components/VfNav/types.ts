import type { VNode } from 'vue'

import type {
  NavApi,
  NavBackAriaBindings,
  NavForwardAriaBindings,
  NavProps,
  NavEmits,
  NavParts,
  NavSlots,
  NavExpose,
  NavClasses,
} from '#core/blueprints/nav'
import type { Pager } from '#core/composables'
import type { ConditionalProp } from '#core/modules/conditions'
import {
  type DefineElementContext,
  type DefineRegistryEntry,
  type ClassValue,
  type DomAttrsOf,
  type PartOf,
  type TProp,
} from '#core/types'

/**
 * Props for the VfNav component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
export interface VfNavProps extends NavProps<
  VfNavSlots,
  VfNavParts,
  VfNavClasses,
  VfNavContext
> {}

/**
 * Events emitted by the VfNav component.
 */
export interface VfNavEmits extends NavEmits<VfNavContext> {}

/**
 * Slots available in the VfNav component.
 */
export interface VfNavSlots extends NavSlots<VfNavContext> {
  /**
   * Slot that replaces the back button. The payload is what VfNav provides — a
   * fixed list, independent of the registered `VfButton`'s prop surface, since
   * the slot may render anything.
   *
   * @param props.class CSS classes for the back button.
   * @param props.label The button label text.
   * @param props.pager The pager instance managing navigation state.
   * @param props.form$ The form's component context.
   * @param props.disabled Whether the button is disabled.
   * @param props.a11yBindings Ready-to-spread ARIA attribute bindings for the
   *   rendered control.
   * @param props.back Handler to navigate back.
   */
  back: (props: {
    class: ClassValue
    label: TProp | string | undefined
    pager: Pager
    form$: any
    disabled: boolean | string | ConditionalProp
    fluid: boolean
    a11yBindings: NavBackAriaBindings
    back: () => Promise<void>
  }) => VNode[]

  /**
   * Slot that replaces the back button's text label.
   *
   * @param props.label The button label text.
   * @param props.pager The pager instance managing navigation state.
   * @param props.form$ The form's component context.
   */
  backText: (props: {
    label: string | undefined
    pager: Pager
    form$: any
  }) => VNode[]

  /**
   * Slot that replaces the next button. The payload is what VfNav provides — a
   * fixed list, independent of the registered `VfButton`'s prop surface, since
   * the slot may render anything.
   *
   * @param props.class CSS classes for the next button.
   * @param props.label The button label text.
   * @param props.pager The pager instance managing navigation state.
   * @param props.form$ The form's component context.
   * @param props.disabled Whether the button is disabled.
   * @param props.loading Whether the form is in a loading state.
   * @param props.a11yBindings Ready-to-spread ARIA attribute bindings for the
   *   rendered control.
   * @param props.next Handler to navigate to the next step.
   */
  next: (props: {
    class: ClassValue
    label: TProp | string | undefined
    pager: Pager
    form$: any
    disabled: boolean | string | ConditionalProp
    loading: boolean | ConditionalProp
    fluid: boolean
    a11yBindings: NavForwardAriaBindings
    next: () => Promise<void>
  }) => VNode[]

  /**
   * Slot that replaces the next button's text label.
   *
   * @param props.label The button label text.
   * @param props.pager The pager instance managing navigation state.
   * @param props.form$ The form's component context.
   */
  nextText: (props: {
    label: string | undefined
    pager: Pager
    form$: any
  }) => VNode[]

  /**
   * Slot that replaces the finish button. The payload is what VfNav provides —
   * a fixed list, independent of the registered `VfButton`'s prop surface,
   * since the slot may render anything.
   *
   * @param props.class CSS classes for the finish button.
   * @param props.label The button label text.
   * @param props.pager The pager instance managing navigation state.
   * @param props.form$ The form's component context.
   * @param props.disabled Whether the button is disabled.
   * @param props.loading Whether the form is in a loading state.
   * @param props.a11yBindings Ready-to-spread ARIA attribute bindings for the
   *   rendered control.
   * @param props.finish Handler to finish/submit the form.
   */
  finish: (props: {
    class: ClassValue
    label: TProp | string | undefined
    pager: Pager
    form$: any
    disabled: boolean | string | ConditionalProp
    loading: boolean | ConditionalProp
    fluid: boolean
    a11yBindings: NavForwardAriaBindings
    finish: () => Promise<void>
  }) => VNode[]

  /**
   * Slot that replaces the finish button's text label.
   *
   * @param props.label The button label text.
   * @param props.pager The pager instance managing navigation state.
   * @param props.form$ The form's component context.
   */
  finishText: (props: {
    label: string | undefined
    pager: Pager
    form$: any
  }) => VNode[]
}
/**
 * Structural parts of the VfNav component.
 */
export interface VfNavParts extends NavParts {
  /**
   * The root navigation element.
   *
   * @tag div
   */
  root: DomAttrsOf<'div'>

  /**
   * The back button element.
   *
   * @tag VfButton
   */
  back: PartOf<'VfButton'>

  /**
   * The next button element.
   *
   * @tag VfButton
   */
  next: PartOf<'VfButton'>

  /**
   * The finish button element.
   *
   * @tag VfButton
   */
  finish: PartOf<'VfButton'>

  /**
   * The screen-reader-only loading indicator element.
   *
   * @tag span
   */
  srOnlyLoading: DomAttrsOf<'span'>
}

/**
 * CSS classes for the VfNav component's structural parts.
 */
export interface VfNavClasses extends NavClasses {
  /**
   * The root navigation element.
   */
  root: ClassValue

  /**
   * The back button element.
   */
  back: ClassValue

  /**
   * The next button element.
   */
  next: ClassValue

  /**
   * The finish button element.
   */
  finish: ClassValue
}

/**
 * Augmentable public API surface for VfNav.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `NavExpose` for all nav-based components) so they appear
 * on `ContextOf<'VfNav'>` / `context$` / `defineExpose`.
 */
export interface VfNavExpose extends NavExpose {}

/**
 * Public context for VfNav.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfNavContext extends DefineElementContext<
  VfNavProps,
  VfNavEmits,
  VfNavSlots,
  VfNavParts,
  VfNavClasses,
  VfNavExpose,
  NavApi
> {}

/**
 * Registry entry for VfNav. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfNav has no prop-driven generics.
 */
export interface VfNavEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfNavProps,
  VfNavEmits,
  VfNavSlots,
  VfNavParts,
  VfNavClasses,
  VfNavContext
> {}
