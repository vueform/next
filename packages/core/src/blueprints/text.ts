import { useFeatures } from '#core/composables'
import {
  makeAddons,
  makeElement,
  makeIcons,
  makeInteraction,
  makeLoading,
  makeMultilingual,
  makeTData,
  makeTAria,
  makeKeyHandlers,
  makeDisabled,
  makeReadonly,
  makePlaceholder,
  makeInput,
  makeProvider,
  makeLayout,
  type AriaProps,
  type ModelPropsWithDefault,
  type AddonsProps,
  type IconsProps,
  type BaseElementEmits,
  type BaseElementProps,
  type ExpressionProps,
  type TranslateProps,
  type BaseElementParts,
  type BaseElementClasses,
  type BaseElementSlots,
  type BaseElementExpose,
  type AddonableProps,
  type TValidationProps,
  type ReadonlyProps,
  type DisabledProps,
  type PlaceholderProps,
  type LoadingProps,
  type LayoutProps,
  type ModelEmits,
  type TranslateModelProp,
  type InteractionEmits,
  type KeyEmits,
  type InputEmits,
  type ValidationEmits,
  type TranslatableModelApi,
} from '#core/features'
import { defineDefaults, type DefineEvents } from '#core/helpers'
import type { InputTypeProp, LanguagesProp, LooseRequired } from '#core/types'

/**
 * The model value type carried by the text element's wide props.
 */
type TextModel = Required<TextProps>['modelValue']

/**
 * Props for the text element blueprint, parameterized by the model-driving type
 * arguments (`translate` / `languages`). Plain usage (`TextProps`) keeps every
 * member wide, so no separate plain-props alias is needed.
 */
export interface TextProps<
  T extends string = 'text',
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  S = TextSlots,
  P = TextParts,
  C = TextClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefault<TranslateModelProp<TTranslate, TLanguages>, TContext>,
    TValidationProps<TContext>,
    TranslateProps<TTranslate, TLanguages>,
    AddonsProps<TContext>,
    IconsProps<TContext>,
    AddonableProps,
    AriaProps,
    ReadonlyProps<TContext>,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext> {
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
 * Events emitted by the text element.
 */
export interface TextEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<TextModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    KeyEmits<TContext>,
    InputEmits<TextModel, TContext> {}

/**
 * Slots available on the text element blueprint.
 */
export interface TextSlots<TContext = any> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the text element blueprint.
 */
export interface TextParts extends BaseElementParts {}

/**
 * CSS classes for the text element blueprint.
 */
export interface TextClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for text-based components.
 */
export interface TextExpose extends BaseElementExpose, TextApi {}

/**
 * Factory API produced by the text blueprint's `blueprint` function, optionally
 * parameterized by concrete props. Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites.
 */
export type TextApi<TProps extends TextProps<string> = TextProps<string>> =
  // The value is always the text scalar — the model itself when not
  // translating, the active language's entry when translating.
  TranslatableModelApi<
    ReturnType<typeof blueprint>,
    TProps,
    string | number | null
  >

/**
 * Builds the text factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends TextProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<TextEmits>
) {
  return useFeatures(props, events)
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
    .use(makeProvider())
    .build()
}

/**
 * Default prop values for the text blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<TextProps>()({
  type: 'text',
  layout: true,
  inputType: 'text',
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
