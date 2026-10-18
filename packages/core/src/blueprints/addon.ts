import { computed } from 'vue'

import { useExpression, useLocale, useSecurity } from '#src/composables'
import { defineDefaults, resolveAddon, type DefineEvents } from '#src/helpers'
import type {
  BaseComponentEmits,
  BaseComponentProps,
  BaseComponentParts,
  BaseComponentSlots,
  BaseComponentClasses,
  BaseComponentExpose,
  BaseComponentA11y,
  BaseComponentModifiers,
  AddonItem,
  LooseRequired,
} from '#src/types'

/**
 * Props for the addon component blueprint.
 */
export interface AddonProps<
  S = AddonSlots,
  P = AddonParts,
  C = AddonClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The addon content — a text value or an element schema tuple.
   */
  addon?: AddonItem
}

/**
 * Events emitted by the addon component.
 */
export interface AddonEmits<
  TContext = any,
> extends BaseComponentEmits<TContext> {}

/**
 * Slots of the addon component.
 */
export interface AddonSlots<
  TContext = any,
> extends BaseComponentSlots<TContext> {}

/**
 * Parts of the addon component.
 */
export interface AddonParts extends BaseComponentParts {}

/**
 * CSS classes of the addon component.
 */
export interface AddonClasses extends BaseComponentClasses {}

/**
 * Styling modifiers of the addon component.
 */
export interface AddonModifiers extends BaseComponentModifiers {}

/**
 * Accessibility bindings of the addon component.
 */
export interface AddonA11y extends BaseComponentA11y {}

/**
 * Augmentable public API surface for addon-based components.
 */
export interface AddonExpose extends BaseComponentExpose, AddonApi {}

/**
 * Factory API produced by the addon blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type AddonApi<TProps extends AddonProps = AddonProps> = ReturnType<
  typeof blueprint<TProps>
>

/**
 * Builds the addon factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends AddonProps>(
  props: LooseRequired<TProps>,
  _events: DefineEvents<AddonEmits>
) {
  const $security = useSecurity()
  const { localize } = useLocale()
  const expression = useExpression()

  /**
   * Resolves the addon prop into a sanitized text string or a dynamic component
   * descriptor (`{ component, props }`) for rendering.
   */
  const resolved = computed(() =>
    resolveAddon(
      props.addon,
      {
        localize,
        expression,
      },
      { $security }
    )
  )

  return {
    resolved,
  }
}

/**
 * Default prop values for the addon blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<AddonProps>()({})
