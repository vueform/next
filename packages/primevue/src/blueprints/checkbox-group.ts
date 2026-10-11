import {
  defineDefaults,
  makeCheckboxesAria,
  makeData,
  makeDisabled,
  makeElement,
  makeHolderProvider,
  makeInteraction,
  makeLayout,
  useFeatures,
  type BaseElementClasses,
  type BaseElementEmits,
  type BaseElementExpose,
  type BaseElementParts,
  type BaseElementProps,
  type BaseElementSlots,
  type ContainerProps,
  type DefineEvents,
  type DisabledProps,
  type InteractionEmits,
  type LayoutProps,
  type LooseRequired,
  type ModelEmits,
  type StackedProps,
  type ValidationEmits,
  type ValidationProps,
  type AlignedProps,
  aliasProps,
  makeItems,
} from '@vueform/core'
import { ref } from 'vue'

import {
  makeInfo,
  type ModelPropsWithDefaultValue,
  type InfoProps,
} from '#src/features'
import type {
  OptionGroupChildrenProp,
  OptionsProps,
  OptionsModelProp,
  OptionValueProp,
  OptionsProp,
  OptionsModelApi,
} from '#src/features/options'
import { optionItemAliases } from '#src/helpers'

/**
 * Plain props type for the checkbox-group element blueprint — the widest
 * instantiation of `CheckboxGroupProps`. Use this whenever "the props of a
 * checkbox-group" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `CheckboxGroupApi` type parameters.
 */
type LooseCheckboxGroupProps = CheckboxGroupProps<
  string,
  OptionsProp,
  OptionValueProp,
  OptionGroupChildrenProp
>

/**
 * Generic props interface for the checkbox-group element blueprint,
 * parameterized by the option-driving type arguments. Reach for
 * `LooseCheckboxGroupProps` instead when no narrowing is needed.
 *
 * PrimeVue option prop names (`options` / `optionValue` /
 * `optionGroupChildren`) are kept via `OptionsProps`; generics use the
 * PrimeVue-named `TOptions` / `TOptionValueKey` / `TGroupChildren`.
 */
export interface CheckboxGroupProps<
  T extends string = 'checkbox-group',
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
  S = CheckboxGroupSlots,
  P = CheckboxGroupParts,
  C = CheckboxGroupClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
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
    ContainerProps,
    DisabledProps<TContext>,
    OptionsProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TOptionValueReturn,
      TContext
    >,
    StackedProps,
    InfoProps,
    AlignedProps {}

/**
 * Events emitted by the checkbox-group element.
 */
export interface CheckboxGroupEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext> {}

/**
 * Slots available on the checkbox-group element blueprint.
 */
export interface CheckboxGroupSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the checkbox-group element blueprint.
 */
export interface CheckboxGroupParts extends BaseElementParts {}

/**
 * CSS classes for the checkbox-group element blueprint.
 */
export interface CheckboxGroupClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for checkbox-group-based components.
 */
export interface CheckboxGroupExpose
  extends BaseElementExpose, CheckboxGroupApi {}

/**
 * Factory API produced by the checkbox-group blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `CheckboxGroupApi<VfCheckboxGroupProps<typeof options, 'id'>>`). Prefer this
 * over `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose /
 * Context layers, extensions).
 */
export type CheckboxGroupApi<
  TProps extends LooseCheckboxGroupProps = LooseCheckboxGroupProps,
> = OptionsModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * Builds the checkbox-group factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`. Passing `blueprint` as a value lets call-site
 * inference instantiate the API at the SFC's concrete props — the only
 * alternative to a per-blueprint wrapper hosting `typeof blueprint<TProps>`,
 * since conditional-type inference on a captured factory erases its type
 * parameters to constraints (verified empirically).
 */
export function blueprint<TProps extends LooseCheckboxGroupProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<CheckboxGroupEmits>
) {
  return useFeatures(
    aliasProps(props, {
      default: 'defaultValue',
      ...optionItemAliases,
    }),
    events,
    {
      nullValue: ref([]),
      multiple: true,
    }
  )
    .use(makeElement())
    .use(makeLayout())
    .use(makeInteraction())
    .use(makeDisabled())
    .use(makeData())
    .use(
      makeItems({
        multiple: true,
      })
    )
    .use(makeCheckboxesAria())
    .use(makeInfo())
    .use(
      makeHolderProvider({
        multiple: true,
        valueProp: 'trueValue',
      })
    )
    .build()
}

/**
 * Default prop values for the checkbox-group blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<CheckboxGroupProps>()({
  type: 'checkbox-group',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
})
