import { computed } from 'vue'

import { useFeatures } from '#core/composables'
import {
  makeAddons,
  makeTData,
  makeElement,
  makeIcons,
  makeInteraction,
  makeMultilingual,
  makeDisabled,
  makeReadonly,
  makeAria,
  makeInput,
  makeKeyHandlers,
  makeProvider,
  makeLayout,
  type AriaProps,
  type DisabledProps,
  type ModelPropsWithDefault,
  type AddonsProps,
  type IconsProps,
  type BaseElementEmits,
  type BaseElementProps,
  type BaseElementParts,
  type BaseElementClasses,
  type BaseElementExpose,
  type BaseElementSlots,
  type ExpressionProps,
  type TranslateProps,
  type TValidationProps,
  type ReadonlyProps,
  type LayoutProps,
  type ModelEmits,
  type InteractionEmits,
  type KeyEmits,
  type InputEmits,
  type ValidationEmits,
  type TranslateModel,
  type TranslatableModelApi,
} from '#core/features'
import { defineDefaults, type DefineEvents } from '#core/helpers'
import type { LanguagesProp, LooseRequired } from '#core/types'
import { toReactive } from '#core/utils'

/**
 * Field model shape. `TNullValue` always types **one value** — the model itself
 * when not translating, the per-language entry when translating:
 *
 * - `translate: false` — the `nullValue` prop type (default `null` on the SFC).
 * - `translate: true` — a locale-keyed object of `TNullValue` entries (the SFC
 *   defaults `TNullValue` to the text scalar `string | number | null` here).
 * - `translate` wide/unset — union of both.
 */
type FieldTranslateModel<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TNullValue = any,
> = [boolean] extends [TTranslate]
  ?
      | FieldNullValue<TNullValue>
      | TranslateModel<boolean, TLanguages, FieldNullValue<TNullValue>>
  : [TTranslate] extends [true]
    ? TranslateModel<true, TLanguages, FieldNullValue<TNullValue>>
    : FieldNullValue<TNullValue>

/**
 * Model / default prop type for field — `NoInfer` so `modelValue` does not
 * compete with `translate` / `languages` / `nullValue` when inferring
 * generics.
 */
type FieldTranslateModelProp<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TNullValue = any,
> = NoInfer<FieldTranslateModel<TTranslate, TLanguages, TNullValue>>

/**
 * The model value type carried by the field element's wide props.
 */
type FieldModel = Required<FieldProps>['modelValue']

/**
 * The field's current-value type, read from the `nullValue` prop — which types
 * one value in both modes (the model when not translating, the per-language
 * entry when translating), so no model-shape dissection is needed.
 */
type FieldValueOf<TProps> = 'nullValue' extends keyof TProps
  ? FieldNullValue<Exclude<TProps['nullValue'], undefined>>
  : any

/**
 * Recursively widens literals to their primitives: `'1234'` → `string`, `0` →
 * `number`, `false` → `boolean`. Arrays of any shape become `any[]` — an array
 * `nullValue` only says "the model is an array", never what it holds. Object
 * properties turn optional (a model may be partially filled) and widen the same
 * way, dropping `readonly`; functions and remaining types pass through.
 */
export type WidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly any[]
        ? any[]
        : T extends (...args: any[]) => any
          ? T
          : T extends object
            ? { -readonly [K in keyof T]?: WidenLiteral<T[K]> }
            : T

/**
 * Derives the model / value type from a `nullValue`. The declared empty value
 * describes the _kind_ of data, not its exact members — `defineSchema`'s
 * `const` narrowing would otherwise turn `['1234', 'asdf']` into a tuple of
 * those literals and reject every real model value:
 *
 * - `null` — no shape declared, the model is `any`.
 * - string / number / boolean — widened to the primitive.
 * - array — `any[]`, regardless of the declared members.
 * - object — the shape is kept with every key optional; a key that IS provided
 *   must match its declared (widened) property type.
 */
export type FieldNullValue<T> = [T] extends [null] ? any : WidenLiteral<T>

/**
 * Props for the field element blueprint, parameterized by the model-driving
 * type arguments (`translate` / `languages` / `nullValue`). Plain usage
 * (`FieldProps`) keeps every member wide, so no separate plain-props alias is
 * needed.
 *
 * `nullValue` always types one value: it is the model when the element is not
 * translatable, and each language's entry when `translate: true` (where the
 * model is a locale-keyed object of it).
 */
export interface FieldProps<
  T extends string = 'field',
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TNullValue = any,
  S = FieldSlots,
  P = FieldParts,
  C = FieldClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefault<
      FieldTranslateModelProp<TTranslate, TLanguages, TNullValue>,
      TContext
    >,
    TValidationProps<TContext>,
    TranslateProps<TTranslate, TLanguages>,
    AddonsProps<TContext>,
    IconsProps<TContext>,
    AriaProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext> {
  /**
   * The custom null value representing an empty state. Always describes one
   * value: the model itself when the element is not translatable, and each
   * language's entry when `translate: true`.
   */
  nullValue?: TNullValue

  /**
   * Arbitrary pass-through options exposed in the slot context, useful for
   * parameterizing slot components in schema-driven usage.
   */
  options?: Record<string, any>
}

/**
 * Events emitted by the field element.
 */
export interface FieldEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<FieldModel, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext>,
    KeyEmits<TContext>,
    InputEmits<FieldModel, TContext> {
  /**
   * Generic proxy event that the default slot can use to surface events from
   * the underlying input component.
   *
   * @param name The original event name being proxied.
   * @param args Additional event arguments.
   */
  event: [name: string, ...args: any[]]
}

/**
 * Slots available on the field element blueprint.
 */
export interface FieldSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the field element blueprint.
 */
export interface FieldParts extends BaseElementParts {}

/**
 * CSS classes for the field element blueprint.
 */
export interface FieldClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for field-based components.
 */
export interface FieldExpose extends BaseElementExpose, FieldApi {}

/**
 * Factory API produced by the field blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type FieldApi<TProps extends FieldProps<string> = FieldProps<string>> =
  TranslatableModelApi<
    ReturnType<typeof blueprint>,
    TProps,
    FieldValueOf<TProps>
  >

/**
 * Builds the field factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends FieldProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<FieldEmits>
) {
  const api = useFeatures(props, events)
    .use(makeElement())
    .use(makeLayout())
    .use(makeAddons())
    .use(makeIcons())
    .use(makeInteraction())
    .use(makeMultilingual())
    .use(makeDisabled())
    .use(makeReadonly())
    .use(makeTData())
    .use(makeAria())
    .use(makeInput())
    .use(makeKeyHandlers())
    .use(makeProvider())
    .build()

  /**
   * Arbitrary pass-through options exposed in the slot context.
   */
  const options = toReactive<Record<string, any>>(
    computed(() => props.options || {})
  )

  return {
    ...api,
    options,
  }
}

/**
 * Default prop values for the field blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<FieldProps>()({
  type: 'field',
  layout: true,
  disabled: false,
  readonly: false,
  translate: false,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
