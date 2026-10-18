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
  type ReadonlyProps,
  type LayoutProps,
  type TextishModel,
  type ModelEmits,
  type InteractionEmits,
  type InputEmits,
  type ValidationEmits,
  aliasProps,
} from '@vueform/core'
import type {
  KnobProps as AKnobProps,
  KnobEmitsOptions as AKnobEmits,
} from 'primevue/knob'

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
 * Props for the knob element blueprint.
 *
 * Non-generic counterpart — no model-driving type parameters. The plain props
 * type and the props interface are the same shape.
 */
export interface KnobProps<
  T extends string = 'knob',
  S = KnobSlots,
  P = KnobParts,
  C = KnobClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<TextishModel, TContext>,
    ValidationProps<TContext>,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    InfoProps,
    IntervalProps,
    /* @vue-ignore */ Omit<
      AKnobProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'readonly'
      | 'min'
      | 'max'
      | 'step'
    > {
  /**
   * Whether the content of the element should be centered
   */
  centered?: boolean
}

/**
 * Events emitted by the knob element.
 */
export interface KnobEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<TextishModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<number, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AKnobEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the knob element blueprint.
 */
export interface KnobSlots<TContext = any> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the knob element blueprint.
 */
export interface KnobParts extends BaseFieldElementParts {}

/**
 * CSS classes for the knob element blueprint.
 */
export interface KnobClasses extends BaseElementClasses {}

/**
 * Styling modifiers of the knob element blueprint.
 */
export interface KnobModifiers extends BaseElementModifiers {}

/**
 * Accessibility bindings of the knob element blueprint.
 */
export interface KnobA11y extends BaseElementA11y, AriaA11y {}

/**
 * Augmentable public API surface for knob-based components.
 */
export interface KnobExpose extends BaseElementExpose, KnobApi {}

/**
 * Factory API produced by the knob blueprint's `blueprint` function, optionally
 * parameterized by concrete props. Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites.
 */
export type KnobApi<TProps extends KnobProps<string> = KnobProps<string>> =
  ReturnType<typeof blueprint<TProps>>

/**
 * PrimeVue Knob events and slots to forward from the Vueform adapter to the
 * underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change'],
} as const

/**
 * Builds the knob factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends KnobProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<KnobEmits>
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
    .use(makeInterval())
    .use(makeAria())
    .use(makeInfo())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()
}

/**
 * Default prop values for the knob blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<KnobProps>()({
  type: 'knob',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
