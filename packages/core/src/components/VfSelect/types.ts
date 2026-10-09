import type { VNode } from 'vue'

import {
  type SelectApi,
  type SelectClasses,
  type SelectEmits,
  type SelectExpose,
  type SelectParts,
  type SelectProps,
  type SelectSlots,
} from '#src/blueprints/select'
import type {
  AddonsParts,
  AddonsSlots,
  IconsClasses,
  IconsParts,
  IconsSlots,
  AddonGroupClasses,
  ItemsProp,
  ItemValueProp,
  GroupChildrenProp,
  ItemValueOf,
  RawItemOf,
  ResolvedItem,
  EntryItemsOf,
  EntryItemValueKeyOf,
  EntryItemValueReturnOf,
  EntryGroupChildrenOf,
  EntryMultipleOf,
} from '#src/features'
import type {
  WidenProps,
  ClassValue,
  DefineElementContext,
  DefineRegistryEntry,
  DomAttrsOf,
} from '#src/types'

/**
 * VfSelect props narrowed from a registry `TEntry` payload, applying the
 * entry's `items` / `itemValue` / `groupChildren` / `multiple` props as
 * generics.
 */
export type EntryProps<TEntry> = VfSelectProps<
  EntryItemsOf<TEntry>,
  EntryItemValueKeyOf<TEntry>,
  EntryGroupChildrenOf<TEntry>,
  EntryMultipleOf<TEntry>,
  any,
  EntryItemValueReturnOf<TEntry>
>

/**
 * Generic props interface for the VfSelect component, parameterized by the
 * item-driving type arguments (e.g. `VfSelectProps<typeof items, 'id'>`). Reach
 * for `VfSelectProps` instead when no narrowing is needed.
 */
export interface VfSelectProps<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TItemValueReturn = unknown,
> extends SelectProps<
  'select',
  TItems,
  TItemValueKey,
  TGroupChildren,
  TMultiple,
  TModel,
  TItemValueReturn,
  VfSelectSlots<
    TItems,
    TItemValueKey,
    TGroupChildren,
    TMultiple,
    TModel,
    TItemValueReturn
  >,
  VfSelectParts,
  VfSelectClasses,
  VfSelectContext<
    VfSelectProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TMultiple,
      TModel,
      TItemValueReturn
    >
  >
> {}

/**
 * Events emitted by the VfSelect component, parameterized by the item-driving
 * type arguments so event handlers (e.g. `@change`) receive the narrowed
 * context — same pattern as `VfSelectSlots`. Plain usage (`VfSelectEmits`)
 * keeps the context wide.
 */
export interface VfSelectEmits<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TItemValueReturn = unknown,
> extends SelectEmits<
  VfSelectContext<
    VfSelectProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TMultiple,
      TModel,
      TItemValueReturn
    >
  >
> {}

/**
 * Slots available in the VfSelect component.
 */
export interface VfSelectSlots<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TItemValueReturn = unknown,
  TValue = ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
  TRaw = RawItemOf<TItems, TGroupChildren>,
>
  extends
    SelectSlots<
      VfSelectContext<
        VfSelectProps<
          TItems,
          TItemValueKey,
          TGroupChildren,
          TMultiple,
          TModel,
          TItemValueReturn
        >
      >
    >,
    AddonsSlots,
    IconsSlots {
  /**
   * Slot that replaces the label of each native option.
   *
   * @param scope The option slot's params.
   */
  option: (scope: {
    /**
     * The resolved option item.
     */
    item: ResolvedItem<TValue, TRaw>
  }) => VNode[]
}

/**
 * Structural parts of the VfSelect component.
 */
export interface VfSelectParts extends SelectParts, AddonsParts, IconsParts {
  /**
   * The addon group wrapper element.
   *
   * @tag div
   */
  addonGroup: DomAttrsOf<'div'>

  /**
   * The select input element.
   *
   * @tag select
   */
  input: DomAttrsOf<'select'>
}

/**
 * CSS classes for the VfSelect component's structural parts.
 */
export interface VfSelectClasses
  extends SelectClasses, AddonGroupClasses, IconsClasses {
  /**
   * The select input element.
   */
  input: ClassValue
}

/**
 * Augmentable public API surface for VfSelect.
 */
export interface VfSelectExpose extends SelectExpose {}

/**
 * Public context for VfSelect, optionally parameterized by concrete props (e.g.
 * `VfSelectContext<VfSelectProps<typeof items, 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfSelectContext<
  TProps extends WidenProps<
    VfSelectProps,
    SelectProps<string, ItemsProp, ItemValueProp, GroupChildrenProp>
  > = VfSelectProps,
> extends DefineElementContext<
  TProps,
  VfSelectEmits,
  VfSelectSlots,
  VfSelectParts,
  VfSelectClasses,
  VfSelectExpose,
  SelectApi<TProps>
> {}

/**
 * Registry entry for VfSelect. `TEntry` narrows the props / emits / context by
 * the entry's item-driving props, the same way SFC generics do.
 */
export interface VfSelectEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfSelectEmits<
    EntryItemsOf<TEntry>,
    EntryItemValueKeyOf<TEntry>,
    EntryGroupChildrenOf<TEntry>,
    EntryMultipleOf<TEntry>,
    any,
    EntryItemValueReturnOf<TEntry>
  >,
  VfSelectSlots,
  VfSelectParts,
  VfSelectClasses,
  VfSelectContext<EntryProps<TEntry>>
> {}
