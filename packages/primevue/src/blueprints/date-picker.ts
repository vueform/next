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
  makeForwards,
  type BaseElementClasses,
  type BaseElementEmits,
  type BaseElementExpose,
  type BaseElementA11y,
  type BaseElementModifiers,
  type BaseFieldElementParts,
  type BaseElementProps,
  type BaseElementSlots,
  type DefineEvents,
  type LooseRequired,
  type AddonsProps,
  type IconsProps,
  type ExpressionProps,
  type ValidationProps,
  type AddonableProps,
  type ReadonlyProps,
  type DisabledProps,
  type PlaceholderProps,
  type LoadingProps,
  type LayoutProps,
  type TextMaybeArrayModel,
  type ModelEmits,
  type InteractionEmits,
  type InputEmits,
  type ValidationEmits,
  type ModelApi,
  type DProp,
  useDynamicProp,
  createElementContext,
  aliasProps,
} from '@vueform/core'
import type {
  DatePickerProps as ADatePickerProps,
  DatePickerEmitsOptions as ADatePickerEmits,
} from 'primevue/datepicker'
import {
  computed,
  onMounted,
  watch,
  type ComputedRef,
  type WatchHandle,
  type WritableComputedRef,
} from 'vue'

import {
  makeFloatLabel,
  makeIfta,
  makeInfo,
  makeTooltip,
  type ModelPropsWithDefaultValue,
  type FloatLabelProps,
  type IftaLabelProps,
  type InfoProps,
  type TooltipProps,
} from '#src/features'
import type { ForwardedEmits } from '#src/types'

/**
 * The model value type carried by the date-picker element's wide props.
 */
type DatePickerModel = Required<DatePickerProps>['modelValue']

/**
 * Bound for the `TSelectionMode` generic of date-picker elements: one of
 * PrimeVue's date selection modes, or `undefined` when unset.
 *
 * Intentionally limited to the literal modes so a component instance's props
 * stay assignable to the component's canonical (defaulted) context.
 */
export type DatePickerSelectionModeProp =
  | 'single'
  | 'multiple'
  | 'range'
  | undefined

/**
 * Date-picker model shaped by `selectionMode`:
 *
 * - unset / `'single'` — `string | null`
 * - `'multiple'` / `'range'` — `string[]`
 * - wide union — `TextMaybeArrayModel`
 */
export type DatePickerModelOf<
  TSelectionMode extends DatePickerSelectionModeProp =
    DatePickerSelectionModeProp,
> = [DatePickerSelectionModeProp] extends [TSelectionMode]
  ? TextMaybeArrayModel
  : TSelectionMode extends 'multiple' | 'range'
    ? string[]
    : string | null

/**
 * Model / default prop type for date-picker — `NoInfer` so `modelValue` does
 * not compete with `selectionMode` when inferring generics.
 */
export type DatePickerModelProp<
  TSelectionMode extends DatePickerSelectionModeProp =
    DatePickerSelectionModeProp,
> = NoInfer<DatePickerModelOf<TSelectionMode>>

/**
 * Props for the date picker element blueprint, parameterized by the
 * model-driving type argument (`selectionMode`). Plain usage
 * (`DatePickerProps`) keeps every member wide, so no separate plain-props alias
 * is needed.
 */
