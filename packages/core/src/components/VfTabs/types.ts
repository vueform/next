import type {
  TabsApi,
  TabsProps,
  TabsEmits,
  TabbedParts,
  TabbedSlots,
  TabsExpose,
  TabsClasses,
} from '#core/blueprints/tabs'
import type { ResolvedPage } from '#core/composables'
import type {
  DefineElementContext,
  ClassValue,
  DomAttrsOf,
  UnknownElement,
  DefineRegistryEntry,
} from '#core/types'
import type { VNode } from 'vue'

/**
 * Props for the VfTabs component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
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
  wrapper: (props: {
    class: ClassValue
    index: number
    label?: string
    meta?: Record<string, any>
    selected: boolean
    invalid: boolean
    loading: boolean
    el$: UnknownElement
    page: ResolvedPage
  }) => VNode[]

  /**
   * Slot that replaces each tab's inner content. Receives tab state.
   */
  default: (props: {
    index: number
    label?: string
    meta?: Record<string, any>
    selected: boolean
    invalid: boolean
    loading: boolean
    el$: UnknownElement
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
   * Each tab wrapper. Receives the resolved page data.
   *
   * @param page The resolved page data for this tab.
   */
  wrapper: (page: ResolvedPage) => ClassValue

  /**
   * The tab button element.
   */
  tab: ClassValue
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
