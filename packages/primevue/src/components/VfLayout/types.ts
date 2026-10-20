import type {
  DOMAttrs,
  AddonsParts,
  AddonsSlots,
  IconsParts,
  IconsSlots,
  IconsClasses,
  AddonGroupClasses,
  TranslateParts,
  TranslateSlots,
  DefineElementContext,
  DefineRegistryEntry,
} from '@vueform/core'
import type { InputGroupProps } from 'primevue/inputgroup'
import type { InputGroupAddonProps } from 'primevue/inputgroupaddon'
import type { VNode } from 'vue'

import type {
  LayoutApi,
  LayoutEmits,
  LayoutProps,
  LayoutParts,
  LayoutSlots,
  LayoutExpose,
  LayoutBindings,
  LayoutClasses,
} from '#src/blueprints/layout'
import type {
  FloatLabelClasses,
  FloatLabelParts,
  FloatLabelSlots,
  IftaClasses,
  IftaParts,
  IftaSlots,
  TabbedClasses,
  TabbedParts,
  TabbedSlots,
} from '#src/features'

/**
 * Props for the VfLayout component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
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
  extends
    LayoutSlots<VfLayoutContext>,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    TranslateSlots,
    TabbedSlots {
  /**
   * Slot for the element's default content.
   */
  default: () => VNode[]
}

/**
 * Structural parts of the VfLayout component.
 */
export interface VfLayoutParts
  extends
    LayoutParts,
    FloatLabelParts,
    IftaParts,
    AddonsParts,
    IconsParts,
    TranslateParts,
    TabbedParts {
  /**
   * The PrimeVue InputGroup wrapping addons and the input.
   *
   * @tag InputGroup
   */
  addonGroup: InputGroupProps & DOMAttrs['div']

  /**
   * The PrimeVue InputGroupAddon wrapping the language selector.
   *
   * @tag InputGroupAddon
   */
  languageAddon: InputGroupAddonProps & DOMAttrs['div']
}

/**
 * CSS classes for the VfLayout component's structural parts.
 */
export interface VfLayoutClasses
  extends
    LayoutClasses,
    FloatLabelClasses,
    IftaClasses,
    IconsClasses,
    AddonGroupClasses,
    TabbedClasses {}

/**
 * Part-keyed attribute bindings of the VfLayout component, declared as the
 * RESOLVED bag shapes and extended by the component via `useBindings`.
 */
export interface VfLayoutBindings extends LayoutBindings {}

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
  VfLayoutBindings,
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
