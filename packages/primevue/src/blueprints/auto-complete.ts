import {
  defineDefaults,
  useFeatures,
  makeElement,
  makeLayout,
  makeAddons,
  makeIcons,
  makeInteraction,
  makeDisabled,
  makePlaceholder,
  makeData,
  makeInput,
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
  type ValidationProps,
  type AddonableProps,
  type DisabledProps,
  type PlaceholderProps,
  type LoadingProps,
  type LayoutProps,
  type ModelEmits,
  type InteractionEmits,
  type ValidationEmits,
  type InputEmits,
  type MultipleProps,
  type ModelApi,
  aliasProps,
  makeLoading,
} from '@vueform/core'
import type {
  AutoCompleteProps as AAutoCompleteProps,
  AutoCompleteEmitsOptions as AAutoCompleteEmits,
  AutoCompleteChangeEvent,
  AutoCompleteCompleteEvent,
} from 'primevue/autocomplete'

import {
  makeFloatLabel,
  makeIfta,
  makeInfo,
  makeSuggestions,
  type ModelPropsWithDefaultValue,
  type FloatLabelProps,
  type IftaLabelProps,
  type InfoProps,
  type SuggestionsProps,
  type SuggestionsProp,
  type OptionsModelProp,
} from '#src/features'
import type { ForwardedEmits } from '#src/types'

/**
 * Plain props type for the auto-complete element blueprint — the widest
 * instantiation of `AutoCompleteProps`. Use this whenever "the props of an
 * auto-complete" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `AutoCompleteApi` type parameters.
 */
type LooseAutoCompleteProps = AutoCompleteProps<
  string,
  SuggestionsProp,
  boolean
>

/**
 * Generic props interface for the auto-complete element blueprint,
 * parameterized by the suggestion-driving type arguments. Reach for
 * `LooseAutoCompleteProps` instead when no narrowing is needed. There is no
 * `optionValue` — the model is the suggestion item itself.
 */
export interface AutoCompleteProps<
  T extends string = 'auto-complete',
  TSuggestions extends SuggestionsProp = SuggestionsProp,
  TMultiple extends boolean = false,
  TModel = any,
  S = AutoCompleteSlots,
  P = AutoCompleteParts,
  C = AutoCompleteClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<
      OptionsModelProp<
        TSuggestions,
        undefined,
        undefined,
        TMultiple,
        TModel,
        unknown
      >,
      TContext
    >,
    ValidationProps<TContext>,
    AddonsProps<TContext>,
    IconsProps<TContext>,
    AddonableProps,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext>,
    FloatLabelProps,
    IftaLabelProps,
    InfoProps,
    MultipleProps<TMultiple>,
    SuggestionsProps<TSuggestions, TContext>,
    /* @vue-ignore */ Omit<
      AAutoCompleteProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'fluid'
      | 'formControl'
      | 'disabled'
      | 'placeholder'
      | 'loading'
      | 'multiple'
      | 'suggestions'
      | 'optionLabel'
      | 'optionDisabled'
      | 'minLength'
    >,
    Pick<AAutoCompleteProps, 'minLength'> {}

/**
 * Events emitted by the auto-complete element.
 */
export interface AutoCompleteEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<AutoCompleteChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AAutoCompleteEmits,
      (typeof forwards.events)[number],
      TContext
    > {
  /**
   * Callback to invoke to search for suggestions.
   *
   * @param event Custom complete event.
   * @param context$ The component context.
   */
  complete: [event: AutoCompleteCompleteEvent, context$: TContext]
}

/**
 * Slots available in the auto-complete element blueprint.
 */
export interface AutoCompleteSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the auto-complete element blueprint.
 */
export interface AutoCompleteParts extends BaseFieldElementParts {}

/**
 * CSS classes for the auto-complete element blueprint.
 */
export interface AutoCompleteClasses extends BaseElementClasses {}

/**
 * Part-keyed attribute bindings of the auto-complete element blueprint,
 * extended by the consuming component via `useBindings`.
 */
export interface AutoCompleteBindings extends BaseElementBindings {}

/**
 * Augmentable public API surface for auto-complete-based components.
 */
export interface AutoCompleteExpose
  extends BaseElementExpose, AutoCompleteApi {}

/**
 * Factory API produced by the auto-complete blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose / Context
 * layers, extensions).
 */
export type AutoCompleteApi<
  TProps extends LooseAutoCompleteProps = LooseAutoCompleteProps,
> = ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue AutoComplete events and slots to forward from the Vueform adapter to
 * the underlying PrimeVue component.
 */
export const forwards = {
  events: [
    'value-change',
    'option-select',
    'option-unselect',
    'dropdown-click',
    'clear',
    'before-show',
    'before-hide',
    'show',
    'hide',
  ],
  slots: [
    'chip',
    'header',
    'footer',
    'option',
    'optiongroup',
    'content',
    'loader',
    'empty',
    'dropdownicon',
    'chipicon',
    'clearicon',
    'dropdown',
  ],
} as const

/**
 * Builds the auto-complete factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`. Passing `blueprint` as a value lets call-site
 * inference instantiate the API at the SFC's concrete props — the only
 * alternative to a per-blueprint wrapper hosting `typeof blueprint<TProps>`,
 * since conditional-type inference on a captured factory erases its type
 * parameters to constraints (verified empirically).
 */
export function blueprint<TProps extends LooseAutoCompleteProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<AutoCompleteEmits>
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
    .use(makePlaceholder())
    .use(makeData())
    .use(makeInput())
    .use(makeLoading())
    .use(
      makeSuggestions({
        conditions: false,
      })
    )
    .use(makeFloatLabel())
    .use(makeIfta())
    .use(makeInfo())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()

  /**
   * Shows the auto-complete overlay.
   *
   * @param isFocus Whether to focus the component after showing.
   */
  const show = (isFocus?: boolean) => {
    api.inputRef.value?.show(isFocus)
  }

  /**
   * Hides the auto-complete overlay.
   *
   * @param isFocus Whether to focus the component after hiding.
   */
  const hide = (isFocus?: boolean) => {
    api.inputRef.value?.hide(isFocus)
  }

  return { ...api, show, hide }
}

/**
 * Default prop values for the auto-complete blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<AutoCompleteProps>()({
  type: 'auto-complete',
  layout: true,
  multiple: false,
  conditions: undefined,
  submit: true,
  maxErrors: 1,
  bail: true,
  optionsDebounce: 300,
  untrackOn: undefined,
})
