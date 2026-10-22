```ts
/**
 * The `$expression.whitelist` option: the prop keys that resolve expressions.
 * String members match the key exactly, except that a `*` spans any characters
 * (`'*'` matches every key, `'*Label'` / `'label*'` match any key ending /
 * starting with the rest); RegExp members are tested as written (anchor them
 * yourself, e.g. `/^label$/`).
 */
type ExpressionWhitelistProp = (string | RegExp)[]
```
