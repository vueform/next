```ts
/**
 * Defines a feature factory (make*) with automatic type inference and optional
 * config.
 *
 * @param factory The feature factory: takes the optional config and returns
 *   the feature function.
 */
function defineFeature<
  C extends any,
  T extends Record<string, any>,
  R extends Record<string, any>,
>(factory: (config?: C) => (options: T) => R): typeof factory

/**
 * Defines a feature factory (make*) with automatic type inference and required
 * config.
 *
 * @param factory The feature factory: takes the required config and returns
 *   the feature function.
 */
function defineFeature<
  C extends any,
  T extends Record<string, any>,
  R extends Record<string, any>,
>(factory: (config: C) => (options: T) => R): typeof factory

/**
 * Defines a feature factory (make*) with an explicit output type.
 *
 * @param factory The feature factory implementation, cast to the explicit
 *   signature `F`.
 */
function defineFeature<F extends (...args: any[]) => any>(
  factory: (...args: any[]) => any
): F
```
