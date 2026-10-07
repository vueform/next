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
  type BaseElementParts,
  type BaseElementProps,
  type BaseElementSlots,
  type DefineEvents,
  type LooseRequired,
  type AriaProps,
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
  type TranslatableModelApi,
  aliasProps,
} from '@vueform/core'
import type {
  TextareaProps as ATextareaProps,
  TextareaEmitsOptions as ATextareaEmits,
} from 'primevue/textarea'

import {
  makeFloatLabel,
  makeIfta,
  makeInfo,
  makeTooltip,
  makeTAria,
  type ModelPropsWithDefaultValue,
  type FloatLabelProps,
  type IftaLabelProps,
  type InfoProps,
  type TooltipProps,
} from '#src/features'
import type { ForwardedEmits } from '#src/types'

/**
 * The model value type carried by the textarea element's wide props.
 */
type TextareaModel = Required<TextareaProps>['modelValue']

/**
 * Props for the textarea element blueprint, parameterized by the model-driving
 * type arguments (`translate` / `languages`). Plain usage (`TextareaProps`)
 * keeps every member wide, so no separate plain-props alias is needed.
 */
export interface TextareaProps<
  T extends string = 'textarea',
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  S = TextareaSlots,
  P = TextareaParts,
  C = TextareaClasses,
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
    AriaProps,
    ReadonlyProps<TContext>,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext>,
    FloatLabelProps,
    IftaLabelProps,
    InfoProps,
    TooltipProps,
    /* @vue-ignore */ Omit<
      ATextareaProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'fluid'
      | 'formControl'
      | 'id'
      | 'disabled'
      | 'placeholder'
      | 'readonly'
      | 'translate'
    > {}

/**
 * Events emitted by the textarea element.
 */
export interface TextareaEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<TextareaModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    KeyEmits<TContext>,
    InputEmits<TextareaModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ATextareaEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the textarea element blueprint.
 */
export interface TextareaSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the textarea element blueprint.
 */
export interface TextareaParts extends BaseElementParts {}

/**
 * CSS classes for the textarea element blueprint.
 */
export interface TextareaClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for textarea-based components.
 */
export interface TextareaExpose extends BaseElementExpose, TextareaApi {}

/**
 * Factory API produced by the textarea blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type TextareaApi<
  TProps extends TextareaProps<string> = TextareaProps<string>,
> = TranslatableModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue Textarea events and slots to forward from the Vueform adapter to the
 * underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change'],
} as const

/**
 * Builds the textarea factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends TextareaProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<TextareaEmits>
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
    .use(makeTAria())
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
 * Default prop values for the textarea blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<TextareaProps>()({
  type: 'textarea',
  layout: true,
  translate: false,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
