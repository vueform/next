import type { LooseContext } from '@vueform/core'
import type { CamelCase } from 'type-fest'

/**
 * Picks the listed events from an emit interface and converts them to Vueform
 * event tuples with camelCased keys and `context$` appended as the last
 * argument.
 */
export type ForwardedEmits<
  TEmits,
  TKeys extends keyof TEmits = keyof TEmits,
  TContext = LooseContext,
> = {
  [K in TKeys as CamelCase<K & string>]: TEmits[K] extends (
    ...args: infer A
  ) => any
    ? [...A, context$: TContext]
    : [context$: TContext]
}

export type ForwardedSlots<
  TSlots,
  TKeys extends keyof TSlots = keyof TSlots,
> = {
  [K in TKeys]: TSlots[K]
}

/**
 * Replaces selected keys on a slot map while keeping the remaining forwarded
 * slots intact.
 */
export type OverrideSlots<TBase, TOverrides> = Omit<TBase, keyof TOverrides> &
  TOverrides

/**
 * Intersects a PrimeVue component's Props with all valid `pt:` shorthand
 * attributes (e.g. `pt:root:class`, `pt:pc-toggle-button:root:class`).
 *
 * @example
 *   ;```ts
 *   input: WithPtShorthands<PvSelectButtonProps>
 *   ```
 */
export type WithPtShorthands<Props extends { pt?: any }> = Props & {
  [key: `pt:${string}`]: any
}
