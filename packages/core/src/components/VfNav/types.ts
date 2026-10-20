import type { VNode } from 'vue'

import type {
  NavApi,
  NavBindings,
  NavPosProp,
  NavProps,
  NavEmits,
  NavParts,
  NavSlots,
  NavExpose,
  NavClasses,
} from '#src/blueprints/nav'
import type { Pager, ResolvedBindings } from '#src/composables'
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
 * Resolved per-part binding bags for VfNav slot scopes.
 */
type VfNavBags = ResolvedBindings<VfNavParts, VfNavBindings>

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
     * The back button's resolved bindings (part overrides, ARIA state); apply
     * with `v-bind`.
     */
    bindings: VfNavBags['back']

    /**
     * Handler to navigate back.
     */
    back: () => Promise<void>
  }) => VNode[]

  /**
   * Slot that replaces the back button's text label.
   *
   * @param scope The back-text slot's params.
   */
  'back-text': (scope: {
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
     * The next button's resolved bindings (part overrides, loading modifier,
     * ARIA state); apply with `v-bind`.
     */
    bindings: VfNavBags['next']

    /**
     * Handler to navigate to the next step.
     */
    next: () => Promise<void>
  }) => VNode[]

  /**
   * Slot that replaces the next button's text label.
   *
   * @param scope The next-text slot's params.
   */
  'next-text': (scope: {
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
     * The finish button's resolved bindings (part overrides, loading modifier,
     * ARIA state); apply with `v-bind`.
     */
    bindings: VfNavBags['finish']

    /**
     * Handler to finish/submit the form.
     */
    finish: () => Promise<void>
  }) => VNode[]

  /**
   * Slot that replaces the finish button's text label.
   *
   * @param scope The finish-text slot's params.
   */
  'finish-text': (scope: {
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
 * Part-keyed binding definitions of the VfNav component, registered via
 * `useBindings`. Zero-argument resolver entries — resolved at each part's
 * consuming site, keys stay static.
 */
export interface VfNavBindings extends NavBindings {
  /**
   * The root navigation element's position variant and the marker set while
   * the back button is hidden on the first page.
   */
  root: {
    'data-position'?: NavPosProp
    'data-no-back'?: ''
  }

  /**
   * ARIA state for the back navigation control.
   */
  back: {
    'aria-disabled'?: true
  }

  /**
   * The next button's loading state and ARIA state.
   */
  next: {
    'data-loading'?: ''
    'aria-busy'?: true
    'aria-disabled'?: true
    'aria-describedby'?: string
  }

  /**
   * The finish button's loading state and ARIA state.
   */
  finish: {
    'data-loading'?: ''
    'aria-busy'?: true
    'aria-disabled'?: true
    'aria-describedby'?: string
  }

  /**
   * The screen-reader status region's id and role, keyed to the sr-only
   * loading span it binds to.
   */
  srOnlyLoading: {
    id: string
    role: 'status'
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
  VfNavBindings,
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
