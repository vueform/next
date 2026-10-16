```ts
/**
 * Returns the Standard Schema attached to a schema (or schema ref) via
 * `defineSchema` / `defineComputedSchema`'s second argument, if any.
 *
 * @param schema The schema object or ref to look up.
 */
function getAttachedValidationSchema(
  schema: unknown
): StandardSchemaV1 | undefined
```
