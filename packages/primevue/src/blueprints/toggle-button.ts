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
  useDynamicProp,
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
  type ReadonlyProps,
  type LayoutProps,
  type ModelEmits,
  type InteractionEmits,
  type InputEmits,
  type ValidationEmits,
  type AddonableProps,
  type TProp,
  aliasProps,
  type DProp,
} from '@vueform/core'
import type {
  ToggleButtonProps as AToggleButtonProps,
  ToggleButtonEmitsOptions as AToggleButtonEmits,
} from 'primevue/togglebutton'
import { ref } from 'vue'

import {
  makeInfo,
  type ModelPropsWithDefaultValue,
  type InfoProps,
} from '#src/features'
import type { ForwardedEmits } from '#src/types'

/**
 * Props for the toggle-button element blueprint.
 *
 * Non-generic counterpart — `onLabel` / `offLabel` are display strings and do
 * not drive the model (PrimeVue ToggleButton is boolean). The plain props type
 * and the props interface are the same shape.
 */
export interface ToggleButtonProps<
  T extends string = 'toggle-button',
  S = ToggleButtonSlots,
  P = ToggleButtonParts,
  C = ToggleButtonClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<any, TContext>,
    ValidationProps<TContext>,
    AddonableProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    InfoProps,
    /* @vue-ignore */ Omit<
      AToggleButtonProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'readonly'
      | 'onLabel'
      | 'offLabel'
      | 'onIcon'
      | 'offIcon'
    > {
  /**
   * Label displayed when the toggle button is in the on state.
   */
  onLabel?: TProp

  /**
   * Label displayed when the toggle button is in the off state.
   */
  offLabel?: TProp

  /**
   * Icon displayed when the toggle button is in the on state.
   */
  onIcon?: DProp

  /**
   * Icon displayed when the toggle button is in the off state.
   */
  offIcon?: DProp
}

/**
 * Events emitted by the toggle-button element.
 */
export interface ToggleButtonEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<any, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AToggleButtonEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the toggle-button element blueprint.
 */
export interface ToggleButtonSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the toggle-button element blueprint.
 */
export interface ToggleButtonParts extends BaseFieldElementParts {}

/**
 * CSS classes for the toggle-button element blueprint.
 */
export interface ToggleButtonClasses extends BaseElementClasses {}

/**
 * Part-keyed attribute bindings of the toggle-button element blueprint,
 * extended by the consuming component via `useBindings`.
 */
export interface ToggleButtonBindings extends BaseElementBindings {}

/**
 * Augmentable public API surface for toggle-button-based components.
 */
export interface ToggleButtonExpose
  extends BaseElementExpose, ToggleButtonApi {}

/**
 * Factory API produced by the toggle-button blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type ToggleButtonApi<
  TProps extends ToggleButtonProps<string> = ToggleButtonProps<string>,
> = ReturnType<typeof blueprint<TProps>>

/**
 * PrimeVue ToggleButton events and slots to forward from the Vueform adapter to
 * the underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change'],
  slots: ['default', 'icon'],
} as const

/**
 * Builds the toggle-button factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends ToggleButtonProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<ToggleButtonEmits>
) {
  const api = useFeatures(
    aliasProps(props, {
      default: 'defaultValue',
    }),
    events,
    {
      nullValue: ref(false),
    }
  )
    .use(makeElement())
    .use(makeLayout())
    .use(makeInteraction())
    .use(makeDisabled())
    .use(makeReadonly())
    .use(makeData())
    .use(makeInput({ canonicalDomValue: false }))
    .use(makeInfo())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()

  /**
   * The resolved label for the on state.
   */
  const onLabel = useDynamicProp('onLabel', props, {
    localize: true,
  })

  /**
   * The resolved label for the off state.
   */
  const offLabel = useDynamicProp('offLabel', props, {
    localize: true,
  })

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

  return { ...api, onLabel, offLabel, onIcon, offIcon }
}

/**
 * Default prop values for the toggle-button blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<ToggleButtonProps>()({
  type: 'toggle-button',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  modelValue: undefined,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
