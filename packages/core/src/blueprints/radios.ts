import { useFeatures } from '@core/composables'
import {
  makeElement,
  makeInteraction,
  makeDisabled,
  makeItems,
  makeData,
  makeRadiosAria,
  makeHolderProvider,
  makeLayout,
  type DisabledProps,
  type ModelPropsWithDefault,
  type BaseElementEmits,
  type BaseElementProps,
  type ValidationProps,
  type ContainerProps,
  type BaseElementParts,
  type BaseElementClasses,
  type BaseElementExpose,
  type BaseElementSlots,
  type ItemsProps,
  type ItemsModelProp,
  type ItemValueProp,
  type GroupChildrenProp,
  type StackedProps,
  type LayoutProps,
  type ModelEmits,
  type InteractionEmits,
  type ValidationEmits,
  type AlignedProps,
  type ItemsProp,
  type ItemsModelApi,
} from '@core/features'
import { defineDefaults, type DefineEvents } from '@core/helpers'
import type { LooseRequired } from '@core/types'

/**
 * Plain props type for the radios element blueprint — the widest instantiation
 * of `RadiosProps`. Use this whenever "the props of a radios" is meant without
 * generic narrowing; it also serves as the constraint for `blueprint` /
 * `RadiosApi` type parameters.
 */
type LooseRadiosProps = RadiosProps<
  string,
  ItemsProp,
  ItemValueProp,
  GroupChildrenProp
>

/**
 * Generic props interface for the radios element blueprint, parameterized by
 * the item-driving type arguments. Reach for `LooseRadiosProps` instead when no
 * narrowing is needed.
 */
export interface RadiosProps<
  T extends string = 'radios',
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
  S = RadiosSlots,
  P = RadiosParts,
  C = RadiosClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ModelPropsWithDefault<
      ItemsModelProp<
        TItems,
        TItemValueKey,
        TGroupChildren,
        false,
        TModel,
        TItemValueReturn
      >,
      TContext
    >,
    ValidationProps<TContext>,
    ContainerProps,
    DisabledProps<TContext>,
    ItemsProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TItemValueReturn,
      TContext
    >,
    StackedProps,
    AlignedProps {}

/**
 * Events emitted by the radios element.
 */
export interface RadiosEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext> {}

/**
 * Slots available on the radios element blueprint.
 */
export interface RadiosSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the radios element blueprint.
 */
export interface RadiosParts extends BaseElementParts {}

/**
 * CSS classes for the radios element blueprint.
 */
export interface RadiosClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for radios-based components.
 */
export interface RadiosExpose extends BaseElementExpose, RadiosApi {}

/**
 * Factory API produced by the radios blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `RadiosApi<VfRadiosProps<typeof items, 'id'>>`). Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose / Context
 * layers, extensions).
 */
export type RadiosApi<TProps extends LooseRadiosProps = LooseRadiosProps> =
  ItemsModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * Builds the radios factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`. Passing `blueprint` as a value lets call-site
 * inference instantiate the API at the SFC's concrete props — the only
 * alternative to a per-blueprint wrapper hosting `typeof blueprint<TProps>`,
 * since conditional-type inference on a captured factory erases its type
 * parameters to constraints (verified empirically).
 */
export function blueprint<TProps extends LooseRadiosProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<RadiosEmits>
) {
  return useFeatures(props, events)
    .use(makeElement())
    .use(makeLayout())
    .use(makeInteraction())
    .use(makeDisabled())
    .use(makeData())
    .use(makeItems({ multiple: false }))
    .use(makeRadiosAria())
    .use(
      makeHolderProvider({
        multiple: false,
        valueProp: 'radioValue',
      })
    )
    .build()
}

/**
 * Default prop values for the radios blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<RadiosProps>()({
  type: 'radios',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
})
