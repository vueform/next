import type {
  TabbedSlots,
  AddonGroupClasses,
  IconsClasses,
} from '#core/features'
import type {
  DefineElementContext,
  ClassValue,
  HeadingProp,
  DefineRegistryEntry,
} from '#core/types'
import type { VNode } from 'vue'
import {
  type LayoutApi,
  type LayoutProps,
  type LayoutEmits,
  type LayoutExpose,
  type LayoutParts,
  type LayoutSlots,
  type LayoutClasses,
} from '#core/blueprints/layout'

/**
 * Props for the VfLayout component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
export interface VfLayoutProps extends LayoutProps<
  VfLayoutSlots,
  VfLayoutParts,
  VfLayoutClasses,
  VfLayoutContext
> {}

/**
 * Events emitted by the VfLayout component.
 */
export interface VfLayoutEmits extends LayoutEmits<VfLayoutContext> {}

/**
 * Slots available in the VfLayout component.
 */
export interface VfLayoutSlots
  extends LayoutSlots<VfLayoutContext>, TabbedSlots {
  /**
   * Slot for the element's default content.
   */
  default: () => VNode[]
}

/**
 * VfLayout does not define its own parts. The parts rendered inside VfLayout
 * are inherited from the concrete element component that uses it.
 */
export interface VfLayoutParts extends LayoutParts {}

/**
 * CSS classes for the VfLayout component's structural parts.
 *
 * The base layout keys (`root`, `panel`, `labelGroup`, …) are declared here
 * directly rather than relying solely on adapter-augmented
 * `BaseElementClasses`: VfLayout is the only component that renders them, so
 * they must resolve inside `@vueform/core` on its own.
 */
export interface VfLayoutClasses
  extends LayoutClasses, AddonGroupClasses, IconsClasses {
  /**
   * The element's root wrapper.
   */
  root: (props: {
    spaceTop?: number
    spaceBottom?: number
    lineTop?: boolean
    lineBottom?: boolean
  }) => ClassValue

  /**
   * The main content panel.
   */
  panel: ClassValue

  /**
   * The container holding the label and required indicator.
   */
  labelGroup: (heading?: HeadingProp) => ClassValue

  /**
   * The label element.
   */
  label: ClassValue

  /**
   * The required indicator.
   */
  required: ClassValue

  /**
   * The help text area.
   */
  help: ClassValue

  /**
   * The container wrapping the input and related UI.
   */
  elementGroup: ClassValue

  /**
   * The wrapper directly around the input control.
   */
  elementWrapper: ClassValue

  /**
   * The loading indicator shown while the element is busy.
   */
  loading: ClassValue

  /**
   * The description text area.
   */
  description: ClassValue

  /**
   * The validation errors container.
   */
  errors: ClassValue

  /**
   * An individual validation error.
   */
  error: ClassValue

  /**
   * The info messages container.
   */
  messages: ClassValue

  /**
   * An individual info message.
   */
  message: ClassValue
}

/**
 * Augmentable public API surface for VfLayout.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `LayoutExpose` for all element-layout-based components)
 * so they appear on `ContextOf<'VfLayout'>` / `context$` / `defineExpose`.
 */
export interface VfLayoutExpose extends LayoutExpose {}

/**
 * Public context for VfLayout.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfLayoutContext extends DefineElementContext<
  VfLayoutProps,
  VfLayoutEmits,
  VfLayoutSlots,
  VfLayoutParts,
  VfLayoutClasses,
  VfLayoutExpose,
  LayoutApi
> {}

/**
 * Registry entry for VfLayout. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfLayout has no prop-driven generics.
 */
export interface VfLayoutEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfLayoutProps,
  VfLayoutEmits,
  VfLayoutSlots,
  VfLayoutParts,
  VfLayoutClasses,
  VfLayoutContext
> {}
