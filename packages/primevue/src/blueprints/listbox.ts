import {
  defineDefaults,
  useFeatures,
  makeElement,
  makeLayout,
  makeInteraction,
  makeDisabled,
  makeData,
  makeInput,
  makeProvider,
  makeForwards,
  type BaseElementClasses,
  type BaseElementEmits,
  type BaseElementExpose,
  type BaseElementBindings,
  type BaseFieldElementParts,
  type BaseElementProps,
  type BaseElementSlots,
  type DefineEvents,
  type LooseRequired,
  type ExpressionProps,
  type ValidationProps,
  type DisabledProps,
  type LoadingProps,
  type LayoutProps,
  type ModelEmits,
  type InteractionEmits,
  type InputEmits,
  type ValidationEmits,
  type MultipleProps,
  aliasProps,
  makeItems,
} from '@vueform/core'
import type {
  ListboxProps as AListboxProps,
  ListboxEmitsOptions as AListboxEmits,
  ListboxChangeEvent,
} from 'primevue/listbox'

import {
  makeInfo,
  type ModelPropsWithDefaultValue,
  type OptionGroupChildrenProp,
  type InfoProps,
  type OptionsProps,
  type OptionsModelProp,
  type OptionValueProp,
  type OptionsProp,
  type OptionsModelApi,
} from '#src/features'
import { optionItemAliases } from '#src/helpers'
import type { ForwardedEmits } from '#src/types'

/**
 * Plain props type for the listbox element blueprint — the widest instantiation
 * of `ListboxProps`. Use this whenever "the props of a listbox" is meant
 * without generic narrowing; it also serves as the constraint for `blueprint` /
 * `ListboxApi` type parameters.
 */
type LooseListboxProps = ListboxProps<
  string,
  OptionsProp,
  OptionValueProp,
  OptionGroupChildrenProp,
  boolean
>

/**
 * Generic props interface for the listbox element blueprint, parameterized by
 * the option-driving type arguments. Reach for `LooseListboxProps` instead when
 * no narrowing is needed.
 */
export interface ListboxProps<
  T extends string = 'listbox',
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
  S = ListboxSlots,
  P = ListboxParts,
  C = ListboxClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<
      OptionsModelProp<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        TMultiple,
        TModel,
        TOptionValueReturn
      >,
      TContext
    >,
    ValidationProps<TContext>,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    MultipleProps<TMultiple>,
    InfoProps,
    OptionsProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TOptionValueReturn,
      TContext
    >,
    /* @vue-ignore */ Omit<
      AListboxProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'fluid'
      | 'formControl'
      | 'disabled'
      | 'multiple'
      | 'options'
      | 'optionLabel'
      | 'optionValue'
      | 'optionDisabled'
      | 'optionGroupLabel'
      | 'optionGroupChildren'
    > {}

/**
 * Events emitted by the listbox element.
 */
export interface ListboxEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<ListboxChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AListboxEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the listbox element blueprint.
 */
export interface ListboxSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the listbox element blueprint.
 */
export interface ListboxParts extends BaseFieldElementParts {}

/**
 * CSS classes for the listbox element blueprint.
 */
export interface ListboxClasses extends BaseElementClasses {}

/**
 * Part-keyed attribute bindings of the listbox element blueprint, extended by
 * the consuming component via `useBindings`.
 */
export interface ListboxBindings extends BaseElementBindings {}

/**
 * Augmentable public API surface for listbox-based components.
 */
export interface ListboxExpose extends BaseElementExpose, ListboxApi {}

/**
 * Factory API produced by the listbox blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `ListboxApi<VfListboxProps<typeof options, 'id'>>`). Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose / Context
 * layers, extensions).
 */
export type ListboxApi<TProps extends LooseListboxProps = LooseListboxProps> =
  OptionsModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue Listbox events and slots to forward from the Vueform adapter to the
 * underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change', 'filter', 'option-dblclick', 'item-dblclick'],
  slots: [
    'header',
    'footer',
    'option',
    'optiongroup',
    'emptyfilter',
    'empty',
    'content',
    'loader',
    'filtericon',
  ],
} as const

/**
 * Builds the listbox factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`. Passing `blueprint` as a value lets call-site
 * inference instantiate the API at the SFC's concrete props — the only
 * alternative to a per-blueprint wrapper hosting `typeof blueprint<TProps>`,
 * since conditional-type inference on a captured factory erases its type
 * parameters to constraints (verified empirically).
 */
export function blueprint<TProps extends LooseListboxProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<ListboxEmits>
) {
  return useFeatures(
    aliasProps(props, {
      default: 'defaultValue',
      ...optionItemAliases,
    }),
    events
  )
    .use(makeElement())
    .use(makeLayout())
    .use(makeInteraction())
    .use(makeDisabled())
    .use(makeData())
    .use(makeInput())
    .use(makeItems())
    .use(makeInfo())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()
}

/**
 * Default prop values for the listbox blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<ListboxProps>()({
  type: 'listbox',
  layout: true,
  multiple: false,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
