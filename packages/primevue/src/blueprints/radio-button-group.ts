import {
  defineDefaults,
  makeGroupAria,
  makeData,
  makeDisabled,
  makeElement,
  makeHolderProvider,
  makeInteraction,
  makeLayout,
  useFeatures,
  type BaseElementClasses,
  type BaseElementEmits,
  type BaseElementExpose,
  type BaseElementA11y,
  type BaseElementModifiers,
  type GroupAriaA11y,
  type BaseContainerElementParts,
  type BaseElementProps,
  type BaseElementSlots,
  type ContainerProps,
  type DefineEvents,
  type DisabledProps,
  type InteractionEmits,
  type LayoutProps,
  type LooseRequired,
  type ModelEmits,
  type StackedProps,
  type ValidationEmits,
  type ValidationProps,
  type AlignedProps,
  aliasProps,
  makeItems,
} from '@vueform/core'

import {
  makeInfo,
  type ModelPropsWithDefaultValue,
  type InfoProps,
} from '#src/features'
import type {
  OptionGroupChildrenProp,
  OptionsProps,
  OptionsModelProp,
  OptionValueProp,
  OptionsProp,
  OptionsModelApi,
} from '#src/features/options'
import { optionItemAliases } from '#src/helpers'

/**
 * Plain props type for the radio-button-group element blueprint — the widest
 * instantiation of `RadioButtonGroupProps`. Use this whenever "the props of a
 * radio-button-group" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `RadioButtonGroupApi` type parameters.
 */
type LooseRadioButtonGroupProps = RadioButtonGroupProps<
  string,
  OptionsProp,
  OptionValueProp,
  OptionGroupChildrenProp
>

/**
 * Generic props interface for the radio-button-group element blueprint,
 * parameterized by the option-driving type arguments. Reach for
 * `LooseRadioButtonGroupProps` instead when no narrowing is needed.
 *
 * PrimeVue option prop names (`options` / `optionValue` /
 * `optionGroupChildren`) are kept via `OptionsProps`; generics use the
 * PrimeVue-named `TOptions` / `TOptionValueKey` / `TGroupChildren`.
 */
export interface RadioButtonGroupProps<
  T extends string = 'radio-button-group',
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
  S = RadioButtonGroupSlots,
  P = RadioButtonGroupParts,
  C = RadioButtonGroupClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ModelPropsWithDefaultValue<
      OptionsModelProp<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        false,
        TModel,
        TOptionValueReturn
      >,
      TContext
    >,
    ValidationProps<TContext>,
    ContainerProps,
    DisabledProps<TContext>,
    OptionsProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TOptionValueReturn,
      TContext
    >,
    StackedProps,
    InfoProps,
    AlignedProps {}

/**
 * Events emitted by the radio-button-group element.
 */
export interface RadioButtonGroupEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext> {}

/**
 * Slots available in the radio-button-group element blueprint.
 */
export interface RadioButtonGroupSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the radio-button-group element blueprint.
 */
export interface RadioButtonGroupParts extends BaseContainerElementParts {}

/**
 * CSS classes for the radio-button-group element blueprint.
 */
export interface RadioButtonGroupClasses extends BaseElementClasses {}

/**
 * Styling modifiers of the radio-button-group element blueprint. Empty at
 * the blueprint layer — modifiers are a view concern, defined by the
 * consuming component via `useModifiers`.
 */
export interface RadioButtonGroupModifiers extends BaseElementModifiers {}

/**
 * Accessibility bindings of the radio-button-group element blueprint.
 */
export interface RadioButtonGroupA11y extends BaseElementA11y, GroupAriaA11y {}

/**
 * Augmentable public API surface for radio-button-group-based components.
 */
export interface RadioButtonGroupExpose
  extends BaseElementExpose, RadioButtonGroupApi {}

/**
 * Factory API produced by the radio-button-group blueprint's `blueprint`
 * function, optionally parameterized by concrete props (e.g.
 * `RadioButtonGroupApi<VfRadioButtonGroupProps<typeof options, 'id'>>`). Prefer
 * this over `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose /
 * Context layers, extensions).
 */
export type RadioButtonGroupApi<
  TProps extends LooseRadioButtonGroupProps = LooseRadioButtonGroupProps,
> = OptionsModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * Builds the radio-button-group factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`. Passing `blueprint` as a value lets call-site
 * inference instantiate the API at the SFC's concrete props — the only
 * alternative to a per-blueprint wrapper hosting `typeof blueprint<TProps>`,
 * since conditional-type inference on a captured factory erases its type
 * parameters to constraints (verified empirically).
 */
export function blueprint<TProps extends LooseRadioButtonGroupProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<RadioButtonGroupEmits>
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
    .use(makeItems({ multiple: false }))
    .use(makeGroupAria({ role: 'radiogroup' }))
    .use(makeInfo())
    .use(
      makeHolderProvider({
        multiple: false,
        valueProp: 'value',
      })
    )
    .build()
}

/**
 * Default prop values for the radio-button-group blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<RadioButtonGroupProps>()({
  type: 'radio-button-group',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
})
