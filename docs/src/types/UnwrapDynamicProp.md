```ts
/**
 * Extracts the underlying value type from a `DProp`.
 */
type UnwrapDynamicProp<D> = [Extract<D, Ref<any>>] extends [never]
  ? Exclude<D, undefined>
  : [Extract<D, Ref<any>>] extends [Ref<infer T>]
    ? T
    : Exclude<D, undefined>
```
