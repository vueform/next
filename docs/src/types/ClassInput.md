```ts
/**
 * Loosens a single class definition value so that functional class keys also
 * accept a plain `ClassValue`. Functional class keys additionally accept a
 * function whose last parameter is the component context.
 */
type ClassInput<V, TContext = any> = V extends (...args: infer A) => ClassValue
  ? | ClassValue
    | ((...args: A) => ClassValue)
    | ((...args: [...A, context$: TContext]) => ClassValue)
  : ClassValue | ((context$: TContext) => ClassValue)
```
