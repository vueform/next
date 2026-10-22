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
  type LanguagesProp,
  type TranslateModelProp,
  type ModelEmits,
  type InteractionEmits,
  type ValidationEmits,
  type KeyEmits,
  type InputEmits,
  type TProp,
  type TranslatableModelApi,
  useDynamicProp,
  aliasProps,
} from '@vueform/core'
import type {
  InputMaskProps as AInputMaskProps,
  InputMaskEmitsOptions as AInputMaskEmits,
} from 'primevue/inputmask'

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
 * The model value type carried by the input-mask element's wide props.
 */
type InputMaskModel = Required<InputMaskProps>['modelValue']

/**
 * Props for the input-mask element blueprint, parameterized by the
 * model-driving type arguments (`translate` / `languages`). Plain usage
 * (`InputMaskProps`) keeps every member wide, so no separate plain-props alias
 * is needed.
 */
export interface InputMaskProps<
  T extends string = 'input-mask',
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  S = InputMaskSlots,
  P = InputMaskParts,
  C = InputMaskClasses,
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
      AInputMaskProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'id'
      | 'invalid'
      | 'fluid'
      | 'disabled'
      | 'placeholder'
      | 'readonly'
      | 'class'
      | 'mask'
    > {
  /**
   * **This replaces the original PrimeVue `mask` prop.** Mask pattern for the
   * input. Supports dynamic text props.
   *
   * @replaces mask
   */
  mask?: TProp
}

/**
 * Events emitted by the input-mask element.
 */
export interface InputMaskEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<InputMaskModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    KeyEmits<TContext>,
    InputEmits<InputMaskModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AInputMaskEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the input-mask element blueprint.
 */
export interface InputMaskSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the input-mask element blueprint.
 */
export interface InputMaskParts extends BaseFieldElementParts {}

/**
 * CSS classes for the input-mask element blueprint.
 */
export interface InputMaskClasses extends BaseElementClasses {}

/**
 * Part-keyed attribute bindings of the input-mask element blueprint, extended
 * by the consuming component via `useBindings`.
 */
export interface InputMaskBindings extends BaseElementBindings {}

/**
 * Augmentable public API surface for input-mask-based components.
 */
export interface InputMaskExpose extends BaseElementExpose, InputMaskApi {}

/**
 * Factory API produced by the input-mask blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type InputMaskApi<
  TProps extends InputMaskProps<string> = InputMaskProps<string>,
> = TranslatableModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue InputMask events and slots to forward from the Vueform adapter to
 * the underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change', 'paste', 'complete'],
} as const

/**
 * Builds the input-mask factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends InputMaskProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<InputMaskEmits>
) {
  const api = useFeatures(
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
    .use(makeInput({ canonicalDomValue: false }))
    .use(makeKeyHandlers())
    .use(makeLoading())
    .use(makeTooltip())
    .use(makeFloatLabel())
    .use(makeIfta())
    .use(makeInfo())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()

  /**
   * The resolved mask pattern.
   */
  const mask = useDynamicProp('mask', props, {
    localize: true,
    string: true,
  })

  return {
    ...api,
    mask,
  }
}

/**
 * Default prop values for the input-mask blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<InputMaskProps>()({
  type: 'input-mask',
  layout: true,
  translate: false,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
