import type { VNode } from 'vue'

import {
  type RadiosApi,
  type RadiosClasses,
  type RadiosEmits,
  type RadiosExpose,
  type RadiosParts,
  type RadiosProps,
  type RadiosSlots,
} from '#src/blueprints/radios'
import type { VfRadioSlots } from '#src/components/VfRadio/types'
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
    radioName: string
    disabled: boolean
    label: string | undefined
    items: ResolvedItem<TValue, TRaw>[]
    groups: ResolvedGroup<TValue, TRaw>[]
    grouped: boolean
  }) => VNode[]

  /**
   * Slot that replaces each option group when items are grouped.
   */
  group: (scope: {
    radioName: string
    disabled: boolean
    label: string | undefined
    group: ResolvedGroup<TValue, TRaw>
  }) => VNode[]

  /**
   * Slot that replaces each entire `VfRadio` child. Receives the resolved item
   * and shared state.
   */
  item: (scope: {
    radioName: string
    disabled: boolean
    label: string | undefined
    item: ResolvedItem<TValue, TRaw>
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
  group: DomAttrsOf<'div'>

  /**
   * The fieldset element wrapping each group when items are grouped.
   *
   * @param group The group data.
   * @tag fieldset
   */
  fieldset: (group: Record<string, any>) => DomAttrsOf<'fieldset'>

  /**
   * The legend element displaying the group label.
   *
   * @param group The group data.
   * @tag legend
   */
  legend: (group: Record<string, any>) => DomAttrsOf<'legend'>

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
  group: ClassValue
}

/**
 * Augmentable public API surface for VfRadios.
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
