import type { Ref } from 'vue'

import type { Prettify } from '#src/types'

/**
 * Resolves the narrowed element `type` literal from the props, falling back to
 * the factory result's own `type`.
 */
type ResolveElementTypeValue<Result, Props> = Props extends { type: infer T }
  ? [Extract<NonNullable<T>, string>] extends [never]
    ? Result extends { type: Ref<infer RT> }
      ? RT
      : string
    : Extract<NonNullable<T>, string>
  : Result extends { type: Ref<infer RT> }
    ? RT
    : string

/**
 * Resolves the element type string from props or factory result.
 */
type ResolveElementType<Result, Props> = Omit<Result, 'type'> & {
  type: Ref<ResolveElementTypeValue<Result, Props>>
}

/**
 * One composable step in a `useFeatures` chain.
 */
type FeatureSlot<P, E, D, R> = (o: {
  props: P
  events: NoInfer<E>
  deps: D
}) => R

/**
 * Fluent factory chain. Each `.use()` adds one composable whose return is
 * merged into the accumulator; `.build()` returns the merged API.
 */
type FeatureBuilder<
  P,
  E,
  Acc extends Record<string, any> = {},
  I extends Record<string, any> = {},
> = {
  /**
   * Runs a composable with the current accumulated deps and merges its return
   * into the chain.
   *
   * @param fn Factory composable receiving `props`, `events`, and `deps`.
   */
  use: <R extends Record<string, any>>(
    fn: FeatureSlot<P, E, I & Acc, R>
  ) => FeatureBuilder<P, E, Acc & R, I>

  /**
   * Returns the merged factory API.
   */
  build: () => Prettify<ResolveElementType<Acc, P>> & I
}

/**
 * Starts a factory chain that merges composables via `.use(…)` and returns the
 * API with `.build()`. Each `.use()` receives the accumulated results of all
 * previous steps as `deps`.
 *
 * @private
 * @param props The component's props to pass to each composable.
 * @param events The component's events to pass to each composable.
 */
export function useFeatures<P, E>(props: P, events: E): FeatureBuilder<P, E>

/**
 * Starts a factory chain seeded with `initial` deps.
 *
 * @private
 * @param props The component's props to pass to each composable.
 * @param events The component's events to pass to each composable.
 * @param initial Dependencies used as the starting accumulator value.
 */
export function useFeatures<P, E, I extends Record<string, any>>(
  props: P,
  events: E,
  initial: I
): FeatureBuilder<P, E, {}, I>

export function useFeatures(
  props: any,
  events: any,
  initial: Record<string, any> = {}
): FeatureBuilder<any, any, any, any> {
  let deps: Record<string, any> = { ...initial }

  const builder: FeatureBuilder<any, any, any, any> = {
    use(fn) {
      deps = {
        ...deps,
        ...fn({
          props,
          events,
          deps,
        }),
      }
      return builder
    },
    build() {
      return deps
    },
  }

  return builder
}
