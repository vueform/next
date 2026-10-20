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
  makeCheckboxName,
  makeProvider,
  makeForwards,
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
import type {
  CheckboxProps as ACheckboxProps,
  CheckboxEmitsOptions as ACheckboxEmits,
} from 'primevue/checkbox'
import { computed } from 'vue'

import {
  makeInfo,
  type ModelPropsWithDefaultValue,
  type InfoProps,
} from '#src/features'
import type { ForwardedEmits } from '#src/types'

/**
 * Checkbox model shape: the union of `trueValue` and `falseValue`.
 */
type CheckboxModelOf<TTrueValue, TFalseValue> = TTrueValue | TFalseValue

/**
 * Model / default prop type for checkbox — `NoInfer` so `modelValue` does not
 * compete with `trueValue` / `falseValue` when inferring generics.
 */
type CheckboxModelProp<TTrueValue, TFalseValue> = NoInfer<
  CheckboxModelOf<TTrueValue, TFalseValue>
>

/**
 * The model value type carried by the checkbox element's wide props.
 */
type CheckboxModel = Required<CheckboxProps>['modelValue']

/**
 * Props for the checkbox element blueprint, parameterized by the model-driving
 * type arguments (`trueValue` / `falseValue`). Plain usage (`CheckboxProps`)
 * keeps every member wide, so no separate plain-props alias is needed.
 */
export interface CheckboxProps<
  T extends string = 'checkbox',
  TTrueValue = any,
  TFalseValue = any,
  S = CheckboxSlots,
  P = CheckboxParts,
  C = CheckboxClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<
      CheckboxModelProp<TTrueValue, TFalseValue>,
      TContext
    >,
    ValidationProps<TContext>,
    AddonableProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    InfoProps,
    AlignedProps,
    /* @vue-ignore */ Omit<
      ACheckboxProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'readonly'
      | 'binary'
      | 'trueValue'
      | 'falseValue'
      | 'indeterminate'
    > {
  /**
   * The value used when the checkbox is checked. Also drives one arm of the
   * model type.
   *
   * Includes a naked `boolean` arm alongside `TTrueValue` so the erased schema
   * surface (and blueprint defaults) still accept `true` / `false` literals.
   * Concrete values continue to infer into `TTrueValue`.
   */
  trueValue?: TTrueValue | boolean

  /**
   * The value used when the checkbox is unchecked. Also drives one arm of the
   * model type.
   *
   * Includes a naked `boolean` arm alongside `TFalseValue` so the erased schema
   * surface (and blueprint defaults) still accept `true` / `false` literals.
   * Concrete values continue to infer into `TFalseValue`.
   */
  falseValue?: TFalseValue | boolean

  /**
   * Overrides the HTML `name` attribute for the checkbox input.
   */
  checkboxName?: TProp<string, TContext>

  /**
   * The label text displayed next to the checkbox.
   */
  text?: TProp<string, TContext>

  /**
   * Positions the label text relative to the checkbox (`left`, `right`, or
   * `auto`).
   */
  align?: 'left' | 'right' | 'auto'
}

/**
 * Events emitted by the checkbox element.
 */
export interface CheckboxEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<CheckboxModel, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext>,
    InputEmits<CheckboxModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ACheckboxEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the checkbox element blueprint.
 */
export interface CheckboxSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the checkbox element blueprint.
 */
export interface CheckboxParts extends BaseFieldElementParts {}

/**
 * CSS classes for the checkbox element blueprint.
 */
export interface CheckboxClasses extends BaseElementClasses {}

/**
 * Part-keyed attribute bindings of the checkbox element blueprint, extended by
 * the consuming component via `useBindings`.
 */
export interface CheckboxBindings extends BaseElementBindings {}

/**
 * Augmentable public API surface for checkbox-based components.
 */
export interface CheckboxExpose extends BaseElementExpose, CheckboxApi {}

/**
 * Factory API produced by the checkbox blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type CheckboxApi<
  TProps extends CheckboxProps<string> = CheckboxProps<string>,
> = ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue Checkbox events and slots to forward from the Vueform adapter to the
 * underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change', 'update:indeterminate'],
  slots: ['icon'],
} as const

/**
 * Builds the checkbox factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends CheckboxProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<CheckboxEmits>
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
    .use(makeCheckboxName())
    .use(makeInfo())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()

  /**
   * Whether the checkbox is currently in the checked state.
   */
  const checked = computed(() => equals(api.value.value, props.trueValue))

  return { ...api, checked }
}

/**
 * Default prop values for the checkbox blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<CheckboxProps>()({
  type: 'checkbox',
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
