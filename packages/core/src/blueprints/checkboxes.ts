import { ref } from 'vue'
import type { LooseRequired } from '#core/types'
import { useFeatures } from '#core/composables'
import {
  makeElement,
  makeInteraction,
  makeDisabled,
  makeItems,
  makeData,
  makeCheckboxesAria,
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
} from '#core/features'
import { defineDefaults, type DefineEvents } from '#core/helpers'

/**
 * Plain props type for the checkboxes element blueprint — the widest
 * instantiation of `CheckboxesProps`. Use this whenever "the props of a
 * checkboxes" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `CheckboxesApi` type parameters.
 */
type LooseCheckboxesProps = CheckboxesProps<
  string,
  ItemsProp,
  ItemValueProp,
  GroupChildrenProp
>

/**
 * Generic props interface for the checkboxes element blueprint, parameterized
 * by the item-driving type arguments. Reach for `LooseCheckboxesProps` instead
 * when no narrowing is needed.
 */
export interface CheckboxesProps<
  T extends string = 'checkboxes',
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
  S = CheckboxesSlots,
  P = CheckboxesParts,
  C = CheckboxesClasses,
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
        true,
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
 * Events emitted by the checkboxes element.
 */
export interface CheckboxesEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext> {}

/**
 * Slots available on the checkboxes element blueprint.
 */
export interface CheckboxesSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the checkboxes element blueprint.
 */
export interface CheckboxesParts extends BaseElementParts {}

/**
 * CSS classes for the checkboxes element blueprint.
 */
export interface CheckboxesClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for checkboxes-based components.
 */
export interface CheckboxesExpose extends BaseElementExpose, CheckboxesApi {}

/**
 * Factory API produced by the checkboxes blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `CheckboxesApi<VfCheckboxesProps<typeof items, 'id'>>`). Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose / Context
 * layers, extensions).
 */
export type CheckboxesApi<
  TProps extends LooseCheckboxesProps = LooseCheckboxesProps,
> = ItemsModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * Builds the checkboxes factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`. Passing `blueprint` as a value lets call-site
 * inference instantiate the API at the SFC's concrete props — the only
 * alternative to a per-blueprint wrapper hosting `typeof blueprint<TProps>`,
 * since conditional-type inference on a captured factory erases its type
 * parameters to constraints (verified empirically).
 */
export function blueprint<TProps extends LooseCheckboxesProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<CheckboxesEmits>
) {
  return useFeatures(props, events, {
    nullValue: ref([]),
    multiple: true,
  })
    .use(makeElement())
    .use(makeLayout())
    .use(makeInteraction())
    .use(makeDisabled())
    .use(makeData())
    .use(makeItems({ multiple: true }))
    .use(makeCheckboxesAria())
    .use(
      makeHolderProvider({
        multiple: true,
        valueProp: 'trueValue',
      })
    )
    .build()
}

/**
 * Default prop values for the checkboxes blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<CheckboxesProps>()({
  type: 'checkboxes',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
})
