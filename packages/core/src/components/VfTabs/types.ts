import type { VNode } from 'vue'

import type {
  TabsA11y,
  TabsApi,
  TabsProps,
  TabsEmits,
  TabbedParts,
  TabbedSlots,
  TabsExpose,
  TabsClasses,
  TabsModifiers,
} from '#src/blueprints/tabs'
import type { PartBindings, ResolvedPage } from '#src/composables'
import type {
  DefineElementContext,
  ClassValue,
  DomAttrsOf,
  UnknownElement,
  DefineRegistryEntry,
} from '#src/types'

/**
 * Props for the VfTabs component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfTabsProps extends TabsProps<
  VfTabsSlots,
  VfTabsParts,
  VfTabsClasses,
  VfTabsContext
> {}

/**
 * Events emitted by the VfTabs component.
 */
export interface VfTabsEmits extends TabsEmits<VfTabsContext> {}

/**
 * Slots available in the VfTabs component.
 */
export interface VfTabsSlots extends TabbedSlots<VfTabsContext> {
  /**
   * Slot that replaces each tab wrapper element. Receives tab state and page
   * info.
   */
  wrapper: (scope: {
    /**
     * The zero-based index of the tab's page.
     */
    index: number

    /**
     * The tab's resolved label text.
     */
    label?: string

    /**
     * The metadata object from the page prop's tuple form.
     */
    meta?: Record<string, any>

    /**
     * Whether the tab is currently selected.
     */
    selected: boolean

    /**
     * Whether the tab's page has validation errors.
     */
    invalid: boolean

    /**
     * Whether the tab's page is busy validating or processing an event.
     */
    loading: boolean

    /**
     * The tab's element context.
     */
    el$: UnknownElement

    /**
     * The resolved page object for this tab.
     */
    page: ResolvedPage
  }) => VNode[]

  /**
   * Slot that replaces each tab's inner content. Receives tab state.
   */
  default: (scope: {
    /**
     * The zero-based index of the tab's page.
     */
    index: number

    /**
     * The tab's resolved label text.
     */
    label?: string

    /**
     * The metadata object from the page prop's tuple form.
     */
    meta?: Record<string, any>

    /**
     * Whether the tab is currently selected.
     */
    selected: boolean

    /**
     * Whether the tab's page has validation errors.
     */
    invalid: boolean

    /**
     * Whether the tab's page is busy validating or processing an event.
     */
    loading: boolean

    /**
     * The tab's element context.
     */
    el$: UnknownElement

    /**
     * The tab button's resolved bindings (classes, part overrides); apply
     * with `v-bind`.
     */
    bindings: PartBindings<'tab', VfTabsParts, VfTabsModifiers, VfTabsA11y>
  }) => VNode[]
}

/**
 * Structural parts of the VfTabs component.
 */
export interface VfTabsParts extends TabbedParts {
  /**
   * The root tabs container element.
   *
   * @tag div
   */
  root: DomAttrsOf<'div'>

  /**
   * The tab list element.
   *
   * @tag ul
   */
  list: DomAttrsOf<'ul'>

  /**
   * Each tab wrapper. Receives the resolved page data.
   *
   * @param page The resolved page data for this tab.
   * @tag li
   */
  wrapper: (page: ResolvedPage) => DomAttrsOf<'li'>

  /**
   * The tab button element.
   *
   * @tag button
   */
  tab: DomAttrsOf<'button'>
}

/**
 * CSS classes for the VfTabs component's structural parts.
 */
export interface VfTabsClasses extends TabsClasses {
  /**
   * The root tabs container element.
   */
  root: ClassValue

  /**
   * The tab list element.
   */
  list: ClassValue

  /**
   * Each tab wrapper. State is exposed via `data-selected` and `data-invalid`
   * attributes.
   */
  wrapper: ClassValue

  /**
   * The tab button element.
   */
  tab: ClassValue
}

/**
 * Accessibility bindings of the VfTabs component.
 */
export interface VfTabsA11y extends TabsA11y {}

/**
 * Styling modifiers of the VfTabs component.
 */
export interface VfTabsModifiers extends TabsModifiers {
  /**
   * Each tab wrapper's selection and validity state.
   *
   * @param page The resolved page data for this tab.
   */
  wrapper: (page: ResolvedPage) => {
    'data-selected'?: ''
    'data-invalid'?: ''
  }
}

/**
 * Augmentable public API surface for VfTabs.
 */
export interface VfTabsExpose extends TabsExpose {}

/**
 * Public context for VfTabs.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfTabsContext extends DefineElementContext<
  VfTabsProps,
  VfTabsEmits,
  VfTabsSlots,
  VfTabsParts,
  VfTabsClasses,
  VfTabsModifiers,
  VfTabsA11y,
  VfTabsExpose,
  TabsApi
> {}

/**
 * Registry entry for VfTabs. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfTabs has no prop-driven generics.
 */
export interface VfTabsEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfTabsProps,
  VfTabsEmits,
  VfTabsSlots,
  VfTabsParts,
  VfTabsClasses,
  VfTabsContext
> {}
