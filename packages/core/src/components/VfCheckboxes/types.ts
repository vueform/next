import type { VNode } from 'vue'

import {
  type CheckboxesA11y,
  type CheckboxesApi,
  type CheckboxesClasses,
  type CheckboxesEmits,
  type CheckboxesExpose,
  type CheckboxesModifiers,
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
   * @param scope The default slot's params.
   */
  default: (scope: {
    /**
     * The shared checkbox name attribute.
     */
    checkboxName: string

    /**
     * Whether the checkboxes are disabled.
     */
    disabled: boolean

    /**
     * The element's resolved label.
     */
    label: string | undefined

    /**
     * Resolved flat checkbox items.
     */
    items: ResolvedItem<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >[]

    /**
     * Resolved checkbox groups.
     */
    groups: ResolvedGroup<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >[]

    /**
     * Whether items are rendered as groups.
     */
    grouped: boolean

    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfCheckboxesClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfCheckboxesParts>

    /**
     * The component's styling modifiers, keyed by part name; apply each bag
     * with `v-bind`.
     */
    modifiers: VfCheckboxesModifiers

    /**
     * The component's part-keyed accessibility bindings.
     */
    a11yBindings: VfCheckboxesA11y
  }) => VNode[]

  /**
   * Slot that replaces each option group when items are grouped.
   *
   * @param scope The group slot's params.
   */
  group: (scope: {
    /**
     * The shared checkbox name attribute.
     */
    checkboxName: string

    /**
     * Whether the checkboxes are disabled.
     */
    disabled: boolean

    /**
     * The element's resolved label.
     */
    label: string | undefined

    /**
     * The resolved option group.
     */
    group: ResolvedGroup<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >

    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfCheckboxesClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfCheckboxesParts>

    /**
     * The component's styling modifiers, keyed by part name; apply each bag
     * with `v-bind`.
     */
    modifiers: VfCheckboxesModifiers

    /**
     * The component's part-keyed accessibility bindings.
     */
    a11yBindings: VfCheckboxesA11y
  }) => VNode[]

  /**
   * Slot that replaces each entire `VfCheckbox` child.
   *
   * @param scope The item slot's params.
   */
  item: (scope: {
    /**
     * The shared checkbox name attribute.
     */
    checkboxName: string

    /**
     * Whether the checkboxes are disabled.
     */
    disabled: boolean

    /**
     * The element's resolved label.
     */
    label: string | undefined

    /**
     * The resolved checkbox item.
     */
    item: ResolvedItem<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >

    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfCheckboxesClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfCheckboxesParts>
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
    scope: Parameters<VfCheckboxSlots<true, false>['default']>[0]
  ) => VNode[]

  /**
   * Slot that replaces the text/label of each individual checkbox.
   *
   * @inherits VfCheckbox.text
   */
  text: (scope: Parameters<VfCheckboxSlots['text']>[0]) => VNode[]
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
 * Accessibility bindings of the VfCheckboxes component.
 */
export interface VfCheckboxesA11y extends CheckboxesA11y {}

/**
 * Styling modifiers of the VfCheckboxes component.
 */
export interface VfCheckboxesModifiers extends CheckboxesModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The group container's layout markers (stacked row layout, vertical
   * alignment with adjacent form controls) and validation state.
   */
  group: {
    'data-stacked'?: ''
    'data-aligned'?: ''
    'data-invalid'?: ''
  }
}

/**
 * Augmentable public API surface for VfCheckboxes.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `CheckboxesExpose` for all checkboxes-based components)
 * so they appear on `ContextOf<'VfCheckboxes'>` / `context$` / `defineExpose`.
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
  VfCheckboxesModifiers,
  VfCheckboxesA11y,
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