export interface DatePickerProps<
  T extends string = 'date-picker',
  TSelectionMode extends DatePickerSelectionModeProp =
    DatePickerSelectionModeProp,
  S = DatePickerSlots,
  P = DatePickerParts,
  C = DatePickerClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<DatePickerModelProp<TSelectionMode>, TContext>,
    ValidationProps<TContext>,
    AddonsProps<TContext>,
    IconsProps<TContext>,
    AddonableProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext>,
    FloatLabelProps,
    IftaLabelProps,
    InfoProps,
    TooltipProps,
    /* @vue-ignore */ Omit<
      ADatePickerProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'fluid'
      | 'formControl'
      | 'disabled'
      | 'placeholder'
      | 'readonly'
      | 'view'
      | 'minDate'
      | 'maxDate'
      | 'selectionMode'
    > {
  /**
   * **This replaces the original PrimeVue `selectionMode` prop.** Defines the
   * quantity of the selection and controls the model value shape:
   *
   * - unset / `'single'` → `string | null`
   * - `'multiple'` / `'range'` → `string[]`
   */
  selectionMode?: TSelectionMode | 'single' | 'multiple' | 'range'

  /**
   * **This replaces the original PrimeVue `minDate` prop.** The minimum
   * selectable date as a date string.
   */
  minDate?: DProp<string | Date, TContext>

  /**
   * **This replaces the original PrimeVue `maxDate` prop.** The maximum
   * selectable date as a date string.
   */
  maxDate?: DProp<string | Date, TContext>
}

/**
 * Events emitted by the date picker element.
 */
export interface DatePickerEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<DatePickerModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<DatePickerModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ADatePickerEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the date picker element blueprint.
 */
export interface DatePickerSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the date picker element blueprint.
 */
export interface DatePickerParts extends BaseFieldElementParts {}

/**
 * CSS classes for the date picker element blueprint.
 */
export interface DatePickerClasses extends BaseElementClasses {}

/**
 * Styling modifiers of the date picker element blueprint.
 */
export interface DatePickerModifiers extends BaseElementModifiers {}

/**
 * Accessibility bindings of the date-picker element blueprint.
 */
export interface DatePickerA11y extends BaseElementA11y {}

/**
 * Augmentable public API surface for date-picker-based components.
 */
export interface DatePickerExpose extends BaseElementExpose, DatePickerApi {}

/**
 * Factory API produced by the date-picker blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `DatePickerApi<VfDatePickerProps<'multiple'>>`). Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type DatePickerApi<
  TProps extends DatePickerProps<string> = DatePickerProps<string>,
> = ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue DatePicker events and slots to forward from the Vueform adapter to
 * the underlying PrimeVue component.
 */
export const forwards = {
  events: [
    'value-change',
    'date-select',
    'show',
    'hide',
    'today-click',
    'clear-click',
    'month-change',
    'year-change',
    'keydown',
  ],
  slots: [
    'header',
    'prevbutton',
    'nextbutton',
    'buttonbar',
    'todaybutton',
    'clearbutton',
    'hourincrementbutton',
    'hourdecrementbutton',
    'minuteincrementbutton',
    'minutedecrementbutton',
    'secondincrementbutton',
    'seconddecrementbutton',
    'ampmincrementbutton',
    'ampmdecrementbutton',
    'footer',
    'date',
    'decade',
    'weekheaderlabel',
    'weeklabel',
    'dropdownicon',
    'inputicon',
    'previcon',
    'nexticon',
    'incrementicon',
    'decrementicon',
    'dropdownbutton',
    'clearicon',
  ],
} as const

