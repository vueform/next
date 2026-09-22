import {
  defineDefaults,
  useFeatures,
  makeElement,
  makeLayout,
  makeInteraction,
  makeDisabled,
  makeReadonly,
  makeData,
  makeInput,
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
  type ValidationProps,
  type DisabledProps,
  type ReadonlyProps,
  type LayoutProps,
  type ModelEmits,
  type InteractionEmits,
  type ValidationEmits,
  type InputEmits,
  type ModelApi,
  aliasProps,
} from '@vueform/core'
import {
  makeInfo,
  makeTooltip,
  makeAria,
  type ModelPropsWithDefaultValue,
  type InfoProps,
  type TooltipProps,
} from '@/features'
import type { ForwardedEmits } from '@/types'
import type {
  InputOtpProps as AInputOtpProps,
  InputOtpEmitsOptions as AInputOtpEmits,
  InputOtpChangeEvent,
} from 'primevue/inputotp'

/**
 * String model for OTP inputs.
 */
type OtpModel = string | null

/**
 * Props for the input-otp element blueprint.
 *
 * Non-generic counterpart — no model-driving type parameters. The plain props
 * type and the props interface are the same shape.
 */
export interface InputOtpProps<
  T extends string = 'input-otp',
  S = InputOtpSlots,
  P = InputOtpParts,
  C = InputOtpClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<OtpModel, TContext>,
    ValidationProps<TContext>,
    AriaProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    InfoProps,
    TooltipProps,
    /* @vue-ignore */ Omit<
      AInputOtpProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'readonly'
      | 'length'
    >,
    Pick<AInputOtpProps, 'length'> {}

/**
 * Events emitted by the input-otp element.
 */
export interface InputOtpEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<OtpModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<InputOtpChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AInputOtpEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the input-otp element blueprint.
 */
export interface InputOtpSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the input-otp element blueprint.
 */
export interface InputOtpParts extends BaseElementParts {}

/**
 * CSS classes for the input-otp element blueprint.
 */
export interface InputOtpClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for input-otp-based components.
 */
export interface InputOtpExpose extends BaseElementExpose, InputOtpApi {}

/**
 * Factory API produced by the input-otp blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type InputOtpApi<
  TProps extends InputOtpProps<string> = InputOtpProps<string>,
> = ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue InputOtp events and slots to forward from the Vueform adapter to the
 * underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change'],
  slots: ['default'],
} as const

/**
 * Builds the input-otp factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends InputOtpProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<InputOtpEmits>
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
    .use(
      makeData({
        cast: 'string',
      })
    )
    .use(makeInput())
    .use(makeTooltip())
    .use(makeInfo())
    .use(makeAria())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()

  /**
   * Whether the OTP value is fully filled to the configured length.
   *
   * @param value The current OTP model value.
   */
  const filled = (value: OtpModel) =>
    value === null ? false : String(value).length === props.length

  return {
    ...api,
    filled,
  }
}

/**
 * Default prop values for the input-otp blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<InputOtpProps>()({
  type: 'input-otp',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  showRequired: undefined,
  length: 4,
  untrackOn: undefined,
})
