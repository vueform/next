```ts
/**
 * Recursively makes all properties of an object type readonly, including nested
 * objects and arrays.
 */
type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends any[]
    ? ReadonlyArray<DeepReadonly<T[number]>>
    : T extends Record<string, any>
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T
```
