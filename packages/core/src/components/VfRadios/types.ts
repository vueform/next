import type { VNode } from 'vue'

import type { ChoicesAriaBag, LayoutRegionBindings } from '#src/a11y'
import {
  type RadiosApi,
  type RadiosBindings,
  type RadiosClasses,
  type RadiosEmits,
  type RadiosExpose,
  type RadiosParts,
  type RadiosProps,
  type RadiosSlots,
} from '#src/blueprints/radios'
import type { VfRadioSlots } from '#src/components/VfRadio/types'
import type { ResolvedBindings } from '#src/composables'
import type {
  ResolvedGroup,
  ResolvedItem,
  ItemsProp,
  ItemValueProp,
  GroupChildrenProp,
  ItemValueOf,
  RawItemOf,
  EntryItemsOf,
  EntryItemValueKeyOf,
  EntryItemValueReturnOf,
  EntryGroupChildrenOf,
} from '#src/features'
import type {
  WidenProps,
  ClassValue,
  DefineElementContext,
  DefineRegistryEntry,
  DomAttrsOf,
  PartOf,
} from '#src/types'

/**
 * Resolved per-part binding bags for VfRadios slot scopes.
 */
type VfRadiosResolvedBindings = ResolvedBindings<
  VfRadiosParts,
  VfRadiosBindings
>

/**
 * VfRadios props narrowed from a registry `TEntry` payload, applying the
 * entry's `items` / `itemValue` / `groupChildren` props as generics.
 */
export type EntryProps<TEntry> = VfRadiosProps<
  EntryItemsOf<TEntry>,
  EntryItemValueKeyOf<TEntry>,
  EntryGroupChildrenOf<TEntry>,
  any,
  EntryItemValueReturnOf<TEntry>
>

/**
 * Generic props interface for the VfRadios component, parameterized by the
 * item-driving type arguments (e.g. `VfRadiosProps<typeof items, 'id'>`). Reach
 * for `VfRadiosProps` instead when no narrowing is needed.
 */
export interface VfRadiosProps<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
> extends RadiosProps<
  'radios',
  TItems,
  TItemValueKey,
  TGroupChildren,
  TModel,
  TItemValueReturn,
  VfRadiosSlots<
    TItems,
    TItemValueKey,
    TGroupChildren,
    TModel,
    TItemValueReturn
  >,
  VfRadiosParts,
  VfRadiosClasses,
  VfRadiosContext<
    VfRadiosProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >
> {}

/**
 * Events emitted by the VfRadios component, parameterized by the item-driving
 * type arguments so event handlers (e.g. `@change`) receive the narrowed
 * context — same pattern as `VfRadiosSlots`. Plain usage (`VfRadiosEmits`)
 * keeps the context wide.
 */
export interface VfRadiosEmits<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
> extends RadiosEmits<
  VfRadiosContext<
    VfRadiosProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >
> {}

/**
 * Slots available in the VfRadios component.
 */
export interface VfRadiosSlots<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
  TValue = ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
  TRaw = RawItemOf<TItems, TGroupChildren>,
> extends RadiosSlots<
  VfRadiosContext<
    VfRadiosProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >
> {
  /**
   * Slot that replaces the default radios rendering. Receives resolved items,
   * groups, and shared state.
   */
  default: (scope: {
    /**
     * The shared radio name attribute.
     */
    radioName: string

    /**
     * Whether the radios are disabled.
     */
    disabled: boolean

    /**
     * The element's resolved label.
     */
    label: string | undefined

    /**
     * Resolved flat radio items.
     */
    items: ResolvedItem<TValue, TRaw>[]

    /**
     * Resolved radio groups.
     */
    groups: ResolvedGroup<TValue, TRaw>[]

    /**
     * Whether items are rendered as groups.
     */
    grouped: boolean
  }) => VNode[]

  /**
   * Slot that replaces each option group when items are grouped.
   */
  group: (scope: {
    /**
     * The shared radio name attribute.
     */
    radioName: string

    /**
     * Whether the radios are disabled.
     */
    disabled: boolean

    /**
     * The element's resolved label.
     */
    label: string | undefined

    /**
     * The resolved option group.
     */
    group: ResolvedGroup<TValue, TRaw>

    /**
     * The group fieldset's resolved bindings (part overrides for this group's
     * fieldset element); apply with `v-bind`.
     */
    bindings: VfRadiosResolvedBindings['group']
  }) => VNode[]

  /**
   * Slot that replaces each entire `VfRadio` child. Receives the resolved item
   * and shared state.
   */
  item: (scope: {
    /**
     * The shared radio name attribute.
     */
    radioName: string

    /**
     * Whether the radios are disabled.
     */
    disabled: boolean

    /**
     * The element's resolved label.
     */
    label: string | undefined

    /**
     * The resolved radio item.
     */
    item: ResolvedItem<TValue, TRaw>

    /**
     * The item's resolved bindings (part overrides for this item's VfRadio
     * child); apply with `v-bind`.
     */
    bindings: VfRadiosResolvedBindings['item']
  }) => VNode[]

  /**
   * Slot that replaces each individual radio input rendering inside the default
   * `VfRadio` child.
   *
   * Child radios always use the default `true` radio value; the holder's item
   * value is resolved by name, not passed as `radioValue`.
   *
   * @inherits VfRadio.default
   */
  radio: (scope: Parameters<VfRadioSlots<true>['default']>[0]) => VNode[]

  /**
   * Slot that replaces the text/label of each individual radio.
   *
   * @inherits VfRadio.text
   */
  text: (scope: Parameters<VfRadioSlots['text']>[0]) => VNode[]
}

