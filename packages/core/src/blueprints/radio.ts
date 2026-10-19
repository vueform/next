import { useFeatures } from '#src/composables'
import {
  makeElement,
  makeInteraction,
  makeDisabled,
  makeText,
  makeData,
  makeInput,
  makeRadioName,
  makeProvider,
  makeLayout,
  type DisabledProps,
  type ModelPropsWithDefault,
  type BaseElementEmits,
  type BaseElementProps,
  type ValidationProps,
  type ExpressionProps,
  type BaseFieldElementParts,
  type BaseElementClasses,
  type BaseElementExpose,
  type BaseElementA11y,
  type BaseElementModifiers,
  type BaseElementSlots,
  type AddonableProps,
  type LayoutProps,
  type ModelEmits,
  type InteractionEmits,
  type InputEmits,
  type ValidationEmits,
  type AlignedProps,
  type ModelApi,
} from '#src/features'
import { defineDefaults, type DefineEvents } from '#src/helpers'
import type { LooseRequired, TProp } from '#src/types'

/**
 * Radio model shape: the `radioValue` prop type, or `null` when unselected.
 */
type RadioModelOf<TRadioValue> = TRadioValue | null

/**
 * Model / default prop type for radio — `NoInfer` so `modelValue` does not
 * compete with `radioValue` when inferring generics.
 */
type RadioModelProp<TRadioValue> = NoInfer<RadioModelOf<TRadioValue>>

/**
 * The model value type carried by the radio element's wide props.
 */
type RadioModel = Required<RadioProps>['modelValue']

/**
 * Props for the radio element blueprint, parameterized by the model-driving
 * type argument (`radioValue`). Plain usage (`RadioProps`) keeps every member
 * wide, so no separate plain-props alias is needed.
 */
export interface RadioProps<
  T extends string = 'radio',
  TRadioValue = any,
  S = RadioSlots,
  P = RadioParts,
  C = RadioClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefault<RadioModelProp<TRadioValue>, TContext>,
    ValidationProps<TContext>,
    AddonableProps,
    DisabledProps<TContext>,
    AlignedProps {
  /**
   * The value submitted when this radio is selected. Also drives the model type
   * (as `radioValue | null`). May be an object or array when the radios list is
   * built from complex item values.
   *
   * Includes a naked `boolean` arm alongside `TRadioValue` so the erased schema
   * surface (and blueprint defaults) still accept `true` / `false` literals.
   * Concrete values continue to infer into `TRadioValue`.
   */
  radioValue?: TRadioValue | boolean

  /**
   * Overrides the HTML `name` attribute for the radio input.
   */
  radioName?: TProp<string, TContext>

  /**
   * The label text displayed alongside the radio button.
   */
  text?: TProp<string, TContext>

  /**
   * The alignment of the radio label relative to the radio button.
   */
  align?: 'left' | 'right' | 'auto'
}

/**
 * Events emitted by the radio element.
 */
export interface RadioEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<RadioModel, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext>,
    InputEmits<RadioModel, TContext> {}

/**
 * Slots available on the radio element blueprint.
 */
export interface RadioSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the radio element blueprint.
 */
export interface RadioParts extends BaseFieldElementParts {}

/**
 * CSS classes for the radio element blueprint.
 */
export interface RadioClasses extends BaseElementClasses {}

/**
 * Styling modifiers of the radio element blueprint.
 */
export interface RadioModifiers extends BaseElementModifiers {}

/**
 * Accessibility bindings of the radio element blueprint.
 */
export interface RadioA11y extends BaseElementA11y {}

/**
 * Augmentable public API surface for radio-based components.
 */
export interface RadioExpose extends BaseElementExpose, RadioApi {}

/**
 * Factory API produced by the radio blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type RadioApi<TProps extends RadioProps<string> = RadioProps<string>> =
  ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * Builds the radio factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends RadioProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<RadioEmits>
) {
  return useFeatures(props, events)
    .use(makeElement())
    .use(makeLayout())
    .use(makeInteraction())
    .use(makeText())
    .use(makeDisabled())
    .use(makeData())
    .use(makeInput())
    .use(makeRadioName())
    .use(makeProvider())
    .build()
}

/**
 * Default prop values for the radio blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<RadioProps>()({
  type: 'radio',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  radioValue: true,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
