```ts
type RawConditionsProp<TContext = any> =
  | string // expression
  | boolean // static boolean
  | Ref<boolean> // reactive boolean
  | ((context$: TContext) => boolean | Promise<boolean>)
  | readonly StructuredCondition[] // AND types
  | readonly (readonly StructuredCondition[])[]
```
