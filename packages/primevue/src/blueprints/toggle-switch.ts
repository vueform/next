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
  type InputEmits,
  type ValidationEmits,
  type AddonableProps,
  type AlignedProps,
  type ModelApi,
  equals,
  useDynamicProp,
  aliasProps,
  type DProp,
} from '@vueform/core'
import type {
  ToggleSwitchProps as AToggleSwitchProps,
  ToggleSwitchEmitsOptions as AToggleSwitchEmits,
} from 'primevue/toggleswitch'
import { computed, toRef } from 'vue'

import {
  makeAria,
  makeInfo,
  type ModelPropsWithDefaultValue,
  type InfoProps,
} from '#primevue/features'
import type { ForwardedEmits } from '#primevue/types'

/**
 * Toggle-switch model shape: the union of `trueValue` and `falseValue`.
 */
type ToggleSwitchModelOf<TTrueValue, TFalseValue> = TTrueValue | TFalseValue

/**
 * Model / default prop type for toggle-switch — `NoInfer` so `modelValue` does
 * not compete with `trueValue` / `falseValue` when inferring generics.
 */
type ToggleSwitchModelProp<TTrueValue, TFalseValue> = NoInfer<
  ToggleSwitchModelOf<TTrueValue, TFalseValue>
>

/**
 * The model value type carried by the toggle-switch element's wide props.
 */
type ToggleSwitchModel = Required<ToggleSwitchProps>['modelValue']

/**
 * Props for the toggle-switch element blueprint, parameterized by the
 * model-driving type arguments (`trueValue` / `falseValue`). Plain usage
 * (`ToggleSwitchProps`) keeps every member wide, so no separate plain-props
 * alias is needed.
 */
export interface ToggleSwitchProps<
  T extends string = 'toggle-switch',
  TTrueValue = any,
  TFalseValue = any,
  S = ToggleSwitchSlots,
  P = ToggleSwitchParts,
  C = ToggleSwitchClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<
      ToggleSwitchModelProp<TTrueValue, TFalseValue>,
      TContext
    >,
    ValidationProps<TContext>,
    AddonableProps,
    AriaProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    InfoProps,
    AlignedProps,
    /* @vue-ignore */ Omit<
      AToggleSwitchProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'readonly'
      | 'trueValue'
      | 'falseValue'
    > {
  /**
   * The value used when the switch is on. Also drives one arm of the model
   * type.
   *
   * Includes a naked `boolean` arm alongside `TTrueValue` so the erased schema
   * surface (and blueprint defaults) still accept `true` / `false` literals.
   * Concrete values continue to infer into `TTrueValue`.
   */
  trueValue?: TTrueValue | boolean

  /**
   * The value used when the switch is off. Also drives one arm of the model
   * type.
   *
   * Includes a naked `boolean` arm alongside `TFalseValue` so the erased schema
   * surface (and blueprint defaults) still accept `true` / `false` literals.
   * Concrete values continue to infer into `TFalseValue`.
   */
  falseValue?: TFalseValue | boolean

  /**
   * Icon displayed when the switch is in the on state.
   */
  onIcon?: DProp<string, TContext>

  /**
   * Icon displayed when the switch is in the off state.
   */
  offIcon?: DProp<string, TContext>
}

/**
 * Events emitted by the toggle-switch element.
 */
export interface ToggleSwitchEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<ToggleSwitchModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<ToggleSwitchModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AToggleSwitchEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the toggle-switch element blueprint.
 */
export interface ToggleSwitchSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the toggle-switch element blueprint.
 */
export interface ToggleSwitchParts extends BaseElementParts {}

/**
 * CSS classes for the toggle-switch element blueprint.
 */
export interface ToggleSwitchClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for toggle-switch-based components.
 */
export interface ToggleSwitchExpose
  extends BaseElementExpose, ToggleSwitchApi {}

/**
 * Factory API produced by the toggle-switch blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type ToggleSwitchApi<
  TProps extends ToggleSwitchProps<string> = ToggleSwitchProps<string>,
> = ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue ToggleSwitch events and slots to forward from the Vueform adapter to
 * the underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change'],
  slots: [],
} as const

/**
 * Builds the toggle-switch factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends ToggleSwitchProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<ToggleSwitchEmits>
) {
  const api = useFeatures(
    aliasProps(props, {
      default: 'defaultValue',
    }),
    events,
    {
      nullValue: toRef(() => props.falseValue),
    }
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

  /**
   * The resolved icon CSS class for the on state.
   */
  const onIcon = useDynamicProp('onIcon', props, {
    icon: true,
  })

  /**
   * The resolved icon CSS class for the off state.
   */
  const offIcon = useDynamicProp('offIcon', props, {
    icon: true,
  })

  /**
   * Whether the switch is currently in the on state.
   */
  const checked = computed(() => equals(props.trueValue, api.model.value))

  return { ...api, onIcon, offIcon, checked }
}

/**
 * Default prop values for the toggle-switch blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<ToggleSwitchProps>()({
  type: 'toggle-switch',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  trueValue: true,
  falseValue: false,
  modelValue: undefined,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
