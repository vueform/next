import { useFeatures } from '#src/composables'
import {
  makeAddons,
  makeAutocomplete,
  makeAutogrow,
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
  type BaseElementExpose,
  type BaseElementBindings,
  type BaseElementSlots,
  type TValidationProps,
  type ReadonlyProps,
  type DisabledProps,
  type LoadingProps,
  type PlaceholderProps,
  type LayoutProps,
  type ModelEmits,
  type TranslatableModel,
  type TranslateModelProp,
  type InteractionEmits,
  type KeyEmits,
  type InputEmits,
  type ValidationEmits,
  type TranslatableModelApi,
} from '#src/features'
import { defineDefaults, type DefineEvents } from '#src/helpers'
import type { InputModeProp, LanguagesProp, LooseRequired } from '#src/types'

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
    ModelPropsWithDefault<TranslateModelProp<TTranslate, TLanguages>, TContext>,
    TValidationProps<TContext>,
    TranslateProps<TTranslate, TLanguages>,
    AddonsProps<TContext>,
    IconsProps<TContext>,
    ReadonlyProps<TContext>,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext> {
  /**
   * The number of visible text rows for the textarea.
   */
  rows?: number

  /**
   * The HTML `inputmode` attribute hinting which virtual keyboard mobile
   * browsers should show.
   */
  inputmode?: InputModeProp

  /**
   * The HTML `autocomplete` attribute value for the textarea. When omitted,
   * the element's name is used if it is a valid autofill token (e.g.
   * `street-address`).
   */
  autocomplete?: string // @todo: is this needed for textarea?

  /**
   * Whether the textarea automatically grows to fit its content. When true, the
   * height adjusts as lines are added or removed.
   */
  autogrow?: boolean

  /**
   * Whether the native browser resize handle is enabled on the textarea.
   */
  resize?: boolean

  /**
   * Whether the value is always cast to a string.
   */
  string?: boolean
}

/**
 * Events emitted by the textarea element.
 */
export interface TextareaEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<TranslatableModel, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext>,
    KeyEmits<TContext>,
    InputEmits<TranslatableModel, TContext> {}

/**
 * Slots available on the textarea element blueprint.
 */
export interface TextareaSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the textarea element blueprint.
 */
export interface TextareaParts extends BaseFieldElementParts {}

/**
 * CSS classes for the textarea element blueprint.
 */
export interface TextareaClasses extends BaseElementClasses {}

/**
 * Augmentable part-keyed binding definitions (a11y, state markers, and
 * other per-part attrs) of the textarea blueprint.
 */
export interface TextareaBindings extends BaseElementBindings {}

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
> =
  // The value is always the textarea scalar — the model itself when not
  // translating, the active language's entry when translating.
  TranslatableModelApi<
    ReturnType<typeof blueprint>,
    TProps,
    string | number | null
  >

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
    .use(makeAutogrow())
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
  disabled: false,
  readonly: false,
  string: false,
  translate: false,
  autogrow: true,
  resize: false,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  untrackOn: undefined,
})
