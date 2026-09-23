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
  type TextishModel,
  type ModelEmits,
  type InteractionEmits,
  type InputEmits,
  type ValidationEmits,
  type AddonableProps,
  type AlignedProps,
  aliasProps,
} from '@vueform/core'
import {
  makeAria,
  makeInfo,
  type ModelPropsWithDefaultValue,
  type InfoProps,
} from '@/features'
import type { ForwardedEmits } from '@/types'
import type {
  RatingProps as ARatingProps,
  RatingEmitsOptions as ARatingEmits,
  RatingChangeEvent,
} from 'primevue/rating'

/**
 * Props for the rating element blueprint.
 *
 * Non-generic counterpart — no model-driving type parameters. The plain props
 * type and the props interface are the same shape.
 */
export interface RatingProps<
  T extends string = 'rating',
  S = RatingSlots,
  P = RatingParts,
  C = RatingClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<TextishModel, TContext>,
    ValidationProps<TContext>,
    AddonableProps,
    AriaProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    InfoProps,
    AlignedProps,
    /* @vue-ignore */ Omit<
      ARatingProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'readonly'
    > {}

/**
 * Events emitted by the rating element.
 */
export interface RatingEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<TextishModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<RatingChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ARatingEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the rating element blueprint.
 */
export interface RatingSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the rating element blueprint.
 */
export interface RatingParts extends BaseElementParts {}

/**
 * CSS classes for the rating element blueprint.
 */
export interface RatingClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for rating-based components.
 */
export interface RatingExpose extends BaseElementExpose, RatingApi {}

/**
 * Factory API produced by the rating blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type RatingApi<
  TProps extends RatingProps<string> = RatingProps<string>,
> = ReturnType<typeof blueprint<TProps>>

/**
 * PrimeVue Rating events and slots to forward from the Vueform adapter to the
 * underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change'],
  slots: ['onicon', 'officon'],
} as const

/**
 * Builds the rating factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends RatingProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<RatingEmits>
) {
  return useFeatures(
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
    .use(makeData())
    .use(makeInput())
    .use(makeAria())
    .use(makeInfo())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()
}

/**
 * Default prop values for the rating blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<RatingProps>()({
  type: 'rating',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
