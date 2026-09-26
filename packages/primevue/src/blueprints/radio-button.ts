import {
  defineDefaults,
  useFeatures,
  makeElement,
  makeLayout,
  makeInteraction,
  makeDisabled,
  makeReadonly,
  makeText,
  makeData,
  makeInput,
  makeRadioAria,
  makeRadioName,
  makeProvider,
  makeForwards,
  type BaseElementClasses,
  type BaseElementEmits,
  type BaseElementExpose,
  type BaseElementParts,
  type BaseElementProps,
  type BaseElementSlots,
  type DefineEvents,
  type LooseRequired,
  type AriaProps,
  type ExpressionProps,
  type AddonableProps,
  type ValidationProps,
  type DisabledProps,
  type ReadonlyProps,
  type LayoutProps,
  type ModelEmits,
  type InteractionEmits,
  type InputEmits,
  type ValidationEmits,
  type TProp,
  type AlignedProps,
  type ModelApi,
  equals,
  aliasProps,
} from '@vueform/core'
import { computed } from 'vue'
import type { ForwardedEmits } from '#primevue/types'
import type {
  RadioButtonProps as ARadioButtonProps,
  RadioButtonEmitsOptions as ARadioButtonEmits,
} from 'primevue/radiobutton'
import {
  makeInfo,
  type ModelPropsWithDefaultValue,
  type InfoProps,
} from '#primevue/features'

/**
 * Radio-button model shape: the `value` prop type, or `null` when unselected.
 */
type RadioButtonModelOf<TRadioValue> = TRadioValue | null

/**
 * Model / default prop type for radio-button — `NoInfer` so `modelValue` does
 * not compete with `value` when inferring generics.
 */
type RadioButtonModelProp<TRadioValue> = NoInfer<
  RadioButtonModelOf<TRadioValue>
>

/**
 * The model value type carried by the radio-button element's wide props.
 */
type RadioButtonModel = Required<RadioButtonProps>['modelValue']

/**
 * Props for the radio-button element blueprint, parameterized by the
 * model-driving type argument (`value`). Plain usage (`RadioButtonProps`) keeps
 * every member wide, so no separate plain-props alias is needed.
 */
export interface RadioButtonProps<
  T extends string = 'radio-button',
  TRadioValue = any,
  S = RadioButtonSlots,
  P = RadioButtonParts,
  C = RadioButtonClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<RadioButtonModelProp<TRadioValue>, TContext>,
    ValidationProps<TContext>,
    AddonableProps,
    AriaProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    InfoProps,
    AlignedProps,
    /* @vue-ignore */ Omit<
      ARadioButtonProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'readonly'
      | 'binary'
      | 'value'
    > {
  /**
   * Overrides the HTML `name` attribute for the radio input.
   */
  radioName?: TProp<string, TContext>

  /**
   * The label text displayed next to the radio button.
   */
  text?: TProp<string, TContext>

  /**
   * Positions the label text relative to the radio button (`left`, `right`, or
   * `auto`).
   */
  align?: 'left' | 'right' | 'auto'

  /**
   * The value submitted when this radio is selected. Also drives the model type
   * (as `value | null`). May be an object or array when the radios list is
   * built from complex item values.
   *
   * Includes a naked `boolean` arm alongside `TRadioValue` so the erased schema
   * surface (and blueprint defaults) still accept `true` / `false` literals.
   * Concrete values continue to infer into `TRadioValue`.
   */
  value?: TRadioValue | boolean
}

/**
 * Events emitted by the radio-button element.
 */
export interface RadioButtonEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<RadioButtonModel, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext>,
    InputEmits<RadioButtonModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ARadioButtonEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available on the radio-button element blueprint.
 */
export interface RadioButtonSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the radio-button element blueprint.
 */
export interface RadioButtonParts extends BaseElementParts {}

/**
 * CSS classes for the radio-button element blueprint.
 */
export interface RadioButtonClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for radio-button-based components.
 */
export interface RadioButtonExpose extends BaseElementExpose, RadioButtonApi {}

/**
 * Factory API produced by the radio-button blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type RadioButtonApi<
  TProps extends RadioButtonProps<string> = RadioButtonProps<string>,
> = ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue RadioButton events and slots to forward from the Vueform adapter to
 * the underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change'],
  slots: [],
} as const

/**
 * Builds the radio-button factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends RadioButtonProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<RadioButtonEmits>
) {
  const api = useFeatures(
    aliasProps(props, {
      default: 'defaultValue',
    }),
    events
  )
    .use(makeElement())
    .use(makeLayout())
    .use(makeInteraction())
    .use(makeDisabled())
    .use(makeReadonly())
    .use(makeText())
    .use(makeData())
    .use(makeInput())
    .use(makeRadioAria())
    .use(makeRadioName())
    .use(makeInfo())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()

  /**
   * Whether the radio button is currently in the selected state.
   */
  const checked = computed(() => equals(api.value.value, props.value))

  return { ...api, checked }
}

/**
 * Default prop values for the radio-button blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<RadioButtonProps>()({
  type: 'radio-button',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  value: true,
  modelValue: undefined,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
