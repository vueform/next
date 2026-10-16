```ts
/**
 * Whether `TOptions` is still the unconstrained `TreeOptionsProp` default.
 */
type IsDefaultTreeOptions<TOptions> = [TOptions] extends [TreeOptionsProp]
  ? [TreeOptionsProp] extends [TOptions]
    ? true
    : false
  : false
```
