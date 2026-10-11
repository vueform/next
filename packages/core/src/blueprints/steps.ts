import { type Pager } from '#src/composables'
import { defineDefaults, type DefineEvents } from '#src/helpers'
import type {
  BaseComponentEmits,
  BaseComponentProps,
  BaseComponentParts,
  BaseComponentSlots,
  BaseComponentExpose,
  BaseComponentClasses,
  LooseRequired,
} from '#src/types'

/**
 * Props for the steps component blueprint.
 */
export interface StepsProps<
  S = StepsSlots,
  P = StepsParts,
  C = StepsClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The pager instance managing multi-step form navigation.
   */
  pager: Pager
}

/**
 * Events emitted by the steps component.
 */
export interface StepsEmits<
  TContext = any,
> extends BaseComponentEmits<TContext> {}

/**
 * Slots of the steps component.
 */
export interface StepsSlots<
  TContext = any,
> extends BaseComponentSlots<TContext> {}

/**
 * Parts of the steps component.
 */
export interface StepsParts extends BaseComponentParts {}

/**
 * CSS classes of the steps component.
 */
export interface StepsClasses extends BaseComponentClasses {}

/**
 * Augmentable public API surface for steps-based components.
 */
export interface StepsExpose extends BaseComponentExpose, StepsApi {}

/**
 * Factory API produced by the steps blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type StepsApi<TProps extends StepsProps = StepsProps> = ReturnType<
  typeof blueprint<TProps>
>

/**
 * Builds the steps container factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends StepsProps>(
  _props: LooseRequired<TProps>,
  _events: DefineEvents<StepsEmits>
) {
  return {}
}

/**
 * Default prop values for the steps blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<StepsProps>()({})
