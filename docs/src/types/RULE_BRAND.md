```ts
/**
 * Brand on `createRule` results so the validation compiler can distinguish them
 * from other callables (ArkType schemas, plain functions). Registered via
 * `Symbol.for` so rules created by a duplicated copy of core (e.g. a library
 * bundling its own) are still recognized.
 */
const RULE_BRAND: typeof RULE_BRAND
```
