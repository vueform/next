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
import type {
  MultiSelectProps as AMultiSelectProps,
  MultiSelectEmitsOptions as AMultiSelectEmits,
  MultiSelectChangeEvent,
} from 'primevue/multiselect'
import { ref } from 'vue'

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
} from '#primevue/features'
import { optionItemAliases } from '#primevue/helpers'
import type { ForwardedEmits } from '#primevue/types'

/**
 * Plain props type for the multi-select element blueprint — the widest
 * instantiation of `MultiSelectProps`. Use this whenever "the props of a
 * multi-select" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `MultiSelectApi` type parameters.
 */
type LooseMultiSelectProps = MultiSelectProps<
  string,
  OptionsProp,
  OptionValueProp,
  OptionGroupChildrenProp
>

/**
 * Generic props interface for the multi-select element blueprint, parameterized
 * by the option-driving type arguments. Reach for `LooseMultiSelectProps`
 * instead when no narrowing is needed. Selection is always multiple.
 */
export interface MultiSelectProps<
  T extends string = 'multi-select',
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
  S = MultiSelectSlots,
  P = MultiSelectParts,
  C = MultiSelectClasses,
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
        true,
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
    /* @vue-ignore */ Omit<
      AMultiSelectProps,
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
 * Events emitted by the multi-select element.
 */
export interface MultiSelectEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<MultiSelectChangeEvent['value'], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AMultiSelectEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the multi-select element blueprint.
 */
export interface MultiSelectSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the multi-select element blueprint.
 */
export interface MultiSelectParts extends BaseElementParts {}

/**
 * CSS classes for the multi-select element blueprint.
 */
export interface MultiSelectClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for multi-select-based components.
 */
export interface MultiSelectExpose extends BaseElementExpose, MultiSelectApi {}

/**
 * Factory API produced by the multi-select blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `MultiSelectApi<VfMultiSelectProps<typeof options, 'id'>>`). Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose / Context
 * layers, extensions).
 */
export type MultiSelectApi<
  TProps extends LooseMultiSelectProps = LooseMultiSelectProps,
> = OptionsModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue MultiSelect events and slots to forward from the Vueform adapter to
 * the underlying PrimeVue component.
 */
export const forwards = {
  events: [
    'value-change',
    'before-show',
    'before-hide',
    'show',
    'hide',
    'filter',
    'selectall-change',
  ],
  slots: [
    'value',
    'chip',
    'header',
    'footer',
    'option',
    'optiongroup',
    'emptyfilter',
    'empty',
    'content',
    'loader',
    'chipicon',
    'headercheckboxicon',
    'filtericon',
    'itemcheckboxicon',
    'loadingicon',
    'clearicon',
    'dropdownicon',
  ],
} as const

/**
 * Builds the multi-select factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`. Passing `blueprint` as a value lets call-site
 * inference instantiate the API at the SFC's concrete props — the only
 * alternative to a per-blueprint wrapper hosting `typeof blueprint<TProps>`,
 * since conditional-type inference on a captured factory erases its type
 * parameters to constraints (verified empirically).
 */
export function blueprint<TProps extends LooseMultiSelectProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<MultiSelectEmits>
) {
  const api = useFeatures(
    aliasProps(props, {
      default: 'defaultValue',
      ...optionItemAliases,
    }),
    events,
    { nullValue: ref([]) }
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
      makeItems({
        multiple: true,
      })
    )
    .use(makeFloatLabel())
    .use(makeIfta())
    .use(makeInfo())
    .use(makeAria())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()

  /**
   * Shows the multi-select overlay.
   *
   * @param isFocus Whether to focus the component after showing.
   */
  const show = (isFocus?: boolean) => {
    api.input.value?.show(isFocus)
  }

  /**
   * Hides the multi-select overlay.
   *
   * @param isFocus Whether to focus the component after hiding.
   */
  const hide = (isFocus?: boolean) => {
    api.input.value?.hide(isFocus)
  }

  return { ...api, show, hide }
}

/**
 * Default prop values for the multi-select blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<MultiSelectProps>()({
  type: 'multi-select',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
