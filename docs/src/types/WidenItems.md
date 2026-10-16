```ts
/**
 * Recursively widens an `items` shape: literal scalars become primitives,
 * readonly arrays / tuples become mutable arrays, and object item prop values
 * are widened (keys are preserved, so record-map models and `itemValue` key
 * lookups keep working).
 *
 * Schema `items` are const-narrowed by `defineSchema`'s `const` type parameter
 * (indistinguishable from an explicit `as const`), which would otherwise lock
 * `modelValue` / `default` — and the element's `model` — to the exact item
 * literals. Registry-entry consumers widen instead: `items: [1, 2, 3]` yields a
 * `number` model, not `1 | 2 | 3`.
 */
type WidenItems<T> = T extends (...args: any) => any
  ? T
  : T extends readonly (infer E)[]
    ? WidenItems<E>[]
    : T extends object
      ? { -readonly [K in keyof T]: WidenItems<T[K]> }
      : WidenLiteral<T>
```
