import { defineDefaults, type DefineEvents } from '~/helpers'
import type {
  BaseComponentEmits,
  BaseComponentProps,
  BaseComponentParts,
  BaseComponentSlots,
  BaseComponentExpose,
  BaseComponentClasses,
  LooseRequired,
} from '~/types'

/**
 * Props for the icon component blueprint.
 */
export interface IconProps<
  S = IconSlots,
  P = IconParts,
  C = IconClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The icon class string to render.
   */
  icon?: string
}

/**
 * Events emitted by the icon component.
 */
export interface IconEmits<
  TContext = any,
> extends BaseComponentEmits<TContext> {}

/**
 * Slots of the icon component.
 */
export interface IconSlots<
  TContext = any,
> extends BaseComponentSlots<TContext> {}

/**
 * Parts of the icon component.
 */
export interface IconParts extends BaseComponentParts {}

/**
 * CSS classes of the icon component.
 */
export interface IconClasses extends BaseComponentClasses {}

/**
 * Augmentable public API surface for icon-based components.
 */
export interface IconExpose extends BaseComponentExpose, IconApi {}

/**
 * Factory API produced by the icon blueprint's `blueprint` function, optionally
 * parameterized by concrete props. Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites.
 */
export type IconApi<TProps extends IconProps = IconProps> = ReturnType<
  typeof blueprint<TProps>
>

/**
 * Builds the icon factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends IconProps>(
  _props: LooseRequired<TProps>,
  _events: DefineEvents<IconEmits>
) {
  return {}
}

/**
 * Default prop values for the icon blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<IconProps>()({})
