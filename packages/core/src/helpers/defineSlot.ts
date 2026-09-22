import {
  defineComponent,
  markRaw,
  type ComponentPropsOptions,
  type ComponentPublicInstance,
  type VNodeChild,
} from 'vue'
import type { SlotProps } from '~/types'

/**
 * Readonly map from selected slot prop names to their types for the given
 * component and slot.
 */
type PropOptions<
  C extends keyof SlotProps,
  S extends keyof SlotProps[C],
  P extends (keyof SlotProps[C][S])[],
> = Readonly<{ [K in P[number]]: SlotProps[C][S][K] }>

/**
 * Component options accepted by `defineSlot`, with the `setup` first argument
 * and Options API `this` narrowed to only the declared props.
 */
type SlotOptions<
  C extends keyof SlotProps,
  S extends keyof SlotProps[C],
  P extends (keyof SlotProps[C][S])[],
> = {
  props?: P
  setup?: (
    props: PropOptions<C, S, P>
  ) => (() => VNodeChild) | Record<string, unknown>
  template?: string
  render?: (this: PropOptions<C, S, P>) => VNodeChild
  components?: Record<string, unknown>
  [key: string]: unknown
} & ThisType<ComponentPublicInstance<PropOptions<C, S, P>>>

/**
 * Defines a typed slot component for a specific Vueform component slot with
 * type-safe props.
 *
 * @param path The host component and slot, as `VfName.slotName`.
 * @param options Vue component options including the list of slot props to
 *   receive.
 */
export function defineSlot<
  C extends keyof SlotProps & string,
  S extends keyof SlotProps[C] & string,
  P extends (keyof SlotProps[C][S])[] = [],
>(_path: `${C}.${S}`, options: SlotOptions<C, S, P>) {
  return markRaw(
    defineComponent({
      ...(options as Record<string, unknown>),
      props: (options.props ?? []) as ComponentPropsOptions,
      inheritAttrs: false,
    })
  )
}
