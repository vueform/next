import type {
  WidenProps,
  ChoicesAriaBag,
  ClassValue,
  DefineElementContext,
  DefineRegistryEntry,
  DomAttrsOf,
  LayoutRegionBindings,
  ResolvedBindings,
  PartOf,
  ResolvedGroup,
} from '@vueform/core'
import type { VNode } from 'vue'

import type {
  CheckboxGroupApi,
  CheckboxGroupBindings,
  CheckboxGroupClasses,
  CheckboxGroupEmits,
  CheckboxGroupExpose,
  CheckboxGroupParts,
  CheckboxGroupProps,
  CheckboxGroupSlots,
} from '#src/blueprints/checkbox-group'
import type { VfCheckboxSlots } from '#src/components/VfCheckbox/types'
import type {
  EntryOptionsOf,
  EntryOptionValueKeyOf,
  EntryOptionValueReturnOf,
  EntryOptionGroupChildrenOf,
  OptionGroupChildrenProp,
  ResolvedOption,
  OptionsProp,
  OptionValueProp,
  OptionValueOf,
  RawOptionOf,
} from '#src/features/options'

/**
 * Resolved per-part binding bags for VfCheckboxGroup slot scopes.
 */
type VfCheckboxGroupResolvedBindings = ResolvedBindings<
  VfCheckboxGroupParts,
  VfCheckboxGroupBindings
>

/**
 * VfCheckboxGroup props narrowed from a registry `TEntry` payload, applying the
 * entry's `options` / `optionValue` / `optionGroupChildren` props as generics.
 */
export type EntryProps<TEntry> = VfCheckboxGroupProps<
  EntryOptionsOf<TEntry>,
  EntryOptionValueKeyOf<TEntry>,
  EntryOptionGroupChildrenOf<TEntry>,
  any,
  EntryOptionValueReturnOf<TEntry>
>

/**
 * Generic props interface for the VfCheckboxGroup component, parameterized by
 * the option-driving type arguments (e.g. `VfCheckboxGroupProps<typeof options,
 * 'id'>`). Reach for `VfCheckboxGroupProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfCheckboxGroupProps<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends CheckboxGroupProps<
  'checkbox-group',
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TModel,
  TOptionValueReturn,
  VfCheckboxGroupSlots<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TModel,
    TOptionValueReturn
  >,
  VfCheckboxGroupParts,
  VfCheckboxGroupClasses,
  VfCheckboxGroupContext<
    VfCheckboxGroupProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {}

/**
 * Events emitted by the VfCheckboxGroup component, parameterized by the
 * option-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfCheckboxGroupSlots`. Plain usage
 * (`VfCheckboxGroupEmits`) keeps the context wide.
 */
export interface VfCheckboxGroupEmits<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends CheckboxGroupEmits<
  VfCheckboxGroupContext<
    VfCheckboxGroupProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {}

/**
 * Slots available in the VfCheckboxGroup component.
 */
export interface VfCheckboxGroupSlots<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends CheckboxGroupSlots<
  VfCheckboxGroupContext<
    VfCheckboxGroupProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
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
    items: ResolvedOption<
      OptionValueOf<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        TOptionValueReturn
      >,
      RawOptionOf<TOptions, TGroupChildren>
    >[]

    /**
     * Resolved checkbox groups.
     */
    groups: ResolvedGroup<
      OptionValueOf<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        TOptionValueReturn
      >,
      RawOptionOf<TOptions, TGroupChildren>
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
      OptionValueOf<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        TOptionValueReturn
      >,
      RawOptionOf<TOptions, TGroupChildren>
    >

    /**
     * The group fieldset's resolved bindings (part overrides for this group's
     * fieldset element); apply with `v-bind`.
     */
    bindings: VfCheckboxGroupResolvedBindings['group']
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
    item: ResolvedOption<
      OptionValueOf<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        TOptionValueReturn
      >,
      RawOptionOf<TOptions, TGroupChildren>
    >

    /**
     * The item's resolved bindings (part overrides for this item's VfCheckbox
     * child); apply with `v-bind`.
     */
    bindings: VfCheckboxGroupResolvedBindings['item']
  }) => VNode[]

  /**
   * Slot that replaces each individual checkbox input rendering.
   *
   * Child checkboxes always use the default `true` / `false` values; the
   * holder's item value is resolved by name, not passed as `trueValue`.
   *
   * @inherits VfCheckbox.default
   */
  checkbox: (scope: Parameters<VfCheckboxSlots['default']>[0]) => VNode[]

  /**
   * Slot that replaces the text/label of each individual checkbox.
   *
   * @inherits VfCheckbox.text
   */
  text: (scope: Parameters<VfCheckboxSlots['text']>[0]) => VNode[]
}

/**
 * Structural parts of the VfCheckboxGroup component.
 */
export interface VfCheckboxGroupParts extends CheckboxGroupParts {
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
   * @param item The checkbox item data.
   * @tag VfCheckbox
   */
  item: (item: Record<string, any>) => PartOf<'VfCheckbox'>
}

/**
 * CSS classes for the VfCheckboxGroup component's structural parts.
 */
export interface VfCheckboxGroupClasses extends CheckboxGroupClasses {
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
 * Part-keyed binding definitions of the VfCheckboxGroup component: its own
 * state markers merged with the `choicesAria` pattern entries it registers via
 * `useBindings`. Zero-argument resolver entries resolve at each part's
 * consuming site and their keys stay static; the per-group/per-item entries
 * are parameterized, so their keys are functional.
 */
export interface VfCheckboxGroupBindings
  extends CheckboxGroupBindings, LayoutRegionBindings {
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
 * Augmentable public API surface for VfCheckboxGroup.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `CheckboxGroupExpose` for all checkbox-group-based
 * components) so they appear on `ContextOf<'VfCheckboxGroup'>` / `context$` /
 * `defineExpose`.
 */
export interface VfCheckboxGroupExpose extends CheckboxGroupExpose {}

/**
 * Public context for VfCheckboxGroup, optionally parameterized by concrete
 * props (e.g. `VfCheckboxGroupContext<VfCheckboxGroupProps<typeof options,
 * 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfCheckboxGroupContext<
  TProps extends WidenProps<
    VfCheckboxGroupProps,
    CheckboxGroupProps<
      string,
      OptionsProp,
      OptionValueProp,
      OptionGroupChildrenProp
    >
  > = VfCheckboxGroupProps,
> extends DefineElementContext<
  TProps,
  VfCheckboxGroupEmits,
  VfCheckboxGroupSlots,
  VfCheckboxGroupParts,
  VfCheckboxGroupClasses,
  VfCheckboxGroupBindings,
  VfCheckboxGroupExpose,
  CheckboxGroupApi<TProps>
> {}

/**
 * Registry entry for VfCheckboxGroup. `TEntry` narrows the props / emits /
 * context by the entry's option-driving props, the same way SFC generics do.
 */
export interface VfCheckboxGroupEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfCheckboxGroupEmits<
    EntryOptionsOf<TEntry>,
    EntryOptionValueKeyOf<TEntry>,
    EntryOptionGroupChildrenOf<TEntry>,
    any,
    EntryOptionValueReturnOf<TEntry>
  >,
  VfCheckboxGroupSlots,
  VfCheckboxGroupParts,
  VfCheckboxGroupClasses,
  VfCheckboxGroupContext<EntryProps<TEntry>>
> {}
