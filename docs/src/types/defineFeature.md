```ts
/**
 * Defines a feature factory (make*) with automatic type inference and optional
 * config.
 */
function defineFeature<
  C extends any,
  T extends Record<string, any>,
  R extends Record<string, any>,
>(factory: (config?: C) => (options: T) => R): typeof factory

/**
 * Defines a feature factory (make*) with automatic type inference and required
 * config.
 */
function defineFeature<
  C extends any,
  T extends Record<string, any>,
  R extends Record<string, any>,
>(factory: (config: C) => (options: T) => R): typeof factory

/**
 * Defines a feature factory (make*) with an explicit output type. Use when the
 * feature needs a generic or overloaded call signature that can't be inferred
 * automatically.
 */
function defineFeature<F extends (...args: any[]) => any>(
  factory: (...args: any[]) => any
): F
```
