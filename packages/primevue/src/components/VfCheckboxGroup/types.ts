import type {
  WidenProps,
  ClassValue,
  DefineElementContext,
  DefineRegistryEntry,
  DomAttrsOf,
  PartOf,
  ResolvedGroup,
} from '@vueform/core'
import type { VNode } from 'vue'

import type {
  CheckboxGroupApi,
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
    items: ResolvedOption<
      OptionValueOf<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        TOptionValueReturn
      >,
      RawOptionOf<TOptions, TGroupChildren>
    >[]
    groups: ResolvedGroup<
      OptionValueOf<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        TOptionValueReturn
      >,
      RawOptionOf<TOptions, TGroupChildren>
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
      OptionValueOf<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        TOptionValueReturn
      >,
      RawOptionOf<TOptions, TGroupChildren>
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
    item: ResolvedOption<
      OptionValueOf<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        TOptionValueReturn
      >,
      RawOptionOf<TOptions, TGroupChildren>
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
  checkbox: (props: Parameters<VfCheckboxSlots['default']>[0]) => VNode[]

  /**
   * Slot that replaces the text/label of each individual checkbox.
   *
   * @inherits VfCheckbox.text
   */
  text: (props: Parameters<VfCheckboxSlots['text']>[0]) => VNode[]
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
  group: ClassValue
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
