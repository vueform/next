import type { VNode } from 'vue'

import type { ChoicesAriaBag, LayoutRegionBindings } from '#src/a11y'
import {
  type CheckboxesApi,
  type CheckboxesBindings,
  type CheckboxesClasses,
  type CheckboxesEmits,
  type CheckboxesExpose,
  type CheckboxesParts,
  type CheckboxesProps,
  type CheckboxesSlots,
} from '#src/blueprints/checkboxes'
import type { VfCheckboxSlots } from '#src/components/VfCheckbox/types'
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
 * Resolved per-part binding bags for VfCheckboxes slot scopes.
 */
type VfCheckboxesResolvedBindings = ResolvedBindings<
  VfCheckboxesParts,
  VfCheckboxesBindings
>

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
     * The group fieldset's resolved bindings (part overrides for this group's
     * fieldset element); apply with `v-bind`.
     */
    bindings: VfCheckboxesResolvedBindings['group']
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
     * The item's resolved bindings (part overrides for this item's VfCheckbox
     * child); apply with `v-bind`.
     */
    bindings: VfCheckboxesResolvedBindings['item']
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
   * Each item's `VfCheckbox` child component.
   *
   * @param item The checkbox item data.
   */
  item: (item: Record<string, any>) => ClassValue
}

/**
 * Part-keyed binding definitions of the VfCheckboxes component: its own state
 * markers merged with the `choicesAria` pattern entries it registers via
 * `useBindings`. Zero-argument resolver entries resolve at each part's
 * consuming site and their keys stay static; the per-group/per-item entries
 * are parameterized, so their keys are functional.
 */
export interface VfCheckboxesBindings
  extends CheckboxesBindings, LayoutRegionBindings {
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
   * Per-item binding resolver for each `VfCheckbox` child — a mode marker: it
   * contributes no attributes of its own, it keys the part functional so
   * per-item part overrides resolve with the item data.
   *
   * @param item The checkbox item data.
   */
  item: (item: Record<string, any>) => {}
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
  VfCheckboxesBindings,
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
