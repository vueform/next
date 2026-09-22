```ts
type AddonProp<TContext = any> =
  | string
  | (Record<string, string> & { type?: never })
  | AddonSchema
  | AddonItem[]
  | ((context$: TContext) => string | Record<string, string> | AddonItem[])
```
