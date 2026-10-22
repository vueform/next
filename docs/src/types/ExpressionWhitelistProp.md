```ts
/**
 * The `$expression.whitelist` option: the prop keys that resolve expressions.
 * String members match the key exactly; RegExp members are tested as written
 * (anchor them yourself, e.g. `/^label$/`).
 */
type ExpressionWhitelistProp = (string | RegExp)[]
```
