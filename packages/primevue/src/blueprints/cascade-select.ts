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
  type BaseElementParts,
  type BaseElementProps,
  type BaseElementSlots,
  type DefineEvents,
  type LooseRequired,
  type AriaProps,
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
  type InputEmits,
  type ValidationEmits,
  aliasProps,
  makeLoading,
  makeItems,
} from '@vueform/core'
import {
  makeFloatLabel,
  makeIfta,
  makeInfo,
  makeAria,
  type ModelPropsWithDefaultValue,
  type FloatLabelProps,
  type IftaLabelProps,
  type InfoProps,
} from '@/features'
import type {
  AllowedCascadeOptionGroupChildren,
  CascadeOptionGroupChildrenProp,
  OptionsProps,
  OptionsModelProp,
  OptionValueProp,
  AllowsOptionKeyProps,
  OptionsProp,
  OptionsModelApi,
  OptionsGenericsBrand,
} from '@/features/options'
import { optionItemAliases } from '@/helpers'
import type { ForwardedEmits } from '@/types'
import type {
  CascadeSelectProps as ACascadeSelectProps,
  CascadeSelectEmitsOptions as ACascadeSelectEmits,
  CascadeSelectChangeEvent,
} from 'primevue/cascadeselect'

/**
 * Plain props type for the cascade-select element blueprint — the widest
 * instantiation of `CascadeSelectProps`. Use this whenever "the props of a
 * cascade-select" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `CascadeSelectApi` type parameters.
 */
type LooseCascadeSelectProps = CascadeSelectProps<
  string,
  OptionsProp,
  OptionValueProp,
  CascadeOptionGroupChildrenProp
>

/**
 * Generic props interface for the cascade-select element blueprint,
 * parameterized by the option-driving type arguments. Reach for
 * `LooseCascadeSelectProps` instead when no narrowing is needed.
 */
export interface CascadeSelectProps<
  T extends string = 'cascade-select',
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends CascadeOptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
  S = CascadeSelectSlots,
  P = CascadeSelectParts,
  C = CascadeSelectClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<
      OptionsModelProp<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        false,
        TModel,
        TOptionValueReturn
      >,
      TContext
    >,
    ValidationProps<TContext>,
    AddonsProps<TContext>,
    IconsProps<TContext>,
    AddonableProps,
    AriaProps,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext>,
    FloatLabelProps,
    IftaLabelProps,
    InfoProps,
    /* @vue-ignore */ OptionsGenericsBrand<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TOptionValueReturn
    >,
    Omit<
      OptionsProps<
        TOptions,
        TOptionValueKey,
        any,
        TOptionValueReturn,
        TContext
      >,
      'optionGroupChildren'
    >,
    /* @vue-ignore */ Omit<
      ACascadeSelectProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'fluid'
      | 'formControl'
      | 'disabled'
      | 'placeholder'
      | 'loading'
      | 'options'
      | 'optionLabel'
      | 'optionValue'
      | 'optionDisabled'
      | 'optionGroupLabel'
      | 'optionGroupChildren'
    > {
  /**
   * Resolves nested children for each cascade level. Accepts a string key, a
   * nested path array (e.g. `['states', 'cities']`), or a mapper function.
   *
   * The intersection arm infers keys into `TGroupChildren` while rejecting keys
   * missing from the group shape (the generic itself is only bounded by the
   * simple `CascadeOptionGroupChildrenProp`). The bare
   * `AllowedCascadeOptionGroupChildren` arm keeps keys assignable on the
   * defaulted schema surface where `TGroupChildren` is still `undefined`.
   */
  optionGroupChildren?: AllowsOptionKeyProps<TOptions> extends true
    ?
        | (TGroupChildren & AllowedCascadeOptionGroupChildren<TOptions>)
        | AllowedCascadeOptionGroupChildren<TOptions>
    : never
}

/**
 * Events emitted by the cascade-select element.
 */
export interface CascadeSelectEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<CascadeSelectChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ACascadeSelectEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the cascade-select element blueprint.
 */
export interface CascadeSelectSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the cascade-select element blueprint.
 */
export interface CascadeSelectParts extends BaseElementParts {}

/**
 * CSS classes for the cascade-select element blueprint.
 */
export interface CascadeSelectClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for cascade-select-based components.
 */
export interface CascadeSelectExpose
  extends BaseElementExpose, CascadeSelectApi {}

/**
 * Factory API produced by the cascade-select blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `CascadeSelectApi<VfCascadeSelectProps<typeof options, 'id'>>`). Prefer this
 * over `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose /
 * Context layers, extensions).
 */
export type CascadeSelectApi<
  TProps extends LooseCascadeSelectProps = LooseCascadeSelectProps,
> = OptionsModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue CascadeSelect events and slots to forward from the Vueform adapter
 * to the underlying PrimeVue component.
 */
export const forwards = {
  events: [
    'value-change',
    'group-change',
    'before-show',
    'before-hide',
    'show',
    'hide',
  ],
  slots: [
    'option',
    'value',
    'dropdownicon',
    'loadingicon',
    'optiongroupicon',
    'header',
    'footer',
    'clearicon',
  ],
} as const

/**
 * Builds the cascade-select factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`. Passing `blueprint` as a value lets call-site
 * inference instantiate the API at the SFC's concrete props — the only
 * alternative to a per-blueprint wrapper hosting `typeof blueprint<TProps>`,
 * since conditional-type inference on a captured factory erases its type
 * parameters to constraints (verified empirically).
 */
export function blueprint<TProps extends LooseCascadeSelectProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<CascadeSelectEmits>
) {
  const api = useFeatures(
    aliasProps(props, {
      default: 'defaultValue',
      ...optionItemAliases,
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
    .use(makeItems())
    .use(makeFloatLabel())
    .use(makeIfta())
    .use(makeInfo())
    .use(makeAria())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()

  /**
   * Shows the cascade-select overlay.
   *
   * @param isFocus Whether to focus the component after showing.
   */
  const show = (isFocus?: boolean) => {
    api.input.value?.show(isFocus)
  }

  /**
   * Hides the cascade-select overlay.
   *
   * @param isFocus Whether to focus the component after hiding.
   */
  const hide = (isFocus?: boolean) => {
    api.input.value?.hide(isFocus)
  }

  return { ...api, show, hide }
}

/**
 * Default prop values for the cascade-select blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<CascadeSelectProps>()({
  type: 'cascade-select',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  showRequired: undefined,
  optionsDebounce: 300,
  untrackOn: undefined,
})
