import {
  defineDefaults,
  useFeatures,
  makeElement,
  makeLayout,
  makeAddons,
  makeIcons,
  makeInteraction,
  makeDisabled,
  makeReadonly,
  makePlaceholder,
  makeData,
  makeInput,
  makeLoading,
  makeProvider,
  makeForwards,
  useDynamicProp,
  type DProp,
  type BaseElementClasses,
  type BaseElementEmits,
  type BaseElementExpose,
  type BaseElementParts,
  type BaseElementProps,
  type BaseElementSlots,
  type DefineEvents,
  type LooseRequired,
  type AriaProps,
  type AddonsProps,
  type IconsProps,
  type ExpressionProps,
  type AddonableProps,
  type ValidationProps,
  type ReadonlyProps,
  type DisabledProps,
  type PlaceholderProps,
  type LoadingProps,
  type LayoutProps,
  type ModelEmits,
  type InteractionEmits,
  type ValidationEmits,
  type InputEmits,
  type TextishModel,
  type ModelApi,
  aliasProps,
} from '@vueform/core'
import type {
  InputNumberProps as AInputNumberProps,
  InputNumberEmitsOptions as AInputNumberEmits,
} from 'primevue/inputnumber'
import { computed } from 'vue'

import {
  makeFloatLabel,
  makeIfta,
  makeInfo,
  makeInterval,
  makeTooltip,
  makeAria,
  type ModelPropsWithDefaultValue,
  type FloatLabelProps,
  type IftaLabelProps,
  type InfoProps,
  type IntervalProps,
  type TooltipProps,
} from '#primevue/features'
import type { ForwardedEmits } from '#primevue/types'

/**
 * Props for the input-number element blueprint.
 *
 * Non-generic counterpart — no model-driving type parameters. The plain props
 * type and the props interface are the same shape.
 */
export interface InputNumberProps<
  T extends string = 'input-number',
  S = InputNumberSlots,
  P = InputNumberParts,
  C = InputNumberClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<TextishModel, TContext>,
    ValidationProps<TContext>,
    AddonsProps<TContext>,
    IconsProps<TContext>,
    AddonableProps,
    AriaProps,
    ReadonlyProps<TContext>,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext>,
    FloatLabelProps,
    IftaLabelProps,
    InfoProps,
    IntervalProps,
    TooltipProps,
    /* @vue-ignore */ Omit<
      AInputNumberProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'fluid'
      | 'formControl'
      | 'disabled'
      | 'placeholder'
      | 'readonly'
      | 'inputId'
      | 'min'
      | 'max'
      | 'step'
      | 'currency'
      | 'locale'
      | 'prefix'
      | 'suffix'
      | 'mode'
    > {
  /**
   * The currency to use in currency formatting. Accepts expressions.
   */
  currency?: DProp

  /**
   * Locale to be used in formatting. Accepts expressions.
   */
  locale?: DProp

  /**
   * Text to display before the value. Accepts expressions.
   */
  prefix?: DProp

  /**
   * Text to display after the value. Accepts expressions.
   */
  suffix?: DProp

  /**
   * Defines the behavior of the component.
   */
  mode?: any
}

/**
 * Events emitted by the input-number element.
 */
export interface InputNumberEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<TextishModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<TextishModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AInputNumberEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the input-number element blueprint.
 */
export interface InputNumberSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the input-number element blueprint.
 */
export interface InputNumberParts extends BaseElementParts {}

/**
 * CSS classes for the input-number element blueprint.
 */
export interface InputNumberClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for input-number-based components.
 */
export interface InputNumberExpose extends BaseElementExpose, InputNumberApi {}

/**
 * Factory API produced by the input-number blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type InputNumberApi<
  TProps extends InputNumberProps<string> = InputNumberProps<string>,
> = ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue InputNumber events and slots to forward from the Vueform adapter to
 * the underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change'],
  slots: [
    'incrementbutton',
    'decrementbutton',
    'incrementicon',
    'decrementicon',
    'clearicon',
  ],
} as const

/**
 * Builds the input-number factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends InputNumberProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<InputNumberEmits>
) {
  const api = useFeatures(
    aliasProps(props, {
      default: 'defaultValue',
    }),
    events
  )
    .use(makeElement())
    .use(makeLayout())
    .use(makeAddons())
    .use(makeIcons())
    .use(makeInteraction())
    .use(makeDisabled())
    .use(makeReadonly())
    .use(makePlaceholder())
    .use(makeData())
    .use(makeLoading())
    .use(makeInput({ canonicalDomValue: false }))
    .use(makeInterval())
    .use(makeTooltip())
    .use(makeFloatLabel())
    .use(makeIfta())
    .use(makeInfo())
    .use(makeAria())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()

  /**
   * The resolved currency code for currency formatting.
   */
  const currency = useDynamicProp('currency', props)

  /**
   * The resolved locale for number formatting.
   */
  const locale = useDynamicProp('locale', props)

  /**
   * The resolved text displayed before the value.
   */
  const prefix = useDynamicProp('prefix', props)

  /**
   * The resolved text displayed after the value.
   */
  const suffix = useDynamicProp('suffix', props)

  /**
   * Resolved PrimeVue InputNumber mode (falls back to decimal without
   * currency).
   */
  const mode = computed(() =>
    props.mode === 'currency'
      ? currency.value
        ? props.mode
        : 'decimal'
      : props.mode
  )

  /**
   * Returns the Intl.NumberFormat object used by the underlying InputNumber.
   */
  const getFormatter = (): Intl.NumberFormat | undefined => {
    return api.input.value?.getFormatter()
  }

  return {
    ...api,
    getFormatter,
    currency,
    locale,
    prefix,
    suffix,
    mode,
  }
}

/**
 * Default prop values for the input-number blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<InputNumberProps>()({
  type: 'input-number',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
