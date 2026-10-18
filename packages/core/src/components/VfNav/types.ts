import type { VNode } from 'vue'

import type {
  NavApi,
  NavA11y,
  NavModifiers,
  NavPosProp,
  NavProps,
  NavEmits,
  NavParts,
  NavSlots,
  NavExpose,
  NavClasses,
} from '#src/blueprints/nav'
import type { Pager } from '#src/composables'
import type { ConditionalProp } from '#src/modules/conditions'
import {
  type DefineElementContext,
  type DefineRegistryEntry,
  type ClassValue,
  type DomAttrsOf,
  type PartOf,
  type TProp,
} from '#src/types'

/**
 * Props for the VfNav component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
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
   * @param scope The back slot's params.
   */
  back: (scope: {
    /**
     * The button label text.
     */
    label: TProp | string | undefined

    /**
     * The pager instance managing navigation state.
     */
    pager: Pager

    /**
     * The form's component context.
     */
    form$: any

    /**
     * Whether the button is disabled.
     */
    disabled: boolean | string | ConditionalProp

    /**
     * Whether the nav is in fluid position mode — the button stretches to the
     * full available width.
     */
    fluid: boolean

    /**
     * CSS classes for the back button element.
     */
    classes: ClassValue

    /**
     * Resolved `part:back` attribute overrides for the back button element;
     * apply with `v-bind`.
     */
    part: PartOf<'VfButton'> | undefined

    /**
     * Ready-to-spread ARIA attribute bindings for the rendered control.
     */
    a11yBindings: VfNavA11y['back']

    /**
     * Handler to navigate back.
     */
    back: () => Promise<void>
  }) => VNode[]

  /**
   * Slot that replaces the back button's text label.
   *
   * @param scope The backText slot's params.
   */
  backText: (scope: {
    /**
     * The button label text.
     */
    label: string | undefined

    /**
     * The pager instance managing navigation state.
     */
    pager: Pager

    /**
     * The form's component context.
     */
    form$: any
  }) => VNode[]

  /**
   * Slot that replaces the next button. The payload is what VfNav provides — a
   * fixed list, independent of the registered `VfButton`'s prop surface, since
   * the slot may render anything.
   *
   * @param scope The next slot's params.
   */
  next: (scope: {
    /**
     * The button label text.
     */
    label: TProp | string | undefined

    /**
     * The pager instance managing navigation state.
     */
    pager: Pager

    /**
     * The form's component context.
     */
    form$: any

    /**
     * Whether the button is disabled.
     */
    disabled: boolean | string | ConditionalProp

    /**
     * Whether the form is in a loading state.
     */
    loading: boolean | ConditionalProp

    /**
     * Whether the nav is in fluid position mode — the button stretches to the
     * full available width.
     */
    fluid: boolean

    /**
     * CSS classes for the next button element.
     */
    classes: ClassValue

    /**
     * Resolved `part:next` attribute overrides for the next button element;
     * apply with `v-bind`.
     */
    part: PartOf<'VfButton'> | undefined

    /**
     * Ready-to-spread styling modifier attributes for the rendered control.
     */
    modifiers: VfNavModifiers['next']

    /**
     * Ready-to-spread ARIA attribute bindings for the rendered control.
     */
    a11yBindings: VfNavA11y['next']

    /**
     * Handler to navigate to the next step.
     */
    next: () => Promise<void>
  }) => VNode[]

  /**
   * Slot that replaces the next button's text label.
   *
   * @param scope The nextText slot's params.
   */
  nextText: (scope: {
    /**
     * The button label text.
     */
    label: string | undefined

    /**
     * The pager instance managing navigation state.
     */
    pager: Pager

    /**
     * The form's component context.
     */
    form$: any
  }) => VNode[]

  /**
   * Slot that replaces the finish button. The payload is what VfNav provides —
   * a fixed list, independent of the registered `VfButton`'s prop surface,
   * since the slot may render anything.
   *
   * @param scope The finish slot's params.
   */
  finish: (scope: {
    /**
     * The button label text.
     */
    label: TProp | string | undefined

    /**
     * The pager instance managing navigation state.
     */
    pager: Pager

    /**
     * The form's component context.
     */
    form$: any

    /**
     * Whether the button is disabled.
     */
    disabled: boolean | string | ConditionalProp

    /**
     * Whether the form is in a loading state.
     */
    loading: boolean | ConditionalProp

    /**
     * Whether the nav is in fluid position mode — the button stretches to the
     * full available width.
     */
    fluid: boolean

    /**
     * CSS classes for the finish button element.
     */
    classes: ClassValue

    /**
     * Resolved `part:finish` attribute overrides for the finish button
     * element; apply with `v-bind`.
     */
    part: PartOf<'VfButton'> | undefined

    /**
     * Ready-to-spread styling modifier attributes for the rendered control.
     */
    modifiers: VfNavModifiers['finish']

    /**
     * Ready-to-spread ARIA attribute bindings for the rendered control.
     */
    a11yBindings: VfNavA11y['finish']

    /**
     * Handler to finish/submit the form.
     */
    finish: () => Promise<void>
  }) => VNode[]

  /**
   * Slot that replaces the finish button's text label.
   *
   * @param scope The finishText slot's params.
   */
  finishText: (scope: {
    /**
     * The button label text.
     */
    label: string | undefined

    /**
     * The pager instance managing navigation state.
     */
    pager: Pager

    /**
     * The form's component context.
     */
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
 * Accessibility bindings of the VfNav component.
 */
export interface VfNavA11y extends NavA11y {}

/**
 * Styling modifiers of the VfNav component.
 */
export interface VfNavModifiers extends NavModifiers {
  /**
   * The root navigation element's position variant and the marker set while
   * the back button is hidden on the first page.
   */
  root: {
    'data-position'?: NavPosProp
    'data-no-back'?: ''
  }

  /**
   * The next button's loading state.
   */
  next: {
    'data-loading'?: ''
  }

  /**
   * The finish button's loading state.
   */
  finish: {
    'data-loading'?: ''
  }
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
  VfNavModifiers,
  VfNavA11y,
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
