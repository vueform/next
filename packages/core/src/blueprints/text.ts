import { useFeatures } from '#src/composables'
import {
  makeAddons,
  makeAutocomplete,
  makeElement,
  makeIcons,
  makeInteraction,
  makeLoading,
  makeMultilingual,
  makeTData,
  makeKeyHandlers,
  makeDisabled,
  makeReadonly,
  makePlaceholder,
  makeInput,
  makeProvider,
  makeLayout,
  type ModelPropsWithDefault,
  type AddonsProps,
  type IconsProps,
  type BaseElementEmits,
  type BaseElementProps,
  type ExpressionProps,
  type TranslateProps,
  type BaseFieldElementParts,
  type BaseElementClasses,
  type BaseElementBindings,
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
} from '#src/features'
import { defineDefaults, type DefineEvents } from '#src/helpers'
import type {
  InputModeProp,
  InputTypeProp,
  LanguagesProp,
  LooseRequired,
} from '#src/types'

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
    ReadonlyProps<TContext>,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext> {
  /**
   * The HTML input type (e.g. text, email, password).
   */
  inputType?: InputTypeProp

  /**
   * The HTML `inputmode` attribute hinting which virtual keyboard mobile
   * browsers should show.
   */
  inputmode?: InputModeProp

  /**
   * The HTML `autocomplete` attribute value for the input. When omitted, the
   * element's name is used if it is a valid autofill token (e.g. `email`,
   * `tel`, `postal-code`).
   */
  autocomplete?: string

  /**
   * Whether the value is always cast to a string.
   */
  string?: boolean
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
export interface TextParts extends BaseFieldElementParts {}

/**
 * CSS classes for the text element blueprint.
 */
export interface TextClasses extends BaseElementClasses {}

/**
 * Augmentable part-keyed binding definitions (a11y, state markers, and
 * other per-part attrs) of the text blueprint.
 */
export interface TextBindings extends BaseElementBindings {}

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
    .use(makeInput())
    .use(makeKeyHandlers())
    .use(makeLoading())
    .use(makeAutocomplete())
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
  string: false,
  translate: false,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
