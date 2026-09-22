```ts
/**
 * Removes `null` and `undefined` deeply from a model type and drops optional
 * modifiers. Validation-only (never surfaces as a model type): the compile-time
 * Standard Schema check compares structural shape only, because required-ness /
 * optionality is the runtime validator's concern and leaf element models are
 * nullable by design (e.g. a text model is `string | number | null`).
 */
type StripNullish<T> = T extends null | undefined
  ? never
  : T extends (...args: any) => any
    ? T
    : T extends readonly (infer E)[]
      ? StripNullish<E>[]
      : T extends Record<string, any>
        ? { [K in keyof T]-?: StripNullish<T[K]> }
        : T
```
