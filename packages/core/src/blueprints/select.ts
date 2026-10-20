import { useFeatures } from '#src/composables'
import {
  makeAddons,
  makeData,
  makeElement,
  makeIcons,
  makeInteraction,
  makeDisabled,
  makeItems,
  makePlaceholder,
  makeInput,
  makeProvider,
  makeLayout,
  makeLoading,
  type DisabledProps,
  type ModelPropsWithDefault,
  type AddonsProps,
  type IconsProps,
  type BaseElementEmits,
  type BaseElementProps,
  type ExpressionProps,
  type ValidationProps,
  type BaseFieldElementParts,
  type BaseElementClasses,
  type BaseElementBindings,
  type BaseElementSlots,
  type AddonableProps,
  type ItemsProps,
  type ItemsModelProp,
  type LoadingProps,
  type PlaceholderProps,
  type LayoutProps,
  type InteractionEmits,
  type InputEmits,
  type MultipleProps,
  type ValidationEmits,
  type ModelEmits,
  type ItemValueProp,
  type GroupChildrenProp,
  type ItemsProp,
  type BaseElementExpose,
  type ItemsModelApi,
} from '#src/features'
import { defineDefaults, type DefineEvents } from '#src/helpers'
import type { LooseRequired } from '#src/types'

/**
 * Plain props type for the select element blueprint — the widest instantiation
 * of `SelectProps`. Use this whenever "the props of a select" is meant without
 * generic narrowing; it also serves as the constraint for `blueprint` /
 * `SelectApi` type parameters.
 */
type LooseSelectProps = SelectProps<
  string,
  ItemsProp,
  ItemValueProp,
  GroupChildrenProp,
  boolean
>

/**
 * Generic props interface for the select element blueprint, parameterized by
 * the item-driving type arguments. Reach for `LooseSelectProps` instead when no
 * narrowing is needed.
 */
export interface SelectProps<
  T extends string = 'select',
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TItemValueReturn = unknown,
  S = SelectSlots,
  P = SelectParts,
  C = SelectClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefault<
      ItemsModelProp<
        TItems,
        TItemValueKey,
        TGroupChildren,
        TMultiple,
        TModel,
        TItemValueReturn
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
    ItemsProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TItemValueReturn,
      TContext
    >,
    MultipleProps<TMultiple> {}

/**
 * Events emitted by the select element.
 */
export interface SelectEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext>,
    InputEmits<any, TContext> {}

/**
 * Slots available on the select element blueprint.
 */
export interface SelectSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the select element blueprint.
 */
export interface SelectParts extends BaseFieldElementParts {}

/**
 * CSS classes for the select element blueprint.
 */
export interface SelectClasses extends BaseElementClasses {}

/**
 * Augmentable part-keyed binding definitions (a11y, state markers, and
 * other per-part attrs) of the select blueprint.
 */
export interface SelectBindings extends BaseElementBindings {}

/**
 * Augmentable public API surface for select-based components.
 */
export interface SelectExpose extends BaseElementExpose, SelectApi {}

/**
 * Factory API produced by the select blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `SelectApi<VfSelectProps<typeof items, 'id'>>`). Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose / Context
 * layers, extensions).
 */
export type SelectApi<TProps extends LooseSelectProps = LooseSelectProps> =
  ItemsModelApi<ReturnType<typeof blueprint>, TProps>

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
  return useFeatures(props, events)
    .use(makeElement())
    .use(makeLayout())
    .use(makeAddons())
    .use(makeIcons())
    .use(makeDisabled())
    .use(makeInteraction())
    .use(makePlaceholder())
    .use(makeData())
    .use(makeItems())
    .use(makeLoading())
    .use(makeInput())
    .use(makeProvider())
    .build()
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
