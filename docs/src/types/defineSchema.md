```ts
/**
 * Identity helper that validates and `const`-narrows a form schema so it can
 * drive type-level features. Each entry is validated against its registered
 * element's props, and an optional Standard Schema (Zod, Valibot, ArkType, …)
 * can be passed for form-level validation.
 *
 * @param schema The form schema in object or array notation.
 * @param validationSchema Optional Standard Schema validated against the whole
 *   form model, attached to the schema for automatic pickup.
 */
function defineSchema<
  const S extends (ObjectSchema | ArraySchema) & ExactValidatedSchema<S>,
  Z extends StandardSchemaV1 = StandardSchemaV1,
>(schema: S, validationSchema?: Z & MatchesSchemaModel<S, Z>): S
```
