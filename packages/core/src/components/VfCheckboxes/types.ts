import type { VNode } from 'vue'

import {
  type CheckboxesApi,
  type CheckboxesClasses,
  type CheckboxesEmits,
  type CheckboxesExpose,
  type CheckboxesParts,
  type CheckboxesProps,
  type CheckboxesSlots,
} from '#src/blueprints/checkboxes'
import type { VfCheckboxSlots } from '#src/components/VfCheckbox/types'
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
 * VfCheckboxes props narrowed from a registry `TEntry` payload, applying the
 * entry's `items` / `itemValue` / `groupChildren` props as generics.
 */
export type EntryProps<TEntry> = VfCheckboxesProps<
  EntryItemsOf<TEntry>,
  EntryItemValueKeyOf<TEntry>,
  EntryGroupChildrenOf<TEntry>,
  any,
  EntryItemValueReturnOf<TEntry>
>

/**
 * Generic props interface for the VfCheckboxes component, parameterized by the
 * item-driving type arguments (e.g. `VfCheckboxesProps<typeof items, 'id'>`).
 * Reach for `VfCheckboxesProps` instead when no narrowing is needed.
 */
export interface VfCheckboxesProps<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
> extends CheckboxesProps<
  'checkboxes',
  TItems,
  TItemValueKey,
  TGroupChildren,
  TModel,
  TItemValueReturn,
  VfCheckboxesSlots<
    TItems,
    TItemValueKey,
    TGroupChildren,
    TModel,
    TItemValueReturn
  >,
  VfCheckboxesParts,
  VfCheckboxesClasses,
  VfCheckboxesContext<
    VfCheckboxesProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >
> {}

/**
 * Events emitted by the VfCheckboxes component, parameterized by the
 * item-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfCheckboxesSlots`. Plain usage
 * (`VfCheckboxesEmits`) keeps the context wide.
 */
export interface VfCheckboxesEmits<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
> extends CheckboxesEmits<
  VfCheckboxesContext<
    VfCheckboxesProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >
> {}

/**
 * Slots available in the VfCheckboxes component.
 */
export interface VfCheckboxesSlots<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
> extends CheckboxesSlots<
  VfCheckboxesContext<
    VfCheckboxesProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >
> {
  /**
   * Slot that replaces the default checkboxes rendering.
   *
   * @param props.checkboxName The shared checkbox name attribute.
   * @param props.disabled Whether the checkboxes are disabled.
   * @param props.label The element's resolved label.
   * @param props.items Resolved flat checkbox items.
   * @param props.groups Resolved checkbox groups.
   * @param props.grouped Whether items are rendered as groups.
   */
  default: (props: {
    checkboxName: string
    disabled: boolean
    label: string | undefined
    items: ResolvedItem<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >[]
    groups: ResolvedGroup<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >[]
    grouped: boolean
  }) => VNode[]

  /**
   * Slot that replaces each option group when items are grouped.
   *
   * @param props.checkboxName The shared checkbox name attribute.
   * @param props.disabled Whether the checkboxes are disabled.
   * @param props.label The element's resolved label.
   * @param props.group The resolved option group.
   */
  group: (props: {
    checkboxName: string
    disabled: boolean
    label: string | undefined
    group: ResolvedGroup<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >
  }) => VNode[]

  /**
   * Slot that replaces each entire `VfCheckbox` child.
   *
   * @param props.checkboxName The shared checkbox name attribute.
   * @param props.disabled Whether the checkboxes are disabled.
   * @param props.label The element's resolved label.
   * @param props.item The resolved checkbox item.
   */
  item: (props: {
    checkboxName: string
    disabled: boolean
    label: string | undefined
    item: ResolvedItem<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >
  }) => VNode[]

  /**
   * Slot that replaces each individual checkbox input rendering.
   *
   * Child checkboxes always use the default `true` / `false` values; the
   * holder's item value is resolved by name, not passed as `trueValue`.
   *
   * @inherits VfCheckbox.default
   */
  checkbox: (
    props: Parameters<VfCheckboxSlots<true, false>['default']>[0]
  ) => VNode[]

  /**
   * Slot that replaces the text/label of each individual checkbox.
   *
   * @inherits VfCheckbox.text
   */
  text: (props: Parameters<VfCheckboxSlots['text']>[0]) => VNode[]
}

/**
 * Structural parts of the VfCheckboxes component.
 */
export interface VfCheckboxesParts extends CheckboxesParts {
  /**
   * The wrapper element containing all checkbox items.
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
   * Props factory for each VfCheckbox child component, receiving the item data.
   *
   * @param items The checkbox item data.
   * @tag VfCheckbox
   */
  item: (items: Record<string, any>) => PartOf<'VfCheckbox'>
}

/**
 * CSS classes for the VfCheckboxes component's structural parts.
 */
export interface VfCheckboxesClasses extends CheckboxesClasses {
  /**
   * The wrapper element containing all checkbox items.
   */
  group: ClassValue
}

/**
 * Augmentable public API surface for VfCheckboxes.
 */
export interface VfCheckboxesExpose extends CheckboxesExpose {}

/**
 * Public context for VfCheckboxes, optionally parameterized by concrete props
 * (e.g. `VfCheckboxesContext<VfCheckboxesProps<typeof items, 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfCheckboxesContext<
  TProps extends WidenProps<
    VfCheckboxesProps,
    CheckboxesProps<string, ItemsProp, ItemValueProp, GroupChildrenProp>
  > = VfCheckboxesProps,
> extends DefineElementContext<
  TProps,
  VfCheckboxesEmits,
  VfCheckboxesSlots,
  VfCheckboxesParts,
  VfCheckboxesClasses,
  VfCheckboxesExpose,
  CheckboxesApi<TProps>
> {}

/**
 * Registry entry for VfCheckboxes. `TEntry` narrows the props / emits / context
 * by the entry's item-driving props, the same way SFC generics do.
 */
export interface VfCheckboxesEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfCheckboxesEmits<
    EntryItemsOf<TEntry>,
    EntryItemValueKeyOf<TEntry>,
    EntryGroupChildrenOf<TEntry>,
    any,
    EntryItemValueReturnOf<TEntry>
  >,
  VfCheckboxesSlots,
  VfCheckboxesParts,
  VfCheckboxesClasses,
  VfCheckboxesContext<EntryProps<TEntry>>
> {}
