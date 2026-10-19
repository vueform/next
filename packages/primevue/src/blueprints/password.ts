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
  type BaseElementA11y,
  type BaseElementModifiers,
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
  type TranslatableModelApi,
  aliasProps,
} from '@vueform/core'
import type {
  PasswordProps as APasswordProps,
  PasswordEmitsOptions as APasswordEmits,
} from 'primevue/password'

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
 * The model value type carried by the password element's wide props.
 */
type PasswordModel = Required<PasswordProps>['modelValue']

/**
 * Props for the password element blueprint, parameterized by the model-driving
 * type arguments (`translate` / `languages`). Plain usage (`PasswordProps`)
 * keeps every member wide, so no separate plain-props alias is needed.
 */
export interface PasswordProps<
  T extends string = 'password',
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  S = PasswordSlots,
  P = PasswordParts,
  C = PasswordClasses,
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
      APasswordProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'fluid'
      | 'formControl'
      | 'disabled'
      | 'placeholder'
      | 'id'
      | 'readonly'
      | 'translate'
      | 'type'
      | 'autocomplete'
    > {}

/**
 * Events emitted by the password element.
 */
export interface PasswordEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<PasswordModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    KeyEmits<TContext>,
    InputEmits<PasswordModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      APasswordEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the password element blueprint.
 */
export interface PasswordSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the password element blueprint.
 */
export interface PasswordParts extends BaseFieldElementParts {}

/**
 * CSS classes for the password element blueprint.
 */
export interface PasswordClasses extends BaseElementClasses {}

/**
 * Styling modifiers of the password element blueprint.
 */
export interface PasswordModifiers extends BaseElementModifiers {}

/**
 * Accessibility bindings of the password element blueprint.
 */
export interface PasswordA11y extends BaseElementA11y {}

/**
 * Augmentable public API surface for password-based components.
 */
export interface PasswordExpose extends BaseElementExpose, PasswordApi {}

/**
 * Factory API produced by the password blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type PasswordApi<
  TProps extends PasswordProps<string> = PasswordProps<string>,
> = TranslatableModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue Password events and slots to forward from the Vueform adapter to the
 * underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change'],
  slots: [
    'header',
    'footer',
    'content',
    'hideicon',
    'maskicon',
    'showicon',
    'unmaskicon',
    'clearicon',
  ],
} as const

/**
 * Builds the password factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends PasswordProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<PasswordEmits>
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
 * Default prop values for the password blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<PasswordProps>()({
  type: 'password',
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
