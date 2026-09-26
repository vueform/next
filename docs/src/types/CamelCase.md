```ts
/**
 * Camel-cases an identifier: lowers the first character and collapses `-` / `_`
 * separators (`update-model-value` → `updateModelValue`).
 */
type CamelCase<S extends string> = CamelCaseJoin<Uncapitalize<S>>
```
