```ts
/**
 * Keys a Standard Schema to a schema object or ref in the shared side-table,
 * for `getAttachedValidationSchema` to find. Internal plumbing shared with
 * `defineComputedSchema`.
 *
 * @param schema The schema object or ref to key the Standard Schema by.
 * @param validationSchema The Standard Schema to attach.
 */
function attachValidationSchema(
  schema: object,
  validationSchema: StandardSchemaV1
): void
```
