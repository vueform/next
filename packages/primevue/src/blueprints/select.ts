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
  makeLoading,
  makeItems,
  aliasProps,
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
  type ValidationEmits,
  type InputEmits,
  type MultipleProps,
} from '@vueform/core'
import {
  makeFloatLabel,
  makeIfta,
  makeInfo,
  makeAria,
  type ModelPropsWithDefaultValue,
  type OptionGroupChildrenProp,
  type FloatLabelProps,
  type IftaLabelProps,
  type InfoProps,
  type OptionsProps,
  type OptionsModelProp,
  type OptionValueProp,
  type OptionsProp,
  type OptionsModelApi,
} from '@/features'
import { optionItemAliases } from '@/helpers'
import type { ForwardedEmits } from '@/types'
import type {
  SelectProps as ASelectProps,
  SelectEmitsOptions as ASelectEmits,
  SelectChangeEvent,
} from 'primevue/select'

/**
 * Plain props type for the select element blueprint — the widest instantiation
 * of `SelectProps`. Use this whenever "the props of a select" is meant without
 * generic narrowing; it also serves as the constraint for `blueprint` /
 * `SelectApi` type parameters.
 */
type LooseSelectProps = SelectProps<
  string,
  OptionsProp,
  OptionValueProp,
  OptionGroupChildrenProp,
  boolean
>

/**
 * Generic props interface for the select element blueprint, parameterized by
 * the option-driving type arguments. Reach for `LooseSelectProps` instead when
 * no narrowing is needed.
 */
export interface SelectProps<
  T extends string = 'select',
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
  S = SelectSlots,
  P = SelectParts,
  C = SelectClasses,
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
        TMultiple,
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
    OptionsProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TOptionValueReturn,
      TContext
    >,
    MultipleProps<TMultiple>,
    /* @vue-ignore */ Omit<
      ASelectProps,
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
    > {}

/**
 * Events emitted by the select element.
 */
export interface SelectEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<SelectChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ASelectEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the select element blueprint.
 */
export interface SelectSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the select element blueprint.
 */
export interface SelectParts extends BaseElementParts {}

/**
 * CSS classes for the select element blueprint.
 */
export interface SelectClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for select-based components.
 */
export interface SelectExpose extends BaseElementExpose, SelectApi {}

/**
 * Factory API produced by the select blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `SelectApi<VfSelectProps<typeof options, 'id'>>`). Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose / Context
 * layers, extensions).
 */
export type SelectApi<TProps extends LooseSelectProps = LooseSelectProps> =
  OptionsModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue Select events and slots to forward from the Vueform adapter to the
 * underlying PrimeVue component.
 */
export const forwards = {
  events: [
    'value-change',
    'before-show',
    'before-hide',
    'show',
    'hide',
    'filter',
  ],
  slots: [
    'value',
    'header',
    'footer',
    'option',
    'optiongroup',
    'emptyfilter',
    'empty',
    'content',
    'loader',
    'clearicon',
    'dropdownicon',
    'loadingicon',
    'filtericon',
  ],
} as const

/**
 * Builds the select factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`. Passing `blueprint` as a value lets call-site
 * inference instantiate the API at the SFC's concrete props — the only
 * alternative to a per-blueprint wrapper hosting `typeof blueprint<TProps>`,
 * since conditional-type inference on a captured factory erases its type
 * parameters to constraints (verified empirically).
 */
export function blueprint<TProps extends LooseSelectProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<SelectEmits>
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
   * Shows the select overlay.
   *
   * @param isFocus Whether to focus the component after showing.
   */
  const show = (isFocus?: boolean) => {
    api.input.value?.show(isFocus)
  }

  /**
   * Hides the select overlay.
   *
   * @param isFocus Whether to focus the component after hiding.
   */
  const hide = (isFocus?: boolean) => {
    api.input.value?.hide(isFocus)
  }

  return { ...api, show, hide }
}

/**
 * Default prop values for the select blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<SelectProps>()({
  type: 'select',
  layout: true,
  multiple: false,
  disabled: false,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