/**
 * Structural parts of the VfRadios component.
 */
export interface VfRadiosParts extends RadiosParts {
  /**
   * The wrapper element containing all radio items.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The fieldset element wrapping each group when items are grouped.
   *
   * @param group The group data.
   * @tag fieldset
   */
  group: (group: Record<string, any>) => DomAttrsOf<'fieldset'>

  /**
   * The legend element displaying the group label.
   *
   * @param group The group data.
   * @tag legend
   */
  groupLabel: (group: Record<string, any>) => DomAttrsOf<'legend'>

  /**
   * Props factory for each VfRadio child component, receiving the item data.
   *
   * @param item The radio item data.
   * @tag VfRadio
   */
  item: (item: Record<string, any>) => PartOf<'VfRadio'>
}

/**
 * CSS classes for the VfRadios component's structural parts.
 */
export interface VfRadiosClasses extends RadiosClasses {
  /**
   * The wrapper element containing all radio items.
   */
  wrapper: ClassValue

  /**
   * The fieldset element wrapping each group when items are grouped.
   *
   * @param group The group data.
   */
  group: (group: Record<string, any>) => ClassValue

  /**
   * The legend element displaying the group label.
   *
   * @param group The group data.
   */
  groupLabel: (group: Record<string, any>) => ClassValue

  /**
   * Each item's `VfRadio` child component.
   *
   * @param item The radio item data.
   */
  item: (item: Record<string, any>) => ClassValue
}

/**
 * Part-keyed binding definitions of the VfRadios component: its own state
 * markers merged with the `choicesAria` pattern entries it registers via
 * `useBindings`. Zero-argument resolver entries resolve at each part's
 * consuming site and their keys stay static; the per-group/per-item entries
 * are parameterized, so their keys are functional.
 */
export interface VfRadiosBindings extends RadiosBindings, LayoutRegionBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The group container's role, labelling, and ARIA state (from the
   * `choicesAria` pattern) merged with its layout markers (stacked row
   * layout, vertical alignment with adjacent form controls) and validation
   * state. A zero-argument resolver: it reads child-aggregating state
   * (`invalid`), which must resolve in the wrapper's own render effect.
   */
  wrapper: {
    'data-stacked'?: ''
    'data-aligned'?: ''
    'data-invalid'?: ''
  } & ChoicesAriaBag

  /**
   * Per-group binding resolver for the group fieldset — a mode marker: it
   * contributes no attributes of its own, it keys the part functional so
   * per-group part overrides resolve with the group data.
   *
   * @param group The group data.
   */
  group: (group: Record<string, any>) => {}

  /**
   * Per-group binding resolver for the group legend — a mode marker: it
   * contributes no attributes of its own, it keys the part functional so
   * per-group part overrides resolve with the group data.
   *
   * @param group The group data.
   */
  groupLabel: (group: Record<string, any>) => {}

  /**
   * Per-item binding resolver for each `VfRadio` child — a mode marker: it
   * contributes no attributes of its own, it keys the part functional so
   * per-item part overrides resolve with the item data.
   *
   * @param item The radio item data.
   */
  item: (item: Record<string, any>) => {}
}

/**
 * Augmentable public API surface for VfRadios.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `RadiosExpose` for all radios-based components) so they
 * appear on `ContextOf<'VfRadios'>` / `context$` / `defineExpose`.
 */
export interface VfRadiosExpose extends RadiosExpose {}

/**
 * Public context for VfRadios, optionally parameterized by concrete props (e.g.
 * `VfRadiosContext<VfRadiosProps<typeof items, 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfRadiosContext<
  TProps extends WidenProps<
    VfRadiosProps,
    RadiosProps<string, ItemsProp, ItemValueProp, GroupChildrenProp>
  > = VfRadiosProps,
> extends DefineElementContext<
  TProps,
  VfRadiosEmits,
  VfRadiosSlots,
  VfRadiosParts,
  VfRadiosClasses,
  VfRadiosBindings,
  VfRadiosExpose,
  RadiosApi<TProps>
> {}

/**
 * Registry entry for VfRadios. `TEntry` narrows the props / emits / context by
 * the entry's item-driving props, the same way SFC generics do.
 */
export interface VfRadiosEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfRadiosEmits<
    EntryItemsOf<TEntry>,
    EntryItemValueKeyOf<TEntry>,
    EntryGroupChildrenOf<TEntry>,
    any,
    EntryItemValueReturnOf<TEntry>
  >,
  VfRadiosSlots,
  VfRadiosParts,
  VfRadiosClasses,
  VfRadiosContext<EntryProps<TEntry>>
> {}
