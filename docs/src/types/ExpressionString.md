```ts
/**
 * A string containing a `{...}` expression, accepted by expressionable props
 * (e.g. `default: '{source}'`) and resolved by the expression module at
 * runtime.
 */
type ExpressionString = `${string}{${string}}${string}`
```
