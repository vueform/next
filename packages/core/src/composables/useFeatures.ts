import type { Ref } from 'vue'

import type { Prettify } from '#src/types'

/**
 * Resolves the narrowed element `type` literal from the props, falling back to
 * the factory result's own `type` (or `string`) when the props don't carry a
 * usable string literal.
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
 * Resolves the element type string from props or factory result. The narrowing
 * conditional is kept inside the `type` field instead of wrapping the whole
 * object, so the surrounding API type stays a concrete intersection and remains
 * inspectable even when instantiated with a still-generic `Props` (e.g. when a
 * blueprint is composed across a package boundary through its built `.d.ts`).
 */
type ResolveElementType<Result, Props> = Omit<Result, 'type'> & {
  type: Ref<ResolveElementTypeValue<Result, Props>>
}

/**
 * One composable step in a `useFeatures` chain.
 *
 * Props are checked as `P` directly (blueprints pass `LooseRequired<TProps>` /
 * `useProps` output, so required-key factory constraints like `template: T |
 * undefined` still apply).
 *
 * `NoInfer` on events keeps that position from poisoning inference of `P`.
 *
 * Factories that do not use props/deps in their return type should declare
 * concrete `MakeXOptions` (not unused `P`/`D` generics). Only prop-dependent
 * returns (e.g. `MakeItemsReturn<P>`) need a generic `P`.
 */
type FeatureSlot<P, E, D, R> = (o: {
  props: P
  events: NoInfer<E>
  deps: D
}) => R

/**
 * Fluent factory chain. Each `.use()` adds one composable whose return is
 * merged into the accumulator; `.build()` returns the merged API.
 *
 * `Acc` is the intersection of factory returns (fed through
 * `ResolveElementType`). `I` is the optional `initial` seed, intersected onto
 * the final result at the top level so unresolved generics on the seed cannot
 * collapse the inferred API.
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
 * API with `.build()`.
 *
 * Each `.use()` receives the accumulated results of all previous steps (plus
 * `initial` when provided) as `deps`, so factories can declare
 * props/deps/events requirements and prop-dependent returns (e.g.
 * `MakeItemsReturn<P>`) stay intact.
 *
 * @private
 * @example
 *   ;```ts
 *   return useFeatures(props, events)
 *     .use(makeElement())
 *     .use(makeLayout())
 *     .use(makeData())
 *     .build()
 *   ```
 *
 * @param props The component's props to pass to each composable.
 * @param events The component's events to pass to each composable.
 */
export function useFeatures<P, E>(props: P, events: E): FeatureBuilder<P, E>

/**
 * Starts a factory chain seeded with `initial` deps. Seed members are passed to
 * the first `.use()` as `deps` and are included in `.build()`'s return type at
 * the top level (not through `type`-narrowing).
 *
 * @private
 * @example
 *   ;```ts
 *   return useFeatures(props, events, { nullValue, multiple: true })
 *     .use(makeElement())
 *     .use(makeData())
 *     .use(makeItems({ multiple: true }))
 *     .build()
 *   ```
 *
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
