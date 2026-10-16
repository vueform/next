```ts
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
```
