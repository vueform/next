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
  type BaseElementA11y,
  type BaseElementModifiers,
  type AriaA11y,
  type BaseFieldElementParts,
  type BaseElementProps,
  type BaseElementSlots,
  type DefineEvents,
  type LooseRequired,
  type ExpressionProps,
  type ValidationProps,
  type DisabledProps,
  type LayoutProps,
  type ModelEmits,
  type InteractionEmits,
  type InputEmits,
  type ValidationEmits,
  type AddonableProps,
  type TextishArrayModel,
  type TextishMaybeArrayModel,
  type TextishModel,
  type ModelApi,
  aliasProps,
} from '@vueform/core'
import type {
  SliderProps as ASliderProps,
  SliderEmitsOptions as ASliderEmits,
} from 'primevue/slider'
import { computed } from 'vue'

import {
  makeAria,
  makeInfo,
  makeInterval,
  type ModelPropsWithDefaultValue,
  type InfoProps,
  type IntervalProps,
} from '#src/features'
import type { ForwardedEmits } from '#src/types'

/**
 * Slider model shaped by `range`:
 *
 * - `range: false` — `string | number | null`
 * - `range: true` — `(string | number)[]`
 * - `range` unset / wide `boolean` — `TextishMaybeArrayModel`
 */
type SliderModelOf<TRange extends boolean = boolean> = [boolean] extends [
  TRange,
]
  ? TextishMaybeArrayModel
  : [TRange] extends [true]
    ? TextishArrayModel
    : TextishModel

/**
 * Model / default prop type for slider — `NoInfer` so `modelValue` does not
 * compete with `range` when inferring generics.
 */
type SliderModelProp<TRange extends boolean = boolean> = NoInfer<
  SliderModelOf<TRange>
>

/**
 * The model value type carried by the slider element's wide props.
 */
type SliderModel = Required<SliderProps>['modelValue']

/**
 * Props for the slider element blueprint, parameterized by the model-driving
 * type argument (`range`). Plain usage (`SliderProps`) keeps every member wide,
 * so no separate plain-props alias is needed.
 *
 * - `range: false` — model is a scalar
 * - `range: true` — model is an array of two boundary values
 */
export interface SliderProps<
  T extends string = 'slider',
  TRange extends boolean = boolean,
  S = SliderSlots,
  P = SliderParts,
  C = SliderClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<SliderModelProp<TRange>, TContext>,
    ValidationProps<TContext>,
    AddonableProps,
    DisabledProps<TContext>,
    InfoProps,
    IntervalProps,
    /* @vue-ignore */ Omit<
      ASliderProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'min'
      | 'max'
      | 'step'
      | 'range'
    > {
  /**
   * When specified, allows two boundary values to be picked. Includes a naked
   * `boolean` arm alongside `TRange` so the erased schema surface still accepts
   * `range: true`. Literals continue to infer into `TRange`.
   */
  range?: TRange | boolean
}

/**
 * Events emitted by the slider element.
 */
export interface SliderEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<SliderModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<number | number[], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ASliderEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the slider element blueprint.
 */
export interface SliderSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the slider element blueprint.
 */
export interface SliderParts extends BaseFieldElementParts {}

/**
 * CSS classes for the slider element blueprint.
 */
export interface SliderClasses extends BaseElementClasses {}

/**
 * Styling modifiers of the slider element blueprint.
 */
export interface SliderModifiers extends BaseElementModifiers {}

/**
 * Accessibility bindings of the slider element blueprint.
 */
export interface SliderA11y extends BaseElementA11y, AriaA11y {}

/**
 * Augmentable public API surface for slider-based components.
 */
export interface SliderExpose extends BaseElementExpose, SliderApi {}

/**
 * Factory API produced by the slider blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type SliderApi<
  TProps extends SliderProps<string> = SliderProps<string>,
> = ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue Slider events and slots to forward from the Vueform adapter to the
 * underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change', 'slideend'],
} as const

/**
 * Builds the slider factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends SliderProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<SliderEmits>
) {
  return useFeatures(
    aliasProps(props, {
      default: 'defaultValue',
    }),
    events,
    {
      nullValue: computed(() => (props.range ? [] : null)),
    }
  )
    .use(makeElement())
    .use(makeLayout())
    .use(makeInteraction())
    .use(makeDisabled())
    .use(makeData())
    .use(makeInput())
    .use(makeInterval())
    .use(makeAria())
    .use(makeInfo())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()
}

/**
 * Default prop values for the slider blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<SliderProps>()({
  type: 'slider',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