/**
 * Builds the date picker factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends DatePickerProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<DatePickerEmits>
) {
  // Required before defining dynamic props
  createElementContext()

  /**
   * The resolved selection mode. Explicit `V` so `useDynamicProp` does not
   * unwrap the `TSelectionMode` generic as if it were a `Ref` (that path infers
   * `unknown` and poisons the exposed context).
   */
  const selectionMode = useDynamicProp<DatePickerSelectionModeProp>(
    'selectionMode',
    props
  ) as ComputedRef<DatePickerSelectionModeProp>

  const nullValue = computed(() =>
    selectionMode.value === 'multiple' || selectionMode.value === 'range'
      ? []
      : null
  )

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
    .use(makeAddons())
    .use(makeIcons())
    .use(makeInteraction())
    .use(makeDisabled())
    .use(makeReadonly())
    .use(makePlaceholder())
    .use(makeData())
    .use(makeInput({ canonicalDomValue: false }))
    .use(makeLoading())
    .use(makeTooltip())
    .use(makeFloatLabel())
    .use(makeIfta())
    .use(makeInfo())
    .use(makeForwards(forwards))
    .build()

  // `update` / `value` follow `ModelOfProps<TProps>`, which stays deferred
  // while `TProps` is unbound — writes here use the wide date-picker model.
  const update = api.update as (data: DatePickerModel) => void
  const modelValue = api.value as WritableComputedRef<DatePickerModel>

  /**
   * The resolved minimum selectable date.
   */
  const minDate = useDynamicProp('minDate', props, {
    date: true,
  })

  /**
   * The resolved maximum selectable date.
   */
  const maxDate = useDynamicProp('maxDate', props, {
    date: true,
  })

  // ============== WATCHERS ==============

  watch(selectionMode, (newMode, oldMode) => {
    if (!oldMode || oldMode === newMode) return

    const wasSingle = oldMode === 'single' || !oldMode
    const isSingle = newMode === 'single' || !newMode

    if (wasSingle && !isSingle) {
      const current = modelValue.value
      modelValue.value = (current != null ? [current] : []) as DatePickerModel
    } else if (!wasSingle && isSingle) {
      const current = modelValue.value
      modelValue.value = (
        Array.isArray(current) && current.length > 0 ? current[0] : null
      ) as DatePickerModel
    } else if (oldMode === 'multiple' && newMode === 'range') {
      const current = modelValue.value
      if (Array.isArray(current) && current.length > 0) {
        const dates = current
          .filter((d: any) => d != null)
          .map((d: any) => new Date(d).getTime())
        if (dates.length >= 2) {
          const minIdx = dates.indexOf(Math.min(...dates))
          const maxIdx = dates.indexOf(Math.max(...dates))
          modelValue.value = [
            current[minIdx],
            current[maxIdx],
          ] as DatePickerModel
        } else {
          modelValue.value = [current[0], null] as DatePickerModel
        }
      }
    }
  })

  watch(minDate, (min) => {
    if (!min) return
    const current = modelValue.value
    if (current == null) return

    if (Array.isArray(current)) {
      if (selectionMode.value === 'range') {
        if (current[0] != null && new Date(current[0]) < min) {
          modelValue.value = nullValue.value as DatePickerModel
        }
      } else {
        const filtered = current.filter(
          (d: any) => d != null && new Date(d) >= min
        )
        if (filtered.length !== current.length) {
          modelValue.value = (
            filtered.length > 0 ? filtered : nullValue.value
          ) as DatePickerModel
        }
      }
    } else {
      if (new Date(current) < min) {
        modelValue.value = nullValue.value as DatePickerModel
      }
    }
  })

  watch(maxDate, (max) => {
    if (!max) return
    const current = modelValue.value
    if (current == null) return

    if (Array.isArray(current)) {
      if (selectionMode.value === 'range') {
        const end = current[1] ?? current[0]
        if (end != null && new Date(end) > max) {
          modelValue.value = nullValue.value as DatePickerModel
        }
      } else {
        const filtered = current.filter(
          (d: any) => d != null && new Date(d) <= max
        )
        if (filtered.length !== current.length) {
          modelValue.value = (
            filtered.length > 0 ? filtered : nullValue.value
          ) as DatePickerModel
        }
      }
    } else {
      if (new Date(current) > max) {
        modelValue.value = nullValue.value as DatePickerModel
      }
    }
  })

  // When format is an expression it may not be resolved yet when nullValue
  // is first computed (defaulting to ''). Once the expression resolves and
  // nullValue updates, sync the model to the correct default for that format.
  let unwatchNull: WatchHandle
  unwatchNull = watch(
    nullValue,
    (n, o) => {
      if (o === n) return
      update(n as DatePickerModel)
    },
    {
      once: true,
    }
  )

  onMounted(() => unwatchNull?.())

  return {
    ...api,
    selectionMode,
    minDate,
    maxDate,
  }
}

/**
 * Default prop values for the date picker blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<DatePickerProps>()({
  type: 'date-picker',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
