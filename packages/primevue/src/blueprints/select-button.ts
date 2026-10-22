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
  type AddonableProps,
  aliasProps,
  makeItems,
} from '@vueform/core'
import type {
  SelectButtonProps as ASelectButtonProps,
  SelectButtonEmitsOptions as ASelectButtonEmits,
  SelectButtonChangeEvent,
} from 'primevue/selectbutton'

import {
  makeInfo,
  type ModelPropsWithDefaultValue,
  type InfoProps,
  type OptionsProps,
  type OptionsModelProp,
  type OptionValueProp,
  type OptionsProp,
  type OptionsModelApi,
} from '#src/features'
import { flatOptionItemAliases } from '#src/helpers'
import type { ForwardedEmits } from '#src/types'

/**
 * Plain props type for the select-button element blueprint — the widest
 * instantiation of `SelectButtonProps`. Use this whenever "the props of a
 * select-button" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `SelectButtonApi` type parameters.
 */
type LooseSelectButtonProps = SelectButtonProps<
  string,
  OptionsProp,
  OptionValueProp,
  boolean
>

/**
 * Generic props interface for the select-button element blueprint,
 * parameterized by the option-driving type arguments. Reach for
 * `LooseSelectButtonProps` instead when no narrowing is needed. Groups are not
 * supported — `optionGroup*` props are omitted.
 */
export interface SelectButtonProps<
  T extends string = 'select-button',
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
  S = SelectButtonSlots,
  P = SelectButtonParts,
  C = SelectButtonClasses,
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
        undefined,
        TMultiple,
        TModel,
        TOptionValueReturn
      >,
      TContext
    >,
    ValidationProps<TContext>,
    AddonableProps,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    MultipleProps<TMultiple>,
    InfoProps,
    Omit<
      OptionsProps<
        TOptions,
        TOptionValueKey,
        undefined,
        TOptionValueReturn,
        TContext
      >,
      'optionGroupLabel' | 'optionGroupChildren' | 'optionGroupConditions'
    >,
    /* @vue-ignore */ Omit<
      ASelectButtonProps,
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
    > {}

/**
 * Events emitted by the select-button element.
 */
export interface SelectButtonEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<SelectButtonChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ASelectButtonEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the select-button element blueprint.
 */
export interface SelectButtonSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the select-button element blueprint.
 */
export interface SelectButtonParts extends BaseFieldElementParts {}

/**
 * CSS classes for the select-button element blueprint.
 */
export interface SelectButtonClasses extends BaseElementClasses {}

/**
 * Part-keyed attribute bindings of the select-button element blueprint,
 * extended by the consuming component via `useBindings`.
 */
export interface SelectButtonBindings extends BaseElementBindings {}

/**
 * Augmentable public API surface for select-button-based components.
 */
export interface SelectButtonExpose
  extends BaseElementExpose, SelectButtonApi {}

/**
 * Factory API produced by the select-button blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `SelectButtonApi<VfSelectButtonProps<typeof options, 'id'>>`). Prefer this
 * over `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose /
 * Context layers, extensions).
 */
export type SelectButtonApi<
  TProps extends LooseSelectButtonProps = LooseSelectButtonProps,
> = OptionsModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue SelectButton events and slots to forward from the Vueform adapter to
 * the underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change'],
  slots: ['option'],
} as const

/**
 * Builds the select-button factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`. Passing `blueprint` as a value lets call-site
 * inference instantiate the API at the SFC's concrete props — the only
 * alternative to a per-blueprint wrapper hosting `typeof blueprint<TProps>`,
 * since conditional-type inference on a captured factory erases its type
 * parameters to constraints (verified empirically).
 */
export function blueprint<TProps extends LooseSelectButtonProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<SelectButtonEmits>
) {
  return useFeatures(
    aliasProps(props, {
      default: 'defaultValue',
      ...flatOptionItemAliases,
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
 * Default prop values for the select-button blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<SelectButtonProps>()({
  type: 'select-button',
  layout: true,
  multiple: false,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
