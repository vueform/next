```ts
/**
 * Keys a Standard Schema to a schema object or ref in the shared side-table,
 * for `getAttachedValidationSchema` to find. Internal plumbing shared with
 * `defineComputedSchema`.
 */
function attachValidationSchema(
  schema: object,
  validationSchema: StandardSchemaV1
): void
```
