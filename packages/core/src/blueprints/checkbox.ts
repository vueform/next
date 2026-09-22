import { useFeatures } from '~/composables'
import {
  makeElement,
  makeInteraction,
  makeDisabled,
  makeText,
  makeData,
  makeInput,
  makeCheckboxAria,
  makeCheckboxName,
  makeProvider,
  makeLayout,
  type AriaProps,
  type DisabledProps,
  type BaseElementProps,
  type ValidationProps,
  type BaseElementEmits,
  type ExpressionProps,
  type ModelPropsWithDefault,
  type BaseElementParts,
  type BaseElementClasses,
  type BaseElementExpose,
  type BaseElementSlots,
  type AddonableProps,
  type LayoutProps,
  type ModelEmits,
  type InteractionEmits,
  type InputEmits,
  type ValidationEmits,
  type AlignedProps,
  type ModelApi,
} from '~/features'
import { defineDefaults, type DefineEvents } from '~/helpers'
import type { LooseRequired, TProp } from '~/types'

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
    ModelPropsWithDefault<CheckboxModelProp<TTrueValue, TFalseValue>, TContext>,
    ValidationProps<TContext>,
    AddonableProps,
    AriaProps,
    DisabledProps<TContext>,
    AlignedProps {
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
    InputEmits<CheckboxModel, TContext> {}

/**
 * Slots available on the checkbox element blueprint.
 */
export interface CheckboxSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the checkbox element blueprint.
 */
export interface CheckboxParts extends BaseElementParts {}

/**
 * CSS classes for the checkbox element blueprint.
 */
export interface CheckboxClasses extends BaseElementClasses {}

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
 * Builds the checkbox factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends CheckboxProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<CheckboxEmits>
) {
  return useFeatures(props, events)
    .use(makeElement())
    .use(makeLayout())
    .use(makeDisabled())
    .use(makeInteraction())
    .use(makeText())
    .use(makeData())
    .use(makeInput())
    .use(makeCheckboxAria())
    .use(makeCheckboxName())
    .use(makeProvider())
    .build()
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
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
