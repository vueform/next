```ts
/**
 * Extracts the underlying value type from a `DProp` by unwrapping its `Ref`
 * member — the only union member where the value type appears alone. Falls back
 * to the type itself for non-dynamic values.
 */
type UnwrapDynamicProp<D> = [Extract<D, Ref<any>>] extends [never]
  ? Exclude<D, undefined>
  : [Extract<D, Ref<any>>] extends [Ref<infer T>]
    ? T
    : Exclude<D, undefined>
```
