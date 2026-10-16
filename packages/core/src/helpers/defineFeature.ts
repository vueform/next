/**
 * Options object passed to a feature's inner function.
 */
export type FeatureContext<
  Props extends Record<string, any> = Record<string, any>,
  Deps extends Record<string, any> = {},
  Events = unknown,
> = {
  props: Props
  deps: Deps
  events: Events
}

/**
 * Defines a feature factory (make*) with automatic type inference and optional
 * config.
 *
 * @private
 * @param factory The feature factory: takes the optional config and returns
 *   the feature function.
 */
export function defineFeature<
  C extends any,
  T extends Record<string, any>,
  R extends Record<string, any>,
>(factory: (config?: C) => (options: T) => R): typeof factory

/**
 * Defines a feature factory (make*) with automatic type inference and required
 * config.
 *
 * @private
 * @param factory The feature factory: takes the required config and returns
 *   the feature function.
 */
export function defineFeature<
  C extends any,
  T extends Record<string, any>,
  R extends Record<string, any>,
>(factory: (config: C) => (options: T) => R): typeof factory

/**
 * Defines a feature factory (make*) with an explicit output type.
 *
 * @private
 * @param factory The feature factory implementation, cast to the explicit
 *   signature `F`.
 */
export function defineFeature<F extends (...args: any[]) => any>(
  factory: (...args: any[]) => any
): F

export function defineFeature(factory: any) {
  return factory
}
