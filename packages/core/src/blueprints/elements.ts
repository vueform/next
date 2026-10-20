import { defineDefaults, type DefineEvents } from '#src/helpers'
import type {
  BaseComponentEmits,
  BaseComponentProps,
  BaseComponentParts,
  BaseComponentSlots,
  BaseComponentExpose,
  BaseComponentClasses,
  BaseComponentBindings,
  LooseRequired,
} from '#src/types'

/**
 * Props for the elements component blueprint.
 */
export interface ElementsProps<
  S = ElementsSlots,
  P = ElementsParts,
  C = ElementsClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {}

/**
 * Events emitted by the elements component.
 */
export interface ElementsEmits<
  TContext = any,
> extends BaseComponentEmits<TContext> {}

/**
 * Slots of the elements component.
 */
export interface ElementsSlots<
  TContext = any,
> extends BaseComponentSlots<TContext> {}

/**
 * Parts of the elements component.
 */
export interface ElementsParts extends BaseComponentParts {}

/**
 * CSS classes of the elements component.
 */
export interface ElementsClasses extends BaseComponentClasses {}

/**
 * Augmentable part-keyed binding definitions (a11y, state markers, and
 * other per-part attrs) of the elements blueprint.
 */
export interface ElementsBindings extends BaseComponentBindings {}

/**
 * Augmentable public API surface for elements-based components.
 */
export interface ElementsExpose extends BaseComponentExpose, ElementsApi {}

/**
 * Factory API produced by the elements blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type ElementsApi<TProps extends ElementsProps = ElementsProps> =
  ReturnType<typeof blueprint<TProps>>

/**
 * Builds the elements container factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends ElementsProps>(
  _props: LooseRequired<TProps>,
  _events: DefineEvents<ElementsEmits>
) {
  return {}
}

/**
 * Default prop values for the elements blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<ElementsProps>()({})
