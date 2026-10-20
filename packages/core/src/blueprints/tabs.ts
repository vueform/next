import { type Pager } from '#src/composables'
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
 * Props for the tabs component blueprint.
 */
export interface TabsProps<
  S = TabbedSlots,
  P = TabbedParts,
  C = TabsClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The pager instance managing tab navigation.
   */
  pager: Pager
}

/**
 * Events emitted by the tabs component.
 */
export interface TabsEmits<
  TContext = any,
> extends BaseComponentEmits<TContext> {}

/**
 * Slots of the tabs component.
 */
export interface TabbedSlots<
  TContext = any,
> extends BaseComponentSlots<TContext> {}

/**
 * Parts of the tabs component.
 */
export interface TabbedParts extends BaseComponentParts {}

/**
 * CSS classes of the tabs component.
 */
export interface TabsClasses extends BaseComponentClasses {}

/**
 * Augmentable part-keyed binding definitions (a11y, state markers, and
 * other per-part attrs) of the tabs blueprint.
 */
export interface TabsBindings extends BaseComponentBindings {}

/**
 * Augmentable public API surface for tabs-based components.
 */
export interface TabsExpose extends BaseComponentExpose, TabsApi {}

/**
 * Factory API produced by the tabs blueprint's `blueprint` function, optionally
 * parameterized by concrete props. Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites.
 */
export type TabsApi<TProps extends TabsProps = TabsProps> = ReturnType<
  typeof blueprint<TProps>
>

/**
 * Builds the tabs container factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends TabsProps>(
  _props: LooseRequired<TProps>,
  _events: DefineEvents<TabsEmits>
) {
  return {}
}

/**
 * Default prop values for the tabs blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<TabsProps>()({})
