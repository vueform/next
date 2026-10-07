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
  RadioButtonGroupApi,
  RadioButtonGroupClasses,
  RadioButtonGroupEmits,
  RadioButtonGroupExpose,
  RadioButtonGroupParts,
  RadioButtonGroupProps,
  RadioButtonGroupSlots,
} from '#src/blueprints/radio-button-group'
import type { VfRadioButtonSlots } from '#src/components/VfRadioButton/types'
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
 * VfRadioButtonGroup props narrowed from a registry `TEntry` payload, applying
 * the entry's `options` / `optionValue` / `optionGroupChildren` props as
 * generics.
 */
export type EntryProps<TEntry> = VfRadioButtonGroupProps<
  EntryOptionsOf<TEntry>,
  EntryOptionValueKeyOf<TEntry>,
  EntryOptionGroupChildrenOf<TEntry>,
  any,
  EntryOptionValueReturnOf<TEntry>
>

/**
 * Generic props interface for the VfRadioButtonGroup component, parameterized
 * by the option-driving type arguments (e.g. `VfRadioButtonGroupProps<typeof
 * options, 'id'>`). Reach for `VfRadioButtonGroupProps` instead when no
 * narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfRadioButtonGroupProps<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends RadioButtonGroupProps<
  'radio-button-group',
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TModel,
  TOptionValueReturn,
  VfRadioButtonGroupSlots<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TModel,
    TOptionValueReturn
  >,
  VfRadioButtonGroupParts,
  VfRadioButtonGroupClasses,
  VfRadioButtonGroupContext<
    VfRadioButtonGroupProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {}

/**
 * Events emitted by the VfRadioButtonGroup component, parameterized by the
 * option-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfRadioButtonGroupSlots`. Plain usage
 * (`VfRadioButtonGroupEmits`) keeps the context wide.
 */
export interface VfRadioButtonGroupEmits<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends RadioButtonGroupEmits<
  VfRadioButtonGroupContext<
    VfRadioButtonGroupProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {}

/**
 * Slots available in the VfRadioButtonGroup component.
 */
export interface VfRadioButtonGroupSlots<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
  TValue = OptionValueOf<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TOptionValueReturn
  >,
  TRaw = RawOptionOf<TOptions, TGroupChildren>,
> extends RadioButtonGroupSlots<
  VfRadioButtonGroupContext<
    VfRadioButtonGroupProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {
  /**
   * Slot that replaces the default radio buttons rendering. Receives resolved
   * items, groups, and shared state.
   */
  default: (props: {
    radioName: string
    disabled: boolean
    label: string | undefined
    items: ResolvedOption<TValue, TRaw>[]
    groups: ResolvedGroup<TValue, TRaw>[]
    grouped: boolean
  }) => VNode[]

  /**
   * Slot that replaces each option group when items are grouped.
   */
  group: (props: {
    radioName: string
    disabled: boolean
    label: string | undefined
    group: ResolvedGroup<TValue, TRaw>
  }) => VNode[]

  /**
   * Slot that replaces each entire `VfRadioButton` child. Receives the resolved
   * item and shared state.
   */
  item: (props: {
    radioName: string
    disabled: boolean
    label: string | undefined
    item: ResolvedOption<TValue, TRaw>
  }) => VNode[]

  /**
   * Slot that replaces each individual radio button input rendering inside the
   * default `VfRadioButton` child.
   *
   * Child radios always use the default `true` radio value; the holder's item
   * value is resolved by name, not passed as `value`.
   *
   * @inherits VfRadioButton.default
   */
  radio: (props: Parameters<VfRadioButtonSlots['default']>[0]) => VNode[]

  /**
   * Slot that replaces the text/label of each individual radio button.
   *
   * @inherits VfRadioButton.text
   */
  text: (props: Parameters<VfRadioButtonSlots['text']>[0]) => VNode[]
}

/**
 * Structural parts of the VfRadioButtonGroup component.
 */
export interface VfRadioButtonGroupParts extends RadioButtonGroupParts {
  /**
   * The wrapper element containing all radio button items.
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
   * Props factory for each VfRadioButton child component, receiving the item
   * data.
   *
   * @param item The radio button item data.
   * @tag VfRadioButton
   */
  item: (item: Record<string, any>) => PartOf<'VfRadioButton'>
}

/**
 * CSS classes for the VfRadioButtonGroup component's structural parts.
 */
export interface VfRadioButtonGroupClasses extends RadioButtonGroupClasses {
  /**
   * The wrapper element containing all radio button items.
   */
  group: ClassValue
}

/**
 * Augmentable public API surface for VfRadioButtonGroup.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `RadioButtonGroupExpose` for all radio-button-group-based
 * components) so they appear on `ContextOf<'VfRadioButtonGroup'>` / `context$`
 * / `defineExpose`.
 */
export interface VfRadioButtonGroupExpose extends RadioButtonGroupExpose {}

/**
 * Public context for VfRadioButtonGroup, optionally parameterized by concrete
 * props (e.g. `VfRadioButtonGroupContext<VfRadioButtonGroupProps<typeof
 * options, 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfRadioButtonGroupContext<
  TProps extends WidenProps<
    VfRadioButtonGroupProps,
    RadioButtonGroupProps<
      string,
      OptionsProp,
      OptionValueProp,
      OptionGroupChildrenProp
    >
  > = VfRadioButtonGroupProps,
> extends DefineElementContext<
  TProps,
  VfRadioButtonGroupEmits,
  VfRadioButtonGroupSlots,
  VfRadioButtonGroupParts,
  VfRadioButtonGroupClasses,
  VfRadioButtonGroupExpose,
  RadioButtonGroupApi<TProps>
> {}

/**
 * Registry entry for VfRadioButtonGroup. `TEntry` narrows the props / emits /
 * context by the entry's option-driving props, the same way SFC generics do.
 */
export interface VfRadioButtonGroupEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfRadioButtonGroupEmits<
    EntryOptionsOf<TEntry>,
    EntryOptionValueKeyOf<TEntry>,
    EntryOptionGroupChildrenOf<TEntry>,
    any,
    EntryOptionValueReturnOf<TEntry>
  >,
  VfRadioButtonGroupSlots,
  VfRadioButtonGroupParts,
  VfRadioButtonGroupClasses,
  VfRadioButtonGroupContext<EntryProps<TEntry>>
> {}
