```ts
type CamelCaseJoin<S extends string> = S extends `${infer A}-${infer B}`
  ? CamelCaseJoin<`${A}${Capitalize<B>}`>
  : S extends `${infer A}_${infer B}`
    ? CamelCaseJoin<`${A}${Capitalize<B>}`>
    : S
```
