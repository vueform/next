```ts
/**
 * `defineSchema` counterpart for reactive schemas: takes a getter and returns
 * it wrapped in a `computed`, so schemas built from reactive sources stay live.
 * The same validation and `const`-narrowing apply to the getter's return value.
 *
 * @param schema A getter producing the form schema from reactive sources.
 * @param validationSchema Optional Standard Schema validated against the whole
 *   form model, attached to the computed ref for automatic pickup.
 */
function defineComputedSchema<
  const S extends (ObjectSchema | ArraySchema) & ExactValidatedSchema<S>,
  Z extends StandardSchemaV1 = StandardSchemaV1,
>(
  schema: () => S,
  validationSchema?: Z & MatchesSchemaModel<S, Z>
): ComputedRef<S>
```
