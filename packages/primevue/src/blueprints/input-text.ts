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
  makeMultilingual,
  makeTData,
  makeInput,
  makeKeyHandlers,
  makeLoading,
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
  type AddonsProps,
  type IconsProps,
  type ExpressionProps,
  type TranslateProps,
  type AddonableProps,
  type TValidationProps,
  type ReadonlyProps,
  type DisabledProps,
  type PlaceholderProps,
  type LoadingProps,
  type LayoutProps,
  type InputTypeProp,
  type LanguagesProp,
  type TranslateModelProp,
  type ModelEmits,
  type InteractionEmits,
  type ValidationEmits,
  type KeyEmits,
  type InputEmits,
  type TranslatableModelApi,
  aliasProps,
} from '@vueform/core'
import type {
  InputTextProps as AInputTextProps,
  InputTextEmitsOptions as AInputTextEmits,
} from 'primevue/inputtext'

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
 * The model value type carried by the input-text element's wide props.
 */
type InputTextModel = Required<InputTextProps>['modelValue']

/**
 * Props for the input-text element blueprint, parameterized by the
 * model-driving type arguments (`translate` / `languages`). Plain usage
 * (`InputTextProps`) keeps every member wide, so no separate plain-props alias
 * is needed.
 */
export interface InputTextProps<
  T extends string = 'input-text',
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  S = InputTextSlots,
  P = InputTextParts,
  C = InputTextClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<
      TranslateModelProp<TTranslate, TLanguages>,
      TContext
    >,
    TValidationProps<TContext>,
    TranslateProps<TTranslate, TLanguages>,
    AddonsProps<TContext>,
    IconsProps<TContext>,
    AddonableProps,
    ReadonlyProps<TContext>,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext>,
    FloatLabelProps,
    IftaLabelProps,
    InfoProps,
    TooltipProps,
    /* @vue-ignore */ Omit<
      AInputTextProps,
      | 'invalid'
      | 'fluid'
      | 'formControl'
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'id'
      | 'type'
      | 'disabled'
      | 'placeholder'
      | 'readonly'
      | 'translate'
      | 'inputType'
      | 'autocomplete'
      | 'loading'
    > {
  /**
   * The HTML input type (e.g. text, email, password).
   */
  inputType?: InputTypeProp

  /**
   * The HTML `autocomplete` attribute value for the input.
   */
  autocomplete?: string
}

/**
 * Events emitted by the input-text element.
 */
export interface InputTextEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<InputTextModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    KeyEmits<TContext>,
    InputEmits<InputTextModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AInputTextEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the input-text element blueprint.
 */
export interface InputTextSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the input-text element blueprint.
 */
export interface InputTextParts extends BaseFieldElementParts {}

/**
 * CSS classes for the input-text element blueprint.
 */
export interface InputTextClasses extends BaseElementClasses {}

/**
 * Part-keyed attribute bindings of the input-text element blueprint, extended
 * by the consuming component via `useBindings`.
 */
export interface InputTextBindings extends BaseElementBindings {}

/**
 * Augmentable public API surface for input-text-based components.
 */
export interface InputTextExpose extends BaseElementExpose, InputTextApi {}

/**
 * Factory API produced by the input-text blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type InputTextApi<
  TProps extends InputTextProps<string> = InputTextProps<string>,
> = TranslatableModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue InputText events and slots to forward from the Vueform adapter to
 * the underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change'],
} as const

/**
 * Builds the input-text factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends InputTextProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<InputTextEmits>
) {
  return useFeatures(
    aliasProps(props, {
      default: 'defaultValue',
    }),
    events
  )
    .use(makeElement())
    .use(makeLayout())
    .use(makeAddons())
    .use(makeIcons())
    .use(makeInteraction())
    .use(makeDisabled())
    .use(makeReadonly())
    .use(makePlaceholder())
    .use(makeMultilingual())
    .use(makeTData())
    .use(makeInput())
    .use(makeKeyHandlers())
    .use(makeLoading())
    .use(makeTooltip())
    .use(makeFloatLabel())
    .use(makeIfta())
    .use(makeInfo())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()
}

/**
 * Default prop values for the input-text blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<InputTextProps>()({
  type: 'input-text',
  layout: true,
  inputType: 'text',
  translate: false,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
