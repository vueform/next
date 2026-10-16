```ts
/**
 * `Required`, guarded for model types that mapped types can't process
 * member-wise: `null` / `undefined` and arrays pass through, and so does a
 * model whose `keyof` collapsed to `never` — the `NoInfer`-wrapped wide model
 * union, which blocks both mapped-type and conditional-type distribution and
 * would otherwise become `{}`.
 */
type RequiredModelOf<M> = M extends null | undefined
  ? M
  : M extends readonly any[]
    ? M
    : [keyof M] extends [never]
      ? M
      : Required<M>
```
