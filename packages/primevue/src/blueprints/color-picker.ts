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
  type BaseElementParts,
  type BaseElementProps,
  type BaseElementSlots,
  type DefineEvents,
  type LooseRequired,
  type ColorFormat,
  type AriaProps,
  type ExpressionProps,
  type ValidationProps,
  type DisabledProps,
  type LayoutProps,
  type TextModel,
  type ModelEmits,
  type InteractionEmits,
  type ValidationEmits,
  type InputEmits,
  type AddonableProps,
  convertColor,
  type DProp,
  type AlignedProps,
  useDynamicProp,
  createElementContext,
  aliasProps,
} from '@vueform/core'
import type {
  ColorPickerProps as AColorPickerProps,
  ColorPickerEmitsOptions as AColorPickerEmits,
  ColorPickerChangeEvent,
} from 'primevue/colorpicker'
import { computed, onMounted, toRef, watch, type WatchHandle } from 'vue'

import {
  makeAria,
  makeInfo,
  type ModelPropsWithDefaultValue,
  type InfoProps,
} from '#primevue/features'
import type { ForwardedEmits } from '#primevue/types'

/**
 * Props for the color-picker element blueprint.
 *
 * Non-generic counterpart — no item-driving type parameters. The plain props
 * type and the props interface are the same shape.
 */
export interface ColorPickerProps<
  T extends string = 'color-picker',
  S = ColorPickerSlots,
  P = ColorPickerParts,
  C = ColorPickerClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<TextModel, TContext>,
    ValidationProps<TContext>,
    AddonableProps,
    AriaProps,
    DisabledProps<TContext>,
    InfoProps,
    AlignedProps,
    /* @vue-ignore */ Omit<
      AColorPickerProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'inputId'
      | 'format'
      | 'defaultColor'
    > {
  /**
   * Format to use in value binding, supported formats are `'hex'`, `'rgb'` and
   * `'hsb'`.
   */
  format?: DProp<ColorFormat>

  /**
   * Initial color to display when value is not defined and the format is `hex`.
   */
  defaultColor?: any

  /**
   * Initial color to display when value is not defined and the format is `rgb`.
   */
  defaultRgb?: { r: number; g: number; b: number }

  /**
   * Initial color to display when value is not defined and the format is `hsb`.
   */
  defaultHsb?: { h: number; s: number; b: number }
}

/**
 * Events emitted by the color-picker element.
 */
export interface ColorPickerEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<TextModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<ColorPickerChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AColorPickerEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the color-picker element blueprint.
 */
export interface ColorPickerSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the color-picker element blueprint.
 */
export interface ColorPickerParts extends BaseElementParts {}

/**
 * CSS classes for the color-picker element blueprint.
 */
export interface ColorPickerClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for color-picker-based components.
 */
export interface ColorPickerExpose extends BaseElementExpose, ColorPickerApi {}

/**
 * Factory API produced by the color-picker blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type ColorPickerApi<
  TProps extends ColorPickerProps<string> = ColorPickerProps<string>,
> = ReturnType<typeof blueprint<TProps>>

/**
 * PrimeVue ColorPicker events to forward from the Vueform adapter to the
 * underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change', 'show', 'hide'],
} as const

/**
 * Builds the color-picker factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends ColorPickerProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<ColorPickerEmits>
) {
  // Required before defining dynamic props
  createElementContext()

  /**
   * The resolved color format, supporting dynamic text props.
   */
  const format = useDynamicProp<ColorFormat>('format', props)

  const cast = toRef(() => (format.value === 'hex' ? 'string' : undefined))

  const nullValue = computed(() => {
    return format.value === 'hex'
      ? props.defaultColor
      : format.value === 'rgb'
        ? props.defaultRgb
        : format.value === 'hsb'
          ? props.defaultHsb
          : ''
  })

  const api = useFeatures(
    aliasProps(props, {
      default: 'defaultValue',
    }),
    events,
    {
      nullValue,
    }
  )
    .use(makeElement())
    .use(makeLayout())
    .use(makeInteraction())
    .use(makeDisabled())
    .use(makeData({ cast }))
    .use(makeInput())
    .use(makeAria())
    .use(makeInfo())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()

  // `update` follows `ModelOfProps<TProps>`, which stays deferred while
  // `TProps` is unbound — writes here are the element's `TextModel`.
  const update = api.update as (data: TextModel) => void

  watch(format, (n, o) => {
    if (!n || !o) return
    update(convertColor(api.model.value, n, o) as TextModel)
  })

  // When format is an expression it may not be resolved yet when nullValue
  // is first computed (defaulting to ''). Once the expression resolves and
  // nullValue updates, sync the model to the correct default for that format.
  let unwatchNull: WatchHandle
  unwatchNull = watch(
    nullValue,
    (n, o) => {
      if (o === n) return
      update(n as TextModel)
    },
    {
      once: true,
    }
  )

  onMounted(() => unwatchNull?.())

  return {
    ...api,
    format,
  }
}

/**
 * Default prop values for the color-picker blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<ColorPickerProps>()({
  type: 'color-picker',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  format: 'hex',
  defaultColor: 'ff0000',
  defaultRgb: () => ({ r: 255, g: 0, b: 0 }),
  defaultHsb: () => ({ h: 100, s: 0, b: 0 }),
  untrackOn: undefined,
})
